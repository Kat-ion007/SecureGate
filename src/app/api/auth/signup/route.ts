import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcryptjs from "bcryptjs";
import { z } from "zod";
import crypto from "crypto";
import { Resend } from "resend";
import { render } from "@react-email/render";
import VerificationEmail from "@/components/emails/VerificationEmail";

const signupSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const parsedData = signupSchema.safeParse(body);
    if (!parsedData.success) {
      return NextResponse.json(
        { error: parsedData.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, email, password } = parsedData.data;

    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "A user with this email already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcryptjs.hash(password, 12);

    const result = await db.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: { name, email, password: hashedPassword },
      });

      const token = crypto.randomBytes(32).toString("hex");
      const expires = new Date(Date.now() + 15 * 60 * 1000);

      await tx.verificationToken.create({
        data: { identifier: email, token, expires },
      });

      return { user, token };
    });

    let emailSent = true;
    const verifyUrl = `${process.env.APP_URL || "http://localhost:3000"}/verify-email/${result.token}`;
    console.log(`\n=== Verification URL (dev fallback) ===`);
    console.log(verifyUrl);
    console.log(`========================================\n`);

    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey) {
      try {
        const resend = new Resend(apiKey);
        let emailHtml: string;
        try {
          emailHtml = await render(VerificationEmail({ token: result.token }));
        } catch (renderErr) {
          console.error("Email render failed:", renderErr);
          emailHtml = `<h1>Verify your email</h1><p>Click <a href="${verifyUrl}">here</a> to verify your email address.</p>`;
        }
        const sendResult = await resend.emails.send({
          from: process.env.RESEND_FROM || "SecureGate <onboarding@resend.dev>",
          to: email,
          subject: "Verify your email address",
          html: emailHtml,
        });
        console.log("Resend response:", JSON.stringify(sendResult));
        console.log(`Verification email sent successfully to ${email}`);
      } catch (emailError: unknown) {
        console.error("Failed to send verification email:", emailError);
        emailSent = false;
      }
    } else {
      console.warn("RESEND_API_KEY not configured — verification email NOT sent via Resend.");
      emailSent = false;
    }

    return NextResponse.json(
      {
        message: emailSent
          ? "User registered successfully. Verification email sent."
          : "Account created successfully, but the verification email could not be sent.",
        userId: result.user.id,
        emailSent,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

