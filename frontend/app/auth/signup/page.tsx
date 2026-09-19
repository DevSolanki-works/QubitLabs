"use client";

import React, { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  AlertCircle,
  ArrowRight,
  Atom,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  Loader2,
  Sparkles,
} from "lucide-react";

export default function SignUpPageWrapper() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-16 text-cyan-300">
          <Atom className="animate-spin" size={28} />
        </div>
      }
    >
      <SignUpPage />
    </Suspense>
  );
}

function SignUpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get("next") || "/dashboard";

  const { signUp, isConfigured } = useAuth();

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [verificationRequired, setVerificationRequired] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!displayName || !email || !password) {
      setErrorMessage("Please complete all required fields.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    const { error, requiresVerification } = await signUp(
      email,
      password,
      displayName
    );

    setLoading(false);

    if (error) {
      setErrorMessage(error);
    } else if (requiresVerification) {
      setVerificationRequired(true);
    } else {
      router.push(nextUrl);
    }
  };

  if (verificationRequired) {
    return (
      <div className="rounded-3xl border border-cyan-400/30 bg-[#070c14]/90 p-8 shadow-[0_0_50px_rgba(0,0,0,0.6)] backdrop-blur-xl sm:p-10 text-center">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-3xl border border-cyan-400/40 bg-cyan-400/10 text-cyan-300 shadow-[0_0_25px_rgba(6,182,212,0.25)] mb-6">
          <CheckCircle2 size={32} />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Check your email</h2>
        <p className="text-sm text-slate-300 mb-6 leading-relaxed">
          We sent a verification link to <span className="font-semibold text-cyan-300">{email}</span>. Please click the link in your inbox to confirm your account and enter QubitLabs.
        </p>
        <Link
          href="/auth/login"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl border border-white/10 bg-white/[0.04] text-xs font-semibold text-white hover:bg-white/[0.08] transition"
        >
          Return to Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-[#070c14]/90 p-8 shadow-[0_0_50px_rgba(0,0,0,0.6)] backdrop-blur-xl sm:p-10">
      <div className="text-center mb-8">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-400/10 text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.2)] mb-4">
          <Sparkles size={24} />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Create an account
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-slate-400">
          Start your journey in quantum algorithm development and sync your progress.
        </p>
      </div>

      {!isConfigured && (
        <div className="mb-6 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-xs text-amber-300">
          <div className="flex items-start gap-2.5">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block mb-1">
                Supabase Keys Not Configured
              </span>
              Please set <code className="font-mono bg-amber-500/20 px-1 py-0.5 rounded">NEXT_PUBLIC_SUPABASE_URL</code> and <code className="font-mono bg-amber-500/20 px-1 py-0.5 rounded">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in <code className="font-mono">.env.local</code> to enable persistent cloud accounts.
            </div>
          </div>
        </div>
      )}

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
            htmlFor="displayName"
            className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider"
          >
            Display name
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <User size={16} />
            </div>
            <input
              id="displayName"
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Dr. Richard Feynman"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/10 bg-white/[0.03] text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400/60 focus:bg-white/[0.05] focus:ring-1 focus:ring-cyan-400/40 transition"
            />
          </div>
        </div>

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

        <div>
          <label
            htmlFor="password"
            className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider"
          >
            Password
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

        <button
          type="submit"
          disabled={loading || !isConfigured}
          className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-400 to-cyan-300 hover:from-cyan-300 hover:to-cyan-200 text-[#07080c] font-bold text-sm transition shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.45)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Creating your profile...</span>
            </>
          ) : (
            <>
              <span>Initialize Quantum Account</span>
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-white/10 text-center text-xs text-slate-400">
        Already have an account?{" "}
        <Link
          href={`/auth/login?next=${encodeURIComponent(nextUrl)}`}
          className="font-semibold text-cyan-300 hover:text-cyan-200 transition"
        >
          Sign in instead
        </Link>
      </div>
    </div>
  );
}
