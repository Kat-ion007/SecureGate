"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface ResetPasswordFormProps {
  token: string;
}

export default function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [strength, setStrength] = useState<"None" | "Weak" | "Fair" | "Strong">("None");

  useEffect(() => {
    if (!password) {
      setStrength("None");
      return;
    }

    if (password.length < 8) {
      setStrength("Weak");
    } else if (!/[0-9]/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
      setStrength("Fair");
    } else {
      setStrength("Strong");
    }
  }, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to reset password. Please try again.");
        setLoading(false);
        return;
      }

      router.push("/login?passwordReset=true");
    } catch {
      setError("A network error occurred. Please try again.");
      setLoading(false);
    }
  };

  const getStrengthColor = () => {
    switch (strength) {
      case "Weak":
        return "bg-red-500 w-1/3";
      case "Fair":
        return "bg-amber-500 w-2/3";
      case "Strong":
        return "bg-emerald-500 w-full";
      default:
        return "bg-gray-300 w-0";
    }
  };

  const getStrengthTextColor = () => {
    switch (strength) {
      case "Weak":
        return "text-red-500";
      case "Fair":
        return "text-amber-500";
      case "Strong":
        return "text-emerald-500";
      default:
        return "text-gray-400";
    }
  };

  return (
    <>
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg text-sm text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label
            className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2"
            htmlFor="password"
          >
            New Password
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full bg-slate-950/80 border border-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-lg px-4 py-3 text-white placeholder-slate-600 focus:outline-none transition-colors"
          />
          {strength !== "None" && (
            <div className="mt-3">
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="text-slate-400">Password Strength:</span>
                <span className={`font-semibold ${getStrengthTextColor()}`}>
                  {strength}
                </span>
              </div>
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className={`h-full transition-all duration-300 ${getStrengthColor()}`} />
              </div>
            </div>
          )}
        </div>

        <div>
          <label
            className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2"
            htmlFor="confirmPassword"
          >
            Confirm New Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full bg-slate-950/80 border border-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-lg px-4 py-3 text-white placeholder-slate-600 focus:outline-none transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg px-4 py-3.5 mt-2 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-600/20"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Resetting Password...</span>
            </>
          ) : (
            <span>Reset Password</span>
          )}
        </button>
      </form>

      <p className="text-center text-slate-400 text-sm mt-8">
        <Link
          href="/login"
          className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
        >
          Back to Log In
        </Link>
      </p>
    </>
  );
}
