import React from "react";
import { db } from "@/lib/db";
import Link from "next/link";
import ResendButton from "./ResendButton";

interface VerifyEmailPageProps {
  params: {
    token: string;
  };
}

export default async function VerifyEmailPage({ params }: VerifyEmailPageProps) {
  const { token } = params;

  let status: "success" | "expired" | "invalid" = "invalid";
  let email = "";

  try {
    // Look up the token in the database
    const verificationToken = await db.verificationToken.findUnique({
      where: { token },
    });

    if (verificationToken) {
      email = verificationToken.identifier;
      const isExpired = new Date() > new Date(verificationToken.expires);

      if (isExpired) {
        status = "expired";
        // Clean up expired token
        await db.verificationToken.delete({
          where: { token },
        }).catch((err) => console.error("Failed to delete expired token:", err));
      } else {
        // Mark user verified and delete the token in a transaction
        await db.$transaction([
          db.user.update({
            where: { email: verificationToken.identifier },
            data: { emailVerified: new Date() },
          }),
          db.verificationToken.delete({
            where: { token },
          }),
        ]);
        status = "success";
      }
    }
  } catch (error) {
    console.error("Verification error:", error);
    status = "invalid";
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-8 shadow-2xl relative overflow-hidden text-center">
        {/* Decorative gradient overlay */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {status === "success" && (
          <div>
            {/* Success Shield Icon */}
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-6">
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
                  d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z"
                />
              </svg>
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight text-white mb-3">
              Email Verified
            </h1>
            <p className="text-slate-400 text-sm mb-8 leading-relaxed">
              Your email address has been successfully verified. You can now access all dashboard features.
            </p>

            <Link
              href="/login?verified=true"
              className="w-full block bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3.5 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all shadow-lg shadow-indigo-600/25 text-sm text-center"
            >
              Continue to Login
            </Link>
          </div>
        )}

        {status === "expired" && (
          <div>
            {/* Warning Icon */}
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 mb-6">
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

            <h1 className="text-3xl font-extrabold tracking-tight text-white mb-3">
              Link Expired
            </h1>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              The verification link you clicked has expired. Verification links are only valid for 15 minutes.
            </p>

            <ResendButton initialEmail={email} />
          </div>
        )}

        {status === "invalid" && (
          <div>
            {/* Error Icon */}
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
                  d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight text-white mb-3">
              Invalid Link
            </h1>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              The verification link is invalid, corrupted, or has already been used.
            </p>

            <ResendButton />
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-slate-800/60">
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
