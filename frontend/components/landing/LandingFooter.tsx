"use client";

import Link from "next/link";
import { Atom } from "lucide-react";

export function LandingFooter() {
  return (
    <footer className="relative z-10 border-t border-white/10 bg-[#050608]/90 backdrop-blur-md px-6 py-10 text-slate-400">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col items-center md:items-start gap-2">
          <div className="flex items-center gap-2">
            <Atom size={18} className="text-cyan-400" />
            <span className="text-base font-bold text-white tracking-wide">
              QubitLabs<span className="text-cyan-400">.</span>
            </span>
          </div>
          <p className="text-xs text-slate-400 font-light">
            &ldquo;Don&apos;t just learn quantum computing. See it happen.&rdquo;
          </p>
        </div>

        <nav className="flex flex-wrap items-center justify-center gap-6 text-xs font-medium text-slate-300">
          <Link href="/learn" className="hover:text-cyan-300 transition">
            Curriculum
          </Link>
          <Link href="/lab" className="hover:text-cyan-300 transition">
            Quantum Lab
          </Link>
          <Link href="/challenges" className="hover:text-violet-300 transition">
            Challenges
          </Link>
          <Link href="/dashboard" className="hover:text-white transition">
            Dashboard
          </Link>
        </nav>

        <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>IBM Qiskit Aer · Gemini 2.5 Copilot</span>
        </div>
      </div>
    </footer>
  );
}
