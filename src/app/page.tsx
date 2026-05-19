import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-slate-100 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-4xl text-center space-y-8 relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />

        <div className="relative z-10 space-y-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-full text-xs font-semibold uppercase tracking-wider">
            <span>🛡️ Secure Authentication Gate</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-white max-w-2xl mx-auto leading-tight">
            Secure your digital assets with{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400">
              SecureGate
            </span>
          </h1>

          <p className="text-slate-400 text-lg md:text-xl max-w-xl mx-auto font-light">
            An advanced authentication gate featuring NextAuth.js, credentials validation, and security middleware protection.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Link
              href="/login"
              className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg px-8 py-3.5 transition-all shadow-lg shadow-indigo-600/25 text-center"
            >
              Access Portal (Log In)
            </Link>
            <Link
              href="/signup"
              className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-slate-700 font-semibold rounded-lg px-8 py-3.5 transition-all text-center"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
