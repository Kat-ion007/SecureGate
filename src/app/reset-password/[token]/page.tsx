import React from "react";
import { db } from "@/lib/db";
import Link from "next/link";
import ResetPasswordForm from "./ResetPasswordForm";

interface ResetPasswordPageProps {
  params: { token: string };
}

export default async function ResetPasswordPage({ params }: ResetPasswordPageProps) {
  const { token } = params;

  let valid = false;
  let tokenError = "";

  try {
    const resetToken = await db.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetToken) {
      tokenError = "Invalid or expired reset link. Please request a new one.";
    } else if (new Date() > new Date(resetToken.expires)) {
      tokenError = "This reset link has expired. Please request a new one.";
      await db.passwordResetToken.delete({
        where: { token },
      }).catch((err) => console.error("Failed to delete expired token:", err));
    } else {
      valid = true;
    }
  } catch (error) {
    console.error("Token validation error:", error);
    tokenError = "An unexpected error occurred. Please request a new reset link.";
  }

  if (!valid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-4">
        <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-2xl text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 mb-6">
            <svg
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-extrabold text-white mb-3">
            Invalid or Expired Link
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-8">
            {tokenError}
          </p>
          <Link
            href="/forgot-password"
            className="w-full block bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3.5 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all shadow-lg shadow-indigo-600/25 text-sm text-center"
          >
            Request New Reset Link
          </Link>
          <div className="mt-6">
            <Link
              href="/login"
              className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
            >
              Back to Log In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-4">
      <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">
            Reset Password
          </h1>
          <p className="text-slate-400 text-sm">
            Enter your new password below.
          </p>
        </div>
        <ResetPasswordForm token={token} />
      </div>
    </div>
  );
}
