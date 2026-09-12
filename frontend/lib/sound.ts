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

  // Space Ambience Audio Graph nodes
  private droneOscillators: OscillatorNode[] = [];
  private padOscillators: OscillatorNode[] = [];
  private windSource: AudioBufferSourceNode | null = null;
  private windFilter: BiquadFilterNode | null = null;
  private windLFO: OscillatorNode | null = null;
  private padGain: GainNode | null = null;
  private padLFO: OscillatorNode | null = null;
  private sonarTimer: NodeJS.Timeout | null = null;

  // Settings & State
  private _isMuted = false;
  private _isMusicEnabled = true; // Default ON for immersive dark space experience
  private _volume = 0.70; // 70% master volume for rich, audible space presence
  private listeners: Set<SoundListener> = new Set();
  private hasAutoUnlocked = false;

  constructor() {
    if (typeof window !== "undefined") {
      try {
        const savedMute = localStorage.getItem("qubitlabs_sound_muted");
        if (savedMute !== null) this._isMuted = savedMute === "true";

        const savedMusic = localStorage.getItem("qubitlabs_music_enabled");
        if (savedMusic !== null) this._isMusicEnabled = savedMusic === "true";

        const savedVol = localStorage.getItem("qubitlabs_volume");
        if (savedVol !== null) this._volume = parseFloat(savedVol) || 0.70;
      } catch {
        // Safe fallback
      }

      // Register global interaction listeners to unlock AudioContext on first user gesture
      this.attachUnlockListeners();
    }
  }

  /**
   * Attaches one-time event listeners across the window to unlock Web Audio API
   * in strict compliance with browser autoplay policies.
   */
  private attachUnlockListeners(): void {
    if (typeof window === "undefined") return;

    const unlock = () => {
      if (this.hasAutoUnlocked) return;
      this.unlockAudioContext();
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("click", unlock);
      window.removeEventListener("touchstart", unlock);
      window.removeEventListener("keydown", unlock);
      window.removeEventListener("scroll", unlock);
    };

    window.addEventListener("pointerdown", unlock, { passive: true });
    window.addEventListener("click", unlock, { passive: true });
    window.addEventListener("touchstart", unlock, { passive: true });
    window.addEventListener("keydown", unlock, { passive: true });
    window.addEventListener("scroll", unlock, { passive: true });
  }

  // Lazy initialize AudioContext on user interaction
  public initContext(): boolean {
    if (typeof window === "undefined") return false;

    if (!this.ctx) {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;

      if (!AudioContextClass) return false;

      this.ctx = new AudioContextClass();

      // Master Dynamics Compressor: Warm analog response, prevents clipping
      this.compressor = this.ctx.createDynamicsCompressor();
      this.compressor.threshold.setValueAtTime(-15, this.ctx.currentTime);
      this.compressor.knee.setValueAtTime(20, this.ctx.currentTime);
      this.compressor.ratio.setValueAtTime(5, this.ctx.currentTime);
      this.compressor.attack.setValueAtTime(0.005, this.ctx.currentTime);
      this.compressor.release.setValueAtTime(0.25, this.ctx.currentTime);
      this.compressor.connect(this.ctx.destination);

      // Master Gain (rich volume)
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(
        this._isMuted ? 0 : this._volume,
        this.ctx.currentTime
      );
      this.masterGain.connect(this.compressor);

      // SFX Sub-gain (punchy and responsive)
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(0.85, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      // Music Sub-gain (immersive, deep dark space level)
      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(0.70, this.ctx.currentTime);
      this.musicGain.connect(this.masterGain);
    }

    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }

    return true;
  }

  /**
   * Explicitly unlocks audio context and immediately starts the dark space soundscape if enabled
   */
  public unlockAudioContext(): void {
    this.hasAutoUnlocked = true;
    if (this.initContext()) {
      if (this._isMusicEnabled && !this._isMuted) {
        this.startAmbientMusic();
      }
    }
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
    this.unlockAudioContext();
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
  // Deep Dark Space Generative Soundscape
  // ----------------------------------------------------------------------------

  /**
   * Generates a 4-second seamless procedural Pink Noise audio buffer
   * for the cosmic stellar wind / interstellar vacuum atmosphere.
   */
  private createPinkNoiseBuffer(): AudioBuffer | null {
    if (!this.ctx) return null;
    const sampleRate = this.ctx.sampleRate;
    const bufferSize = sampleRate * 4;
    const buffer = this.ctx.createBuffer(2, bufferSize, sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        data[i] = (b0 + b1 + b2 + white * 0.1) * 0.35;
      }
    }
    return buffer;
  }

  /**
   * Starts the Deep Dark Space Soundscape:
   * 1. Multi-harmonic Sub & Low-Mid Dark Void Drone (audible on subwoofers & laptop speakers)
   * 2. Cosmic Void Wind with modulated resonant bandpass filter
   * 3. Hans Zimmer-style Ethereal Dark Space Pad Chords with gentle tidal breathing
   * 4. Deep Space Pulsar / Sonar Echoes traversing the void
   */
  public startAmbientMusic(): void {
    if (!this.initContext() || !this.ctx || !this.musicGain) return;

    // Stop any existing active voices
    this.stopAmbientMusic();

    const t0 = this.ctx.currentTime;

    // 1. Cosmic Stellar Wind / Void Atmosphere (Filtered Pink Noise)
    const noiseBuffer = this.createPinkNoiseBuffer();
    if (noiseBuffer) {
      this.windSource = this.ctx.createBufferSource();
      this.windSource.buffer = noiseBuffer;
      this.windSource.loop = true;

      this.windFilter = this.ctx.createBiquadFilter();
      this.windFilter.type = "bandpass";
      this.windFilter.frequency.setValueAtTime(320, t0);
      this.windFilter.Q.setValueAtTime(3.2, t0);

      // Slow sweeping LFO (~26 second breathing cycle)
      this.windLFO = this.ctx.createOscillator();
      this.windLFO.type = "sine";
      this.windLFO.frequency.setValueAtTime(0.038, t0);

      const windLFOGain = this.ctx.createGain();
      windLFOGain.gain.setValueAtTime(190, t0); // Sweeps 130Hz - 510Hz

      this.windLFO.connect(windLFOGain);
      windLFOGain.connect(this.windFilter.frequency);
      this.windLFO.start(t0);

      const windGain = this.ctx.createGain();
      windGain.gain.setValueAtTime(0.001, t0);
      windGain.gain.linearRampToValueAtTime(0.26, t0 + 2.5);

      this.windSource.connect(this.windFilter);
      this.windFilter.connect(windGain);
      windGain.connect(this.musicGain);

      this.windSource.start(t0);
    }

    // 2. The Deep Void Drone (Rich Harmonics from 55Hz to 440Hz)
    const droneSpecs: Array<{ f: number; type: OscillatorType; g: number }> = [
      { f: 55.0, type: "sine", g: 0.42 }, // Sub A1
      { f: 55.35, type: "sine", g: 0.38 }, // Binaural detuned A1 (slow 0.35Hz pulse)
      { f: 110.0, type: "triangle", g: 0.32 }, // Fundamental A2 (rich on laptops)
      { f: 164.81, type: "sine", g: 0.25 }, // Perfect 5th E3
      { f: 220.0, type: "triangle", g: 0.20 }, // Octave A3
      { f: 329.63, type: "sine", g: 0.14 }, // Warm 5th E4
      { f: 440.0, type: "sine", g: 0.08 }, // Shimmer A4
    ];

    const droneFilter = this.ctx.createBiquadFilter();
    droneFilter.type = "lowpass";
    droneFilter.frequency.setValueAtTime(580, t0);
    droneFilter.Q.setValueAtTime(2.0, t0);
    droneFilter.connect(this.musicGain);

    droneSpecs.forEach((spec) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();

      osc.type = spec.type;
      osc.frequency.setValueAtTime(spec.f, t0);

      oscGain.gain.setValueAtTime(0.001, t0);
      oscGain.gain.linearRampToValueAtTime(spec.g, t0 + 2.0);

      osc.connect(oscGain);
      oscGain.connect(droneFilter);

      osc.start(t0);
      this.droneOscillators.push(osc);
    });

    // 3. Ethereal Dark Space Pad Chords (Hans Zimmer Tidal Swells)
    const padFrequencies = [110.0, 164.81, 261.63, 293.66];
    this.padGain = this.ctx.createGain();
    this.padGain.gain.setValueAtTime(0.001, t0);
    this.padGain.gain.linearRampToValueAtTime(0.28, t0 + 3.0);

    const padFilter = this.ctx.createBiquadFilter();
    padFilter.type = "lowpass";
    padFilter.frequency.setValueAtTime(750, t0);
    padFilter.Q.setValueAtTime(1.5, t0);
    this.padGain.connect(padFilter);
    padFilter.connect(this.musicGain);

    padFrequencies.forEach((freq, idx) => {
      if (!this.ctx || !this.padGain) return;
      const osc = this.ctx.createOscillator();
      osc.type = idx % 2 === 0 ? "sawtooth" : "triangle";
      osc.frequency.setValueAtTime(freq, t0);

      const voiceGain = this.ctx.createGain();
      voiceGain.gain.setValueAtTime(0.12, t0);

      osc.connect(voiceGain);
      voiceGain.connect(this.padGain);

      osc.start(t0);
      this.padOscillators.push(osc);
    });

    // Modulate Pad Gain over 14 seconds for cosmic breathing
    this.padLFO = this.ctx.createOscillator();
    this.padLFO.type = "sine";
    this.padLFO.frequency.setValueAtTime(0.07, t0);
    const padLFOGain = this.ctx.createGain();
    padLFOGain.gain.setValueAtTime(0.12, t0);
    this.padLFO.connect(padLFOGain);
    padLFOGain.connect(this.padGain.gain);
    this.padLFO.start(t0);

    // 4. Periodic Deep Space Pulsar / Sonar Echoes
    const triggerSonarEcho = () => {
      if (!this._isMusicEnabled || !this.ctx || !this.musicGain) return;

      const now = this.ctx.currentTime;
      const sonarPitches = [220.0, 261.63, 293.66, 329.63, 440.0];
      const baseFreq =
        sonarPitches[Math.floor(Math.random() * sonarPitches.length)];

      const pingOsc = this.ctx.createOscillator();
      const pingGain = this.ctx.createGain();
      const pingFilter = this.ctx.createBiquadFilter();

      pingOsc.type = "sine";
      pingOsc.frequency.setValueAtTime(baseFreq, now);
      pingOsc.frequency.exponentialRampToValueAtTime(
        baseFreq * 0.5,
        now + 0.35
      );

      pingFilter.type = "bandpass";
      pingFilter.frequency.setValueAtTime(baseFreq, now);
      pingFilter.Q.setValueAtTime(4.5, now);

      pingGain.gain.setValueAtTime(0.001, now);
      pingGain.gain.linearRampToValueAtTime(0.32, now + 0.08);
      pingGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.2);

      pingOsc.connect(pingFilter);
      pingFilter.connect(pingGain);
      pingGain.connect(this.musicGain);

      pingOsc.start(now);
      pingOsc.stop(now + 2.3);

      const echoOsc = this.ctx.createOscillator();
      const echoGain = this.ctx.createGain();
      echoOsc.type = "sine";
      echoOsc.frequency.setValueAtTime(baseFreq * 0.75, now + 0.45);
      echoGain.gain.setValueAtTime(0.001, now + 0.45);
      echoGain.gain.linearRampToValueAtTime(0.14, now + 0.52);
      echoGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.8);

      echoOsc.connect(pingFilter);
      echoOsc.start(now + 0.45);
      echoOsc.stop(now + 2.9);

      const nextDelay = 7000 + Math.random() * 5000;
      this.sonarTimer = setTimeout(triggerSonarEcho, nextDelay);
    };

    this.sonarTimer = setTimeout(triggerSonarEcho, 3500);
  }

  public stopAmbientMusic(): void {
    if (this.sonarTimer) {
      clearTimeout(this.sonarTimer);
      this.sonarTimer = null;
    }

    if (this.windLFO) {
      try {
        this.windLFO.stop();
        this.windLFO.disconnect();
      } catch {
        // Safe ignore
      }
      this.windLFO = null;
    }

    if (this.windSource) {
      try {
        this.windSource.stop();
        this.windSource.disconnect();
      } catch {
        // Safe ignore
      }
      this.windSource = null;
    }

    if (this.padLFO) {
      try {
        this.padLFO.stop();
        this.padLFO.disconnect();
      } catch {
        // Safe ignore
      }
      this.padLFO = null;
    }

    this.droneOscillators.forEach((osc) => {
      try {
        osc.stop();
        osc.disconnect();
      } catch {
        // Safe ignore
      }
    });
    this.droneOscillators = [];

    this.padOscillators.forEach((osc) => {
      try {
        osc.stop();
        osc.disconnect();
      } catch {
        // Safe ignore
      }
    });
    this.padOscillators = [];
  }
}

// Global Singleton Instance
export const soundManager = new QuantumSoundEngine();
