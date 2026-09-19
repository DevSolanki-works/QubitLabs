"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getGamificationState, getCurrentRank } from "@/lib/gamification";
import {
  Atom,
  Compass,
  FlaskConical,
  GraduationCap,
  LogOut,
  Sparkles,
  Trophy,
  User,
  Zap,
} from "lucide-react";

export function UserMenu() {
  const router = useRouter();
  const { user, profile, signOut, loading, isConfigured } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (loading) {
    return (
      <div className="h-8 w-8 rounded-full border border-white/10 bg-white/5 animate-pulse" />
    );
  }

  // Unauthenticated UI
  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/auth/login"
          className="px-3.5 py-1.5 rounded-full border border-white/10 text-xs font-semibold text-slate-300 hover:text-white hover:border-cyan-400/40 hover:bg-cyan-500/10 transition backdrop-blur-sm"
        >
          Sign In
        </Link>
        <Link
          href="/auth/signup"
          className="hidden sm:inline-flex px-3.5 py-1.5 rounded-full bg-cyan-400 hover:bg-cyan-300 text-[#07080c] text-xs font-bold transition shadow-[0_0_15px_rgba(6,182,212,0.25)]"
        >
          Get Started
        </Link>
      </div>
    );
  }

  // Authenticated UI
  const displayName = profile?.displayName || user.email?.split("@")[0] || "Explorer";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const gamification = getGamificationState();
  const rankInfo = getCurrentRank(gamification.xp);

  const handleSignOut = async () => {
    setOpen(false);
    await signOut();
    router.push("/");
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2.5 p-1 rounded-full border border-cyan-400/30 bg-cyan-950/30 hover:border-cyan-400/60 transition cursor-pointer group"
        aria-label="User account menu"
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-tr from-cyan-500 to-teal-400 text-[#07080c] font-bold text-xs shadow-[0_0_10px_rgba(6,182,212,0.3)]">
          {initials}
        </div>
        <span className="hidden md:inline text-xs font-medium text-slate-200 group-hover:text-white pr-2">
          {displayName}
        </span>
      </button>

      {/* Dropdown Menu */}
      {open && (
        <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-white/10 bg-[#070c14]/95 p-3 shadow-[0_10px_40px_rgba(0,0,0,0.8)] backdrop-blur-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
          {/* User Profile Header */}
          <div className="border-b border-white/10 pb-3 mb-2 px-2 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white truncate max-w-[140px]">
                {displayName}
              </span>
              <span className="rounded-md border border-cyan-400/30 bg-cyan-400/10 px-1.5 py-0.5 font-mono text-[9px] font-semibold text-cyan-300">
                {rankInfo.rank.badge}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate mt-0.5">
              {user.email}
            </p>

            {/* Rank / XP summary pill */}
            <div className="mt-2.5 flex items-center justify-between rounded-lg bg-white/[0.03] border border-white/5 px-2 py-1 text-[10px]">
              <span className="text-slate-400">{rankInfo.rank.name}</span>
              <span className="font-mono font-bold text-cyan-300">
                {gamification.xp} XP
              </span>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="space-y-0.5 text-xs">
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/[0.06] transition"
            >
              <Atom size={14} className="text-cyan-400" />
              <span>Landing Page</span>
            </Link>

            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/[0.06] transition"
            >
              <Compass size={14} className="text-cyan-400" />
              <span>Dashboard</span>
            </Link>

            <Link
              href="/learn"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/[0.06] transition"
            >
              <GraduationCap size={14} className="text-teal-400" />
              <span>Curriculum</span>
            </Link>

            <Link
              href="/lab"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/[0.06] transition"
            >
              <FlaskConical size={14} className="text-cyan-300" />
              <span>Quantum Lab</span>
            </Link>

            <Link
              href="/challenges"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/[0.06] transition"
            >
              <Trophy size={14} className="text-violet-400" />
              <span>Challenges</span>
            </Link>
          </div>

          {/* Sign Out */}
          <div className="mt-2 pt-2 border-t border-white/10">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition cursor-pointer"
            >
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
