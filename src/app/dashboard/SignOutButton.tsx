"use client";

import { signOut } from "next-auth/react";

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="bg-red-600 hover:bg-red-500 text-white font-semibold px-5 py-2.5 rounded-lg transition-all shadow-lg shadow-red-600/25 hover:shadow-red-500/30 focus:outline-none focus:ring-2 focus:ring-red-500/50 flex items-center space-x-2"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
      </svg>
      <span>Log Out</span>
    </button>
  );
}
