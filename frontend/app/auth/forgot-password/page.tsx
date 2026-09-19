"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  KeyRound,
  Mail,
  Loader2,
} from "lucide-react";

export default function ForgotPasswordPage() {
  const { resetPassword, isConfigured } = useAuth();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email) {
      setErrorMessage("Please enter your registered email address.");
      return;
    }

    setLoading(true);
    const { error } = await resetPassword(email);
    setLoading(false);

    if (error) {
      setErrorMessage(error);
    } else {
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <div className="rounded-3xl border border-cyan-400/30 bg-[#070c14]/90 p-8 shadow-[0_0_50px_rgba(0,0,0,0.6)] backdrop-blur-xl sm:p-10 text-center">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-3xl border border-cyan-400/40 bg-cyan-400/10 text-cyan-300 shadow-[0_0_25px_rgba(6,182,212,0.25)] mb-6">
          <CheckCircle2 size={32} />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Reset link dispatched</h2>
        <p className="text-sm text-slate-300 mb-6 leading-relaxed">
          If an account exists for <span className="font-semibold text-cyan-300">{email}</span>, you will receive an email containing a link to securely reset your password.
        </p>
        <Link
          href="/auth/login"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl border border-white/10 bg-white/[0.04] text-xs font-semibold text-white hover:bg-white/[0.08] transition"
        >
          <ArrowLeft size={14} />
          <span>Return to Sign In</span>
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
          Reset password
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-slate-400">
          Enter your email to receive a password recovery link.
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
            htmlFor="email"
            className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider"
          >
            Email address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Mail size={16} />
            </div>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="physicist@qubitlabs.ai"
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
              <span>Sending recovery link...</span>
            </>
          ) : (
            <>
              <span>Send Recovery Link</span>
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-white/10 text-center text-xs text-slate-400">
        Remember your password?{" "}
        <Link
          href="/auth/login"
          className="font-semibold text-cyan-300 hover:text-cyan-200 transition"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}
