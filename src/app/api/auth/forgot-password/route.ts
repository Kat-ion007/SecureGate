import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import crypto from "crypto";
import { Resend } from "resend";
import { render } from "@react-email/render";
import PasswordResetEmail from "@/components/emails/PasswordResetEmail";
import { forgotPasswordRateLimit } from "@/lib/rate-limiter";
import { getAppUrl } from "@/lib/app-url";

export async function POST(req: Request) {
  try {
    const ip =
      (req.headers as unknown as Record<string, string>)["x-forwarded-for"]
        ?.split(",")[0]?.trim() ||
      (req.headers as unknown as Record<string, string>)["x-real-ip"] ||
      "unknown";

    const { success } = await forgotPasswordRateLimit.limit(ip);
    if (!success) {
      return NextResponse.json(
        { error: "Too many reset attempts. Please try again in 10 minutes." },
        { status: 429 }
      );
    }

    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email address is required" },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({
      where: { email },
      select: { email: true },
    });

    if (user) {
      const token = crypto.randomBytes(32).toString("hex");
      const expires = new Date(Date.now() + 60 * 60 * 1000);

      await db.$transaction([
        db.passwordResetToken.deleteMany({
          where: { email },
        }),
        db.passwordResetToken.create({
          data: { email, token, expires },
        }),
      ]);

      const resetUrl = `${getAppUrl()}/reset-password/${token}`;
      console.log(`\n=== Password Reset URL (dev fallback) ===`);
      console.log(resetUrl);
      console.log(`=========================================\n`);

      const apiKey = process.env.RESEND_API_KEY;
      if (apiKey) {
        try {
          const resend = new Resend(apiKey);
          let emailHtml: string;
          try {
            emailHtml = await render(PasswordResetEmail({ token }));
          } catch (renderErr) {
            console.error("Email render failed:", renderErr);
            emailHtml = `<h1>Reset your password</h1><p>Click <a href="${resetUrl}">here</a> to reset your password.</p>`;
          }
          const sendResult = await resend.emails.send({
            from: process.env.RESEND_FROM || "SecureGate <onboarding@resend.dev>",
            to: email,
            subject: "Reset your SecureGate password",
            html: emailHtml,
          });
          console.log("Resend response:", JSON.stringify(sendResult));
          console.log(`Password reset email sent successfully to ${email}`);
        } catch (emailError: unknown) {
          console.error("Failed to send password reset email:", emailError);
        }
      } else {
        console.warn("RESEND_API_KEY not configured — password reset email NOT sent via Resend.");
      }
    }

    return NextResponse.json(
      {
        message:
          "If an account exists with that email, you will receive a reset link shortly.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
