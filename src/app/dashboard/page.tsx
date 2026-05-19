import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import SignOutButton from "./SignOutButton";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  // Fallback check (middleware should already handle this)
  if (!session || !session.user) {
    redirect("/login");
  }

  const { name, email } = session.user;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl" />

        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-800 pb-6 mb-6">
            <div>
              <span className="text-indigo-400 text-xs font-semibold uppercase tracking-wider">
                Control Panel
              </span>
              <h1 className="text-3xl font-bold tracking-tight mt-1 text-white">
                Dashboard
              </h1>
            </div>
            <SignOutButton />
          </div>

          <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-5 mb-6">
            <p className="text-indigo-300 text-lg font-semibold">
              Welcome back{name ? `, ${name}` : ""}! 👋
            </p>
            <p className="text-indigo-400/70 text-sm mt-1">
              You are securely signed in to your SecureGate account.
            </p>
          </div>

          <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-semibold text-slate-200">
              Account Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-900/60 rounded-lg border border-slate-800">
                <span className="text-xs text-slate-500 uppercase tracking-wider block">
                  Name
                </span>
                <span className="text-sm font-medium text-slate-200 block mt-1">
                  {name || "N/A"}
                </span>
              </div>
              <div className="p-4 bg-slate-900/60 rounded-lg border border-slate-800">
                <span className="text-xs text-slate-500 uppercase tracking-wider block">
                  Email
                </span>
                <span className="text-sm font-medium text-slate-200 block mt-1">
                  {email || "N/A"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
