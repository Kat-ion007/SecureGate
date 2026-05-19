"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";

function VerifyPendingContent() {
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    const paramEmail = searchParams.get("email");
    if (paramEmail) {
      setEmail(paramEmail);
    } else if (session?.user?.email) {
      setEmail(session.user.email);
    }

    if (searchParams.get("emailFailed") === "true") {
      setMessage({
        type: "error",
        text: "Your account was created, but the verification email could not be sent. Please use the form below to request a new one.",
      });
    }
  }, [searchParams, session]);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setMessage({ type: "error", text: "Please enter your email address." });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/auth/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({
          type: "success",
          text: "Verification email resent successfully! Please check your inbox.",
        });
      } else {
        setMessage({
          type: "error",
          text: data.error || "Failed to resend email. Please try again.",
        });
      }
    } catch {
      setMessage({
        type: "error",
        text: "A network error occurred. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
      {/* Decorative gradient overlay */}
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="text-center">
        {/* Envelope Icon */}
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 mb-6">
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
              d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
            />
          </svg>
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight text-white mb-3">
          Verify Your Email
        </h1>
        <p className="text-slate-400 text-sm mb-6 leading-relaxed">
          We have sent a secure verification link to your email address. Please click the link in the email to activate your account.
        </p>

        {email && (
          <div className="bg-slate-950/40 border border-slate-800/50 rounded-lg p-3 mb-6">
            <span className="text-xs text-slate-500 block uppercase tracking-wider mb-1 font-semibold">
              Recipient Address
            </span>
            <span className="text-sm font-medium text-slate-200 break-all">
              {email}
            </span>
          </div>
        )}

        {message && (
          <div
            className={`p-4 rounded-xl text-sm border mb-6 text-left animate-fadeIn ${
              message.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                : "bg-rose-500/10 border-rose-500/20 text-rose-400"
            }`}
          >
            <div className="flex">
              <svg
                className="h-5 w-5 mr-2.5 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                {message.type === "success" ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                )}
              </svg>
              <span>{message.text}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleResend} className="space-y-4">
          {!searchParams.get("email") && !session?.user?.email && (
            <div className="text-left">
              <label htmlFor="email" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Enter Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-slate-950/80 border border-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-lg px-4 py-3 text-white placeholder-slate-600 focus:outline-none transition-colors"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg px-4 py-3.5 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-600/20"
          >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Resending Link...</span>
                </>
              ) : (
                <span>Resend Verification Email</span>
              )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-800/60 flex flex-col space-y-3">
          <Link
            href="/login"
            className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
          >
            Return to Log In
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function VerifyPendingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col items-center justify-center p-6">
      <Suspense
        fallback={
          <div className="w-full max-w-md bg-slate-900/60 border border-slate-800/80 rounded-2xl p-8 shadow-2xl flex items-center justify-center">
            <svg className="animate-spin h-8 w-8 text-blue-500" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        }
      >
        <VerifyPendingContent />
      </Suspense>
    </div>
  );
}
