import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import crypto from "crypto";
import { Resend } from "resend";
import { render } from "@react-email/render";
import VerificationEmail from "@/components/emails/VerificationEmail";
import { getAppUrl } from "@/lib/app-url";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email address is required" },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({
      where: { email },
      select: { emailVerified: true, email: true },
    });

    if (user && !user.emailVerified) {
      const token = crypto.randomBytes(32).toString("hex");
      const expires = new Date(Date.now() + 15 * 60 * 1000);

      await db.$transaction([
        db.verificationToken.deleteMany({
          where: { identifier: email },
        }),
        db.verificationToken.create({
          data: { identifier: email, token, expires },
        }),
      ]);

      const verifyUrl = `${getAppUrl()}/verify-email/${token}`;
      console.log(`\n=== Verification URL (dev fallback) ===`);
      console.log(verifyUrl);
      console.log(`========================================\n`);

      const apiKey = process.env.RESEND_API_KEY;
      if (apiKey) {
        try {
          const resend = new Resend(apiKey);
          let emailHtml: string;
          try {
            emailHtml = await render(VerificationEmail({ token }));
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
          console.log(`Verification email resent successfully to ${email}`);
        } catch (emailError: unknown) {
          console.error("Failed to send verification email:", emailError);
        }
      } else {
        console.warn("RESEND_API_KEY not configured — verification email NOT sent via Resend.");
      }
    }

    return NextResponse.json(
      { message: "If an account exists with that email, you will receive a verification link shortly." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Resend error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
