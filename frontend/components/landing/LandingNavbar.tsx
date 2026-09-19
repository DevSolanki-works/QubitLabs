"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Atom,
  Menu,
  X,
  FlaskConical,
  GraduationCap,
  Trophy,
  Compass,
} from "lucide-react";
import { UserMenu } from "@/components/UserMenu";

export function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const closeMenu = () => setOpen(false);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#07080c]/85 backdrop-blur-md border-b border-white/10 shadow-lg"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-5 sm:px-8 h-18 flex items-center justify-between gap-6">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group" onClick={closeMenu}>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-400/10 text-[#00f0ff] shadow-[0_0_15px_rgba(0,240,255,0.25)] group-hover:border-cyan-400/60 transition">
            <Atom size={20} />
          </div>
          <div className="flex items-center">
            <span className="text-lg font-bold tracking-tight text-white group-hover:text-cyan-200 transition">
              QubitLabs
            </span>
            <span className="text-cyan-400 font-bold text-lg">.</span>
          </div>
        </Link>

        {/* Center Desktop Links */}
        <ul className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <li>
            <Link
              href="/learn"
              className="flex items-center gap-1.5 hover:text-white transition duration-200"
            >
              <GraduationCap size={15} className="text-cyan-400" />
              <span>Curriculum</span>
            </Link>
          </li>
          <li>
            <Link
              href="/lab"
              className="flex items-center gap-1.5 hover:text-white transition duration-200"
            >
              <FlaskConical size={15} className="text-cyan-300" />
              <span>Quantum Lab</span>
            </Link>
          </li>
          <li>
            <Link
              href="/challenges"
              className="flex items-center gap-1.5 hover:text-white transition duration-200"
            >
              <Trophy size={14} className="text-violet-400" />
              <span>Challenges</span>
            </Link>
          </li>
          <li>
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 hover:text-white transition duration-200"
            >
              <Compass size={14} className="text-slate-400" />
              <span>Dashboard</span>
            </Link>
          </li>
        </ul>

        {/* Right Actions */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div
            className="hidden lg:inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-[11px] font-mono text-[#00f0ff]"
            title="FastAPI Quantum Engine Online"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Qiskit Aer 2.5</span>
          </div>

          <UserMenu />

          <Link
            href="/lab"
            className="hidden sm:inline-flex px-5 py-2 rounded-full bg-white text-[#07080c] font-semibold text-xs sm:text-sm hover:bg-[#d8e2ff] transition-all hover:shadow-[0_0_20px_rgba(255,255,255,0.35)]"
          >
            Launch Lab
          </Link>

          {/* Mobile Menu Button */}
          <button
            type="button"
            className="md:hidden p-2 text-slate-300 hover:text-white"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {/* Mobile Slide-down Panel */}
      {open && (
        <div className="md:hidden bg-[#07080c]/95 border-b border-white/10 px-6 py-6 backdrop-blur-xl animate-in slide-in-from-top-2">
          <ul className="space-y-4 text-base font-medium">
            <li>
              <Link
                href="/learn"
                onClick={closeMenu}
                className="flex items-center gap-2.5 text-slate-200 hover:text-cyan-300"
              >
                <GraduationCap size={18} className="text-cyan-400" />
                <span>Curriculum</span>
              </Link>
            </li>
            <li>
              <Link
                href="/lab"
                onClick={closeMenu}
                className="flex items-center gap-2.5 text-slate-200 hover:text-cyan-300"
              >
                <FlaskConical size={18} className="text-cyan-400" />
                <span>Quantum Lab Simulator</span>
              </Link>
            </li>
            <li>
              <Link
                href="/challenges"
                onClick={closeMenu}
                className="flex items-center gap-2.5 text-slate-200 hover:text-violet-300"
              >
                <Trophy size={18} className="text-violet-400" />
                <span>Circuit Challenges</span>
              </Link>
            </li>
            <li>
              <Link
                href="/dashboard"
                onClick={closeMenu}
                className="flex items-center gap-2.5 text-slate-200 hover:text-white"
              >
                <Compass size={18} className="text-slate-400" />
                <span>Platform Dashboard</span>
              </Link>
            </li>
          </ul>

          <div className="mt-6 pt-5 border-t border-white/10 flex gap-3">
            <Link
              href="/learn"
              onClick={closeMenu}
              className="flex-1 py-2.5 rounded-xl bg-cyan-400 text-black font-bold text-xs text-center"
            >
              Start Learning
            </Link>
            <Link
              href="/lab"
              onClick={closeMenu}
              className="flex-1 py-2.5 rounded-xl border border-white/20 text-white font-medium text-xs text-center"
            >
              Open Lab
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
