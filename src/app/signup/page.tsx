"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { z } from "zod";

const signupSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

type FormErrors = {
  name?: string;
  email?: string;
  password?: string;
  general?: string;
};

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [strength, setStrength] = useState<"None" | "Weak" | "Fair" | "Strong">("None");

  // Calculate password strength
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
    setErrors({});
    setLoading(true);

    // Validate inputs with Zod
    const validation = signupSchema.safeParse({ name, email, password });
    if (!validation.success) {
      const fieldErrors: FormErrors = {};
      validation.error.issues.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as keyof FormErrors] = err.message;
        }
      });
      setErrors(fieldErrors);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrors({ general: data.error || "Signup failed. Please try again." });
        setLoading(false);
        return;
      }

      // Account created; redirect to verify-pending (email may or may not have been sent)
      const query = data.emailSent === false ? "&emailFailed=true" : "";
      router.push(`/verify-pending?email=${encodeURIComponent(email)}${query}`);
    } catch {
      setErrors({ general: "A network error occurred. Please try again." });
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-4">
      <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">
            Create an Account
          </h1>
          <p className="text-slate-400 text-sm">
            Sign up to get started with SecureGate
          </p>
        </div>

        {errors.general && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg text-sm text-center">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2" htmlFor="name">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              className={`w-full bg-slate-950/80 border ${
                errors.name ? "border-red-500/50" : "border-slate-800"
              } focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-lg px-4 py-3 text-white placeholder-slate-600 focus:outline-none transition-colors`}
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1.5">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2" htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              className={`w-full bg-slate-950/80 border ${
                errors.email ? "border-red-500/50" : "border-slate-800"
              } focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-lg px-4 py-3 text-white placeholder-slate-600 focus:outline-none transition-colors`}
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1.5">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              className={`w-full bg-slate-950/80 border ${
                errors.password ? "border-red-500/50" : "border-slate-800"
              } focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-lg px-4 py-3 text-white placeholder-slate-600 focus:outline-none transition-colors`}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1.5">{errors.password}</p>
            )}

            {/* Password Strength Indicator */}
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
                <span>Creating Account...</span>
              </>
            ) : (
              <span>Sign Up</span>
            )}
          </button>
        </form>

        <p className="text-center text-slate-400 text-sm mt-8">
          Already have an account?{" "}
          <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
}
