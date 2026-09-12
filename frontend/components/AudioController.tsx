"use client";

import React, { useEffect, useState } from "react";
import {
  Volume2,
  VolumeX,
  Headphones,
  Sliders,
  Radio,
  X,
} from "lucide-react";
import { soundManager } from "@/lib/sound";

export default function AudioController() {
  const [isMuted, setIsMuted] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(true);
  const [volume, setVolume] = useState(0.70);
  const [isOpen, setIsOpen] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    // Sync with singleton state
    setIsMuted(soundManager.isMuted);
    setIsMusicPlaying(soundManager.isMusicPlaying);
    setVolume(soundManager.volume);

    const unsubscribe = soundManager.subscribe(() => {
      setIsMuted(soundManager.isMuted);
      setIsMusicPlaying(soundManager.isMusicPlaying);
      setVolume(soundManager.volume);
    });

    return unsubscribe;
  }, []);

  const handleToggleMute = () => {
    soundManager.toggleMute();
    if (!hasInteracted) setHasInteracted(true);
  };

  const handleToggleMusic = () => {
    soundManager.toggleMusic();
    if (!hasInteracted) setHasInteracted(true);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    soundManager.setVolume(val);
  };

  return (
    <aside
      aria-label="Quantum Audio Controls"
      className="fixed bottom-5 right-5 z-50 select-none"
    >
      {/* Expanded Control Popover */}
      {isOpen && (
        <div className="mb-3 w-72 rounded-2xl border border-cyan-500/30 bg-[#080d19]/95 p-4 shadow-[0_12px_40px_rgba(0,0,0,0.6)] backdrop-blur-xl animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Radio size={15} className="text-cyan-400 animate-pulse" />
              <span className="text-xs font-semibold tracking-wide text-white">
                Deep Space Audio Engine
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-1 text-white/50 hover:bg-white/10 hover:text-white transition"
              aria-label="Close audio controls"
            >
              <X size={14} />
            </button>
          </div>

          <div className="mt-3.5 space-y-3 font-sans text-xs">
            {/* Ambient Soundscape Toggle */}
            <div className="flex items-center justify-between rounded-xl bg-white/[0.03] p-2.5 border border-white/5">
              <div className="flex items-center gap-2.5">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-lg border transition ${
                    isMusicPlaying
                      ? "border-cyan-400/40 bg-cyan-400/20 text-cyan-300"
                      : "border-white/10 bg-white/5 text-white/40"
                  }`}
                >
                  <Headphones size={15} />
                </div>
                <div>
                  <div className="font-medium text-white">Deep Space Atmosphere</div>
                  <div className="text-[10px] text-white/40">
                    Cosmic wind, void drone & pulsar sonar
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleToggleMusic}
                className={`px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wider transition ${
                  isMusicPlaying
                    ? "bg-cyan-400 text-black shadow-[0_0_12px_rgba(0,240,255,0.4)]"
                    : "bg-white/10 text-white/60 hover:bg-white/20"
                }`}
              >
                {isMusicPlaying ? "ACTIVE" : "START"}
              </button>
            </div>

            {/* Master Sound FX Toggle */}
            <div className="flex items-center justify-between rounded-xl bg-white/[0.03] p-2.5 border border-white/5">
              <div className="flex items-center gap-2.5">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-lg border transition ${
                    !isMuted
                      ? "border-purple-400/40 bg-purple-400/20 text-purple-300"
                      : "border-white/10 bg-white/5 text-white/40"
                  }`}
                >
                  {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
                </div>
                <div>
                  <div className="font-medium text-white">Quantum SFX</div>
                  <div className="text-[10px] text-white/40">
                    Gate clicks & collapse resonance
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleToggleMute}
                className={`px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wider transition ${
                  !isMuted
                    ? "bg-purple-400 text-black shadow-[0_0_12px_rgba(168,85,247,0.4)]"
                    : "bg-white/10 text-white/60 hover:bg-white/20"
                }`}
              >
                {!isMuted ? "ON" : "MUTED"}
              </button>
            </div>

            {/* Master Volume Slider */}
            <div className="rounded-xl bg-white/[0.02] p-2.5 border border-white/5">
              <div className="flex justify-between text-[11px] mb-1.5">
                <span className="text-white/60">Master Volume</span>
                <span className="font-mono text-cyan-400">
                  {Math.round(volume * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={handleVolumeChange}
                className="w-full accent-cyan-400 bg-white/10 h-1.5 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* Floating Pill Trigger */}
      <div className="relative flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-[#080d19]/90 p-1.5 shadow-[0_8px_30px_rgba(0,0,0,0.5)] backdrop-blur-xl transition hover:border-cyan-500/50">
        {!isMusicPlaying && (
          <div className="absolute -top-7 right-2 whitespace-nowrap rounded-md bg-cyan-400 px-2 py-0.5 text-[10px] font-mono text-black font-bold shadow-lg animate-bounce pointer-events-none">
            Space Audio 🎧
          </div>
        )}
        {/* Generative Deep Space Button */}
        <button
          onClick={handleToggleMusic}
          className={`relative flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-medium transition ${
            isMusicPlaying
              ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(0,240,255,0.25)]"
              : "text-white/60 hover:bg-white/10 hover:text-white"
          }`}
          title={isMusicPlaying ? "Pause Deep Space Ambience" : "Play Deep Space Ambience"}
          aria-label={isMusicPlaying ? "Pause Deep Space Ambience" : "Play Deep Space Ambience"}
        >
          {isMusicPlaying ? (
            <div className="flex items-center gap-0.5" aria-hidden="true">
              <span className="w-0.5 h-3 bg-cyan-400 animate-[pulse_0.6s_ease-in-out_infinite]" />
              <span className="w-0.5 h-4 bg-cyan-300 animate-[pulse_0.8s_ease-in-out_infinite_0.2s]" />
              <span className="w-0.5 h-2.5 bg-cyan-400 animate-[pulse_0.5s_ease-in-out_infinite_0.4s]" />
              <span className="w-0.5 h-3.5 bg-cyan-200 animate-[pulse_0.7s_ease-in-out_infinite_0.1s]" />
            </div>
          ) : (
            <Headphones size={13} className="text-white/70" />
          )}
          <span className="text-[11px] font-mono">
            {isMusicPlaying ? "Deep Space" : "Space Audio"}
          </span>
        </button>

        {/* Master Mute / Unmute Button */}
        <button
          onClick={handleToggleMute}
          className={`flex h-8 w-8 items-center justify-center rounded-full transition ${
            isMuted
              ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
              : "text-white/60 hover:bg-white/10 hover:text-white"
          }`}
          title={isMuted ? "Unmute Audio" : "Mute Audio"}
          aria-label={isMuted ? "Unmute Audio" : "Mute Audio"}
        >
          {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
        </button>

        {/* Open Settings Popover */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex h-8 w-8 items-center justify-center rounded-full transition ${
            isOpen
              ? "bg-white/20 text-white"
              : "text-white/40 hover:bg-white/10 hover:text-white"
          }`}
          title="Audio Settings"
          aria-label="Audio Settings"
        >
          <Sliders size={13} />
        </button>
      </div>
    </aside>
  );
}
