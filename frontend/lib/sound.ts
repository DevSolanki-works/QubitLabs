"use client";

// ==============================================================================
// QubitLabs Quantum Sound & Generative Music Engine
// Powered by Web Audio API - Zero external assets, zero latency, 100% procedural
// ==============================================================================

type SoundListener = () => void;

class QuantumSoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;

  // Music state
  private musicOscillators: OscillatorNode[] = [];
  private musicLFO: OscillatorNode | null = null;
  private musicFilter: BiquadFilterNode | null = null;
  private chimeTimer: NodeJS.Timeout | null = null;

  // Settings
  private _isMuted = false;
  private _isMusicEnabled = false;
  private _volume = 0.35; // Default 35% master volume
  private listeners: Set<SoundListener> = new Set();

  constructor() {
    if (typeof window !== "undefined") {
      // Load saved preferences
      try {
        const savedMute = localStorage.getItem("qubitlabs_sound_muted");
        if (savedMute !== null) this._isMuted = savedMute === "true";

        const savedMusic = localStorage.getItem("qubitlabs_music_enabled");
        if (savedMusic !== null) this._isMusicEnabled = savedMusic === "true";

        const savedVol = localStorage.getItem("qubitlabs_volume");
        if (savedVol !== null) this._volume = parseFloat(savedVol) || 0.35;
      } catch {
        // LocalStorage might be disabled in private browsing
      }
    }
  }

  // Lazy initialize AudioContext on first user interaction
  private initContext(): boolean {
    if (typeof window === "undefined") return false;

    if (!this.ctx) {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;

      if (!AudioContextClass) return false;

      this.ctx = new AudioContextClass();

      // Master Compressor to prevent any clipping/distortion
      this.compressor = this.ctx.createDynamicsCompressor();
      this.compressor.threshold.setValueAtTime(-18, this.ctx.currentTime);
      this.compressor.knee.setValueAtTime(24, this.ctx.currentTime);
      this.compressor.ratio.setValueAtTime(8, this.ctx.currentTime);
      this.compressor.attack.setValueAtTime(0.003, this.ctx.currentTime);
      this.compressor.release.setValueAtTime(0.25, this.ctx.currentTime);
      this.compressor.connect(this.ctx.destination);

      // Master Gain
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(
        this._isMuted ? 0 : this._volume,
        this.ctx.currentTime
      );
      this.masterGain.connect(this.compressor);

      // SFX Sub-gain (fixed at 0.7 relative to master)
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      // Music Sub-gain (fixed at 0.35 relative to master for gentle ambiance)
      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(0.35, this.ctx.currentTime);
      this.musicGain.connect(this.masterGain);
    }

    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }

    return true;
  }

  // ----------------------------------------------------------------------------
  // State Getters & Setters
  // ----------------------------------------------------------------------------
  public get isMuted(): boolean {
    return this._isMuted;
  }

  public get isMusicPlaying(): boolean {
    return this._isMusicEnabled;
  }

  public get volume(): number {
    return this._volume;
  }

  public subscribe(listener: SoundListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach((l) => l());
  }

  public toggleMute(): void {
    this._isMuted = !this._isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(
        this._isMuted ? 0 : this._volume,
        this.ctx.currentTime,
        0.05
      );
    }
    if (typeof window !== "undefined") {
      localStorage.setItem("qubitlabs_sound_muted", String(this._isMuted));
    }
    this.notify();
  }

  public setVolume(vol: number): void {
    this._volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx && !this._isMuted) {
      this.masterGain.gain.setTargetAtTime(
        this._volume,
        this.ctx.currentTime,
        0.05
      );
    }
    if (typeof window !== "undefined") {
      localStorage.setItem("qubitlabs_volume", String(this._volume));
    }
    this.notify();
  }

  public toggleMusic(): void {
    this._isMusicEnabled = !this._isMusicEnabled;
    if (this._isMusicEnabled) {
      this.startAmbientMusic();
    } else {
      this.stopAmbientMusic();
    }
    if (typeof window !== "undefined") {
      localStorage.setItem("qubitlabs_music_enabled", String(this._isMusicEnabled));
    }
    this.notify();
  }

  // ----------------------------------------------------------------------------
  // Interactive Sound Effects (SFX)
  // ----------------------------------------------------------------------------

  /**
   * Tactile audio feedback when placing or selecting a quantum gate
   */
  public playGate(gateType: string): void {
    if (this._isMuted || !this.initContext() || !this.ctx || !this.sfxGain) return;

    const t0 = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.connect(gain);
    gain.connect(this.sfxGain);

    const upper = gateType.toUpperCase();

    switch (upper) {
      case "H": {
        // Hadamard Superposition Chord: 440Hz + 659.25Hz dual harmonic
        osc.type = "sine";
        osc.frequency.setValueAtTime(440, t0);
        osc.frequency.exponentialRampToValueAtTime(659.25, t0 + 0.14);

        gain.gain.setValueAtTime(0.3, t0);
        gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.22);
        osc.start(t0);
        osc.stop(t0 + 0.23);

        // Overtone shimmer
        const osc2 = this.ctx.createOscillator();
        const gain2 = this.ctx.createGain();
        osc2.type = "sine";
        osc2.frequency.setValueAtTime(880, t0);
        osc2.connect(gain2);
        gain2.connect(this.sfxGain);
        gain2.gain.setValueAtTime(0.12, t0);
        gain2.gain.exponentialRampToValueAtTime(0.001, t0 + 0.18);
        osc2.start(t0);
        osc2.stop(t0 + 0.19);
        break;
      }

      case "X": {
        // Pauli-X Bit Flip: Snappy downward frequency drop
        osc.type = "triangle";
        osc.frequency.setValueAtTime(740, t0);
        osc.frequency.exponentialRampToValueAtTime(185, t0 + 0.08);

        gain.gain.setValueAtTime(0.35, t0);
        gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.12);
        osc.start(t0);
        osc.stop(t0 + 0.13);
        break;
      }

      case "Z": {
        // Pauli-Z Phase Flip: High-frequency crystalline tick
        osc.type = "sine";
        osc.frequency.setValueAtTime(1046.5, t0); // C6
        osc.frequency.exponentialRampToValueAtTime(880, t0 + 0.1);

        gain.gain.setValueAtTime(0.28, t0);
        gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.15);
        osc.start(t0);
        osc.stop(t0 + 0.16);
        break;
      }

      case "CNOT":
      case "CX": {
        // Entangled Double Strike: Control tone followed by target chime
        osc.type = "sine";
        osc.frequency.setValueAtTime(523.25, t0); // C5
        gain.gain.setValueAtTime(0.25, t0);
        gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.12);
        osc.start(t0);
        osc.stop(t0 + 0.13);

        const osc2 = this.ctx.createOscillator();
        const gain2 = this.ctx.createGain();
        osc2.type = "sine";
        osc2.frequency.setValueAtTime(1046.5, t0 + 0.04); // C6
        osc2.connect(gain2);
        gain2.connect(this.sfxGain);
        gain2.gain.setValueAtTime(0.22, t0 + 0.04);
        gain2.gain.exponentialRampToValueAtTime(0.001, t0 + 0.22);
        osc2.start(t0 + 0.04);
        osc2.stop(t0 + 0.23);
        break;
      }

      case "M": {
        // Measurement Detector Click + Low Quantum Thud
        osc.type = "square";
        osc.frequency.setValueAtTime(220, t0);
        osc.frequency.exponentialRampToValueAtTime(55, t0 + 0.14);

        gain.gain.setValueAtTime(0.4, t0);
        gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.16);
        osc.start(t0);
        osc.stop(t0 + 0.17);
        break;
      }

      default: {
        // Generic gate blip (S, T, Y)
        osc.type = "sine";
        osc.frequency.setValueAtTime(587.33, t0); // D5
        osc.frequency.exponentialRampToValueAtTime(440, t0 + 0.09);

        gain.gain.setValueAtTime(0.25, t0);
        gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.1);
        osc.start(t0);
        osc.stop(t0 + 0.11);
        break;
      }
    }
  }

  /**
   * Resonating quantum sweep when the Qiskit Aer simulation executes
   */
  public playSimulate(): void {
    if (this._isMuted || !this.initContext() || !this.ctx || !this.sfxGain) return;

    const t0 = this.ctx.currentTime;

    // 1. Rising sub-resonance sweep
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(65, t0);
    osc.frequency.exponentialRampToValueAtTime(440, t0 + 0.38);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(150, t0);
    filter.frequency.exponentialRampToValueAtTime(1200, t0 + 0.38);

    gain.gain.setValueAtTime(0.28, t0);
    gain.gain.linearRampToValueAtTime(0.45, t0 + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.48);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t0);
    osc.stop(t0 + 0.5);

    // 2. Collapse pulse chime (representing shot measurement)
    const chime = this.ctx.createOscillator();
    const chimeGain = this.ctx.createGain();

    chime.type = "sine";
    chime.frequency.setValueAtTime(880, t0 + 0.36);
    chime.frequency.exponentialRampToValueAtTime(1760, t0 + 0.52);

    chimeGain.gain.setValueAtTime(0.0, t0);
    chimeGain.gain.setValueAtTime(0.35, t0 + 0.36);
    chimeGain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.65);

    chime.connect(chimeGain);
    chimeGain.connect(this.sfxGain);

    chime.start(t0 + 0.36);
    chime.stop(t0 + 0.68);
  }

  /**
   * Triumphant harmonic arpeggio when a challenge or quiz passes
   */
  public playSuccess(): void {
    if (this._isMuted || !this.initContext() || !this.ctx || !this.sfxGain) return;

    const t0 = this.ctx.currentTime;
    // Harmonic Major Pentatonic chord: C5, E5, G5, C6
    const freqs = [523.25, 659.25, 783.99, 1046.5];

    freqs.forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const noteTime = t0 + idx * 0.08;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.28, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.45);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(noteTime);
      osc.stop(noteTime + 0.48);
    });
  }

  /**
   * Decoherence damping thump when an error occurs
   */
  public playError(): void {
    if (this._isMuted || !this.initContext() || !this.ctx || !this.sfxGain) return;

    const t0 = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = "sawtooth";
    osc2.type = "triangle";

    // Dissonant interval (164Hz and 174Hz creating rapid beating)
    osc1.frequency.setValueAtTime(164.81, t0);
    osc2.frequency.setValueAtTime(174.61, t0);

    gain.gain.setValueAtTime(0.35, t0);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.32);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.sfxGain);

    osc1.start(t0);
    osc2.start(t0);
    osc1.stop(t0 + 0.35);
    osc2.stop(t0 + 0.35);
  }

  /**
   * Futuristic two-tone prompt chime for Copilot
   */
  public playCopilotMessage(): void {
    if (this._isMuted || !this.initContext() || !this.ctx || !this.sfxGain) return;

    const t0 = this.ctx.currentTime;
    const notes = [698.46, 880.0]; // F5 -> A5

    notes.forEach((f, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const noteTime = t0 + idx * 0.09;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(f, noteTime);

      gain.gain.setValueAtTime(0.22, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.28);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(noteTime);
      osc.stop(noteTime + 0.3);
    });
  }

  /**
   * Micro-transient click for general button clicks
   */
  public playClick(): void {
    if (this._isMuted || !this.initContext() || !this.ctx || !this.sfxGain) return;

    const t0 = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(1200, t0);
    osc.frequency.exponentialRampToValueAtTime(300, t0 + 0.025);

    gain.gain.setValueAtTime(0.12, t0);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.03);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t0);
    osc.stop(t0 + 0.035);
  }

  // ----------------------------------------------------------------------------
  // Generative Quantum Ambient Soundscape ("Quantum Coherence Music")
  // ----------------------------------------------------------------------------

  public startAmbientMusic(): void {
    if (!this.initContext() || !this.ctx || !this.musicGain) return;

    // If already playing, stop existing voices first
    this.stopAmbientMusic();

    const t0 = this.ctx.currentTime;

    // 1. Resonant Lowpass Filter with slow breathing LFO
    this.musicFilter = this.ctx.createBiquadFilter();
    this.musicFilter.type = "lowpass";
    this.musicFilter.frequency.setValueAtTime(380, t0);
    this.musicFilter.Q.setValueAtTime(3.5, t0);

    // LFO to slowly sweep filter cutoff (0.04 Hz = 25 second gentle cycle)
    this.musicLFO = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    this.musicLFO.type = "sine";
    this.musicLFO.frequency.setValueAtTime(0.04, t0);
    lfoGain.gain.setValueAtTime(180, t0);

    this.musicLFO.connect(lfoGain);
    lfoGain.connect(this.musicFilter.frequency);
    this.musicLFO.start(t0);

    this.musicFilter.connect(this.musicGain);

    // 2. Harmonic Drone Voices (A-minor / Quantum Vacuum harmonics)
    // - 55 Hz (A1 sub drone)
    // - 55.25 Hz (binaural phase beat at 0.25 Hz for meditative immersion)
    // - 110 Hz (A2 fundamental)
    // - 164.81 Hz (E3 fifth)
    // - 220 Hz (A3 octave)
    const chordFrequencies = [55.0, 55.25, 110.0, 164.81, 220.0];

    chordFrequencies.forEach((freq, idx) => {
      if (!this.ctx || !this.musicFilter) return;

      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();

      // Alternate waveforms for warm texture
      osc.type = idx % 2 === 0 ? "sine" : "triangle";
      osc.frequency.setValueAtTime(freq, t0);

      // Smooth fade-in over 2 seconds
      oscGain.gain.setValueAtTime(0.0001, t0);
      oscGain.gain.linearRampToValueAtTime(0.18 / (idx + 1), t0 + 2.5);

      osc.connect(oscGain);
      oscGain.connect(this.musicFilter);

      osc.start(t0);
      this.musicOscillators.push(osc);
    });

    // 3. Sporadic Crystalline Chimes (Quantum Fluctuation Overtones)
    const pentatonicNotes = [523.25, 659.25, 783.99, 880.0, 1046.5, 1318.5]; // C5, E5, G5, A5, C6, E6

    const triggerQuantumChime = () => {
      if (!this._isMusicEnabled || !this.ctx || !this.musicGain) return;

      const now = this.ctx.currentTime;
      const note =
        pentatonicNotes[Math.floor(Math.random() * pentatonicNotes.length)];

      const chimeOsc = this.ctx.createOscillator();
      const chimeGain = this.ctx.createGain();
      const chimeFilter = this.ctx.createBiquadFilter();

      chimeOsc.type = "sine";
      chimeOsc.frequency.setValueAtTime(note, now);

      chimeFilter.type = "bandpass";
      chimeFilter.frequency.setValueAtTime(note, now);
      chimeFilter.Q.setValueAtTime(4.0, now);

      chimeGain.gain.setValueAtTime(0.0001, now);
      chimeGain.gain.linearRampToValueAtTime(0.09, now + 0.15);
      chimeGain.gain.exponentialRampToValueAtTime(0.0001, now + 3.5);

      chimeOsc.connect(chimeFilter);
      chimeFilter.connect(chimeGain);
      chimeGain.connect(this.musicGain);

      chimeOsc.start(now);
      chimeOsc.stop(now + 3.6);

      // Random delay between 4 to 8 seconds for organic breathing
      const nextDelay = 4000 + Math.random() * 4500;
      this.chimeTimer = setTimeout(triggerQuantumChime, nextDelay);
    };

    // Schedule first chime after 2.5s
    this.chimeTimer = setTimeout(triggerQuantumChime, 2500);
  }

  public stopAmbientMusic(): void {
    if (this.chimeTimer) {
      clearTimeout(this.chimeTimer);
      this.chimeTimer = null;
    }

    if (this.musicLFO) {
      try {
        this.musicLFO.stop();
        this.musicLFO.disconnect();
      } catch {
        // already stopped
      }
      this.musicLFO = null;
    }

    this.musicOscillators.forEach((osc) => {
      try {
        osc.stop();
        osc.disconnect();
      } catch {
        // already stopped
      }
    });
    this.musicOscillators = [];
  }
}

// Global Singleton Instance
export const soundManager = new QuantumSoundEngine();
