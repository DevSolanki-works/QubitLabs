"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Loader2,
} from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const { updatePassword, isConfigured } = useAuth();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setLoading(true);
    const { error } = await updatePassword(password);
    setLoading(false);

    if (error) {
      setErrorMessage(error);
    } else {
      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    }
  };

  if (success) {
    return (
      <div className="rounded-3xl border border-cyan-400/30 bg-[#070c14]/90 p-8 shadow-[0_0_50px_rgba(0,0,0,0.6)] backdrop-blur-xl sm:p-10 text-center">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-3xl border border-cyan-400/40 bg-cyan-400/10 text-cyan-300 shadow-[0_0_25px_rgba(6,182,212,0.25)] mb-6">
          <CheckCircle2 size={32} />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Password updated</h2>
        <p className="text-sm text-slate-300 mb-6 leading-relaxed">
          Your quantum account password has been updated securely. Redirecting to your dashboard...
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-cyan-400 text-[#07080c] text-xs font-bold hover:bg-cyan-300 transition"
        >
          <span>Go to Dashboard</span>
          <ArrowRight size={14} />
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-[#070c14]/90 p-8 shadow-[0_0_50px_rgba(0,0,0,0.6)] backdrop-blur-xl sm:p-10">
      <div className="text-center mb-8">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-400/10 text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.2)] mb-4">
          <KeyRound size={24} />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Set new password
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-slate-400">
          Enter a secure new password for your QubitLabs account.
        </p>
      </div>

      {errorMessage && (
        <div className="mb-6 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-xs text-rose-300">
          <div className="flex items-center gap-2.5">
            <AlertCircle size={16} className="shrink-0" />
            <span>{errorMessage}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="password"
            className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider"
          >
            New password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Lock size={16} />
            </div>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 6 characters"
              className="w-full pl-10 pr-10 py-3 rounded-xl border border-white/10 bg-white/[0.03] text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400/60 focus:bg-white/[0.05] focus:ring-1 focus:ring-cyan-400/40 transition"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider"
          >
            Confirm new password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Lock size={16} />
            </div>
            <input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter password"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/10 bg-white/[0.03] text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400/60 focus:bg-white/[0.05] focus:ring-1 focus:ring-cyan-400/40 transition"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !isConfigured}
          className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-400 to-cyan-300 hover:from-cyan-300 hover:to-cyan-200 text-[#07080c] font-bold text-sm transition shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.45)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Updating password...</span>
            </>
          ) : (
            <>
              <span>Save New Password</span>
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
