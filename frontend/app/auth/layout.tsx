import React from "react";
import Link from "next/link";
import { Atom } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen flex flex-col justify-between bg-[#050b10] text-slate-100 overflow-x-hidden selection:bg-cyan-400 selection:text-[#050b10]">
      {/* Background ambient lighting effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[140px]" />
        <div className="absolute -bottom-40 right-10 w-[450px] h-[450px] bg-violet-600/10 rounded-full blur-[140px]" />
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:24px_24px] opacity-60" />
      </div>

      {/* Top Brand Header */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-400/10 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.25)] group-hover:border-cyan-400/60 transition">
            <Atom size={20} />
          </div>
          <div className="flex items-center">
            <span className="text-lg font-bold tracking-tight text-white group-hover:text-cyan-200 transition">
              QubitLabs
            </span>
            <span className="text-cyan-400 font-bold text-lg">.</span>
          </div>
        </Link>

        <Link
          href="/"
          className="text-xs font-medium text-slate-400 hover:text-white transition px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/20 bg-white/[0.02]"
        >
          Back to Platform
        </Link>
      </header>

      {/* Main Form Center */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">{children}</div>
      </main>

      {/* Subtle Footer */}
      <footer className="relative z-10 py-6 text-center text-xs text-slate-500 border-t border-white/5">
        <p>QubitLabs · Powered by IBM Qiskit & Google Gemini AI</p>
      </footer>
    </div>
  );
}
