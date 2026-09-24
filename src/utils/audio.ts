import { WeaponType, DeathEffectType } from '../types';

let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let sfxGain: GainNode | null = null;
let musicGain: GainNode | null = null;
let isMuted = false;
let isMusicMuted = false;
let masterVolume = 0.8; // 0 to 1.0
let sfxVolume = 0.8; // 0 to 1.0
let musicVolume = 0.6; // 0 to 1.0
let retroSfxMode = true; // Default to authentic 8-bit retro arcade sounds!

export function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();

      // Master bus
      masterGain = audioCtx.createGain();
      masterGain.gain.setValueAtTime(isMuted ? 0 : masterVolume, audioCtx.currentTime);
      masterGain.connect(audioCtx.destination);

      // SFX bus
      sfxGain = audioCtx.createGain();
      sfxGain.gain.setValueAtTime(sfxVolume, audioCtx.currentTime);
      sfxGain.connect(masterGain);

      // Music bus
      musicGain = audioCtx.createGain();
      musicGain.gain.setValueAtTime(isMusicMuted ? 0 : musicVolume, audioCtx.currentTime);
      musicGain.connect(masterGain);

      // Route all node connects destined for audioCtx.destination into sfxGain
      const origConnect = AudioNode.prototype.connect as any;
      (AudioNode.prototype as any).connect = function (this: AudioNode, dest: any, ...args: any[]) {
        if (
          dest === audioCtx?.destination &&
          sfxGain &&
          this !== (masterGain as any) &&
          this !== (sfxGain as any) &&
          this !== (musicGain as any)
        ) {
          return origConnect.apply(this, [sfxGain, ...args]);
        }
        return origConnect.apply(this, [dest, ...args]);
      };
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function setSoundMuted(muted: boolean) {
  isMuted = muted;
  if (masterGain && audioCtx) {
    masterGain.gain.setValueAtTime(isMuted ? 0 : masterVolume, audioCtx.currentTime);
  }
}

export function getSoundMuted(): boolean {
  return isMuted;
}

export function setMasterVolume(vol: number) {
  masterVolume = Math.max(0, Math.min(1, vol));
  if (masterGain && audioCtx) {
    masterGain.gain.setValueAtTime(isMuted ? 0 : masterVolume, audioCtx.currentTime);
  }
}

export function getMasterVolume(): number {
  return masterVolume;
}

export function setSfxVolume(vol: number) {
  sfxVolume = Math.max(0, Math.min(1, vol));
  if (sfxGain && audioCtx) {
    sfxGain.gain.setValueAtTime(sfxVolume, audioCtx.currentTime);
  }
}

export function getSfxVolume(): number {
  return sfxVolume;
}

export function setMusicVolume(vol: number) {
  musicVolume = Math.max(0, Math.min(1, vol));
  if (musicGain && audioCtx) {
    musicGain.gain.setValueAtTime(isMusicMuted ? 0 : musicVolume, audioCtx.currentTime);
  }
}

export function getMusicVolume(): number {
  return musicVolume;
}

export function setMusicMuted(muted: boolean) {
  isMusicMuted = muted;
  if (musicGain && audioCtx) {
    musicGain.gain.setValueAtTime(isMusicMuted ? 0 : musicVolume, audioCtx.currentTime);
  }
}

export function getMusicMuted(): boolean {
  return isMusicMuted;
}

export function setRetroSfxMode(enabled: boolean) {
  retroSfxMode = enabled;
}

export function getRetroSfxMode(): boolean {
  return retroSfxMode;
}

export function playTestSound() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(587.33, now); // D5
  osc.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5
  gain.gain.setValueAtTime(0.2, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.25);
}

export function playShootSound(type: WeaponType) {
  if (isMuted || !type) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  if (type === 'pistol') {
    // Punchy electronic pop
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(620, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.08);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.08);
  } else if (type === 'ar') {
    // Rapid metallic zap
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(450, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.06);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.06);
  } else if (type === 'sniper') {
    // High-impact beam crack + deep sub echo
    const osc = ctx.createOscillator();
    const subOsc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(70, now + 0.28);

    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(140, now);
    subOsc.frequency.exponentialRampToValueAtTime(30, now + 0.35);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    subOsc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    subOsc.start(now);
    osc.stop(now + 0.35);
    subOsc.stop(now + 0.35);
  } else if (type === 'grenade') {
    // Thump launch
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.2);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.2);
  }
}

export function playExplosionSound() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const bufferSize = ctx.sampleRate * 0.5;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(600, now);
  filter.frequency.exponentialRampToValueAtTime(40, now + 0.45);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.35, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.48);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  noise.start(now);
}

export function playEatSound() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  const freqs = [440, 554, 659, 880];
  const chosen = freqs[Math.floor(Math.random() * freqs.length)];
  osc.frequency.setValueAtTime(chosen, now);
  osc.frequency.exponentialRampToValueAtTime(chosen * 1.5, now + 0.05);

  gain.gain.setValueAtTime(0.06, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.05);
}

export function playLootPickupSound() {
  if (isMuted) return;
  if (retroSfxMode) {
    playRetroPowerupSound();
    return;
  }
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const notes = [523.25, 659.25, 783.99, 1046.5]; // C E G C
  notes.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const start = now + idx * 0.04;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, start);

    gain.gain.setValueAtTime(0.12, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + 0.12);
  });
}

export function playKillSound() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const notes = [440, 660, 880, 1100];
  notes.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const start = now + idx * 0.05;

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, start);

    gain.gain.setValueAtTime(0.15, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.2);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + 0.2);
  });
}

export function playCashSound() {
  if (isMuted) return;
  if (retroSfxMode) {
    playRetroCoinSound();
    return;
  }
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const gain = ctx.createGain();

  osc1.type = 'triangle';
  osc2.type = 'sine';

  osc1.frequency.setValueAtTime(987.77, now); // B5
  osc1.frequency.setValueAtTime(1318.51, now + 0.08); // E6
  osc2.frequency.setValueAtTime(1318.51, now);
  osc2.frequency.setValueAtTime(1975.53, now + 0.08); // B6

  gain.gain.setValueAtTime(0.18, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

  osc1.connect(gain);
  osc2.connect(gain);
  gain.connect(ctx.destination);

  osc1.start(now);
  osc2.start(now);
  osc1.stop(now + 0.35);
  osc2.stop(now + 0.35);
}

export function playDeathEffectSound(type: DeathEffectType) {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  if (type === 'retro-pixel-kaboom' || type === 'nuclear-supernova' || type === 'cyber-matrix') {
    // 8-Bit Arcade Kaboom: Crunchy square drop + white noise burst (Metal Slug / Contra style)
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(32, now + 0.45);
    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.45);

    // Noise buffer crackle
    const bufferSize = ctx.sampleRate * 0.35;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.08));
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.25, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    noise.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noise.start(now);
  } else if (type === 'retro-crt-glitch') {
    // CRT Glitch: Stuttering bitcrushed square wave buzzer + frequency mod
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.setValueAtTime(1760, now + 0.05);
    osc.frequency.setValueAtTime(220, now + 0.1);
    osc.frequency.setValueAtTime(880, now + 0.15);
    osc.frequency.setValueAtTime(110, now + 0.22);
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.38);
  } else if (type === 'retro-comic-boom' || type === 'laser-fireworks') {
    // Comic POW!: Fast cartoon whistle pop + punchy hollow boom
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(220, now);
    osc1.frequency.exponentialRampToValueAtTime(880, now + 0.08);
    osc1.frequency.exponentialRampToValueAtTime(60, now + 0.32);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(120, now);
    osc2.frequency.exponentialRampToValueAtTime(40, now + 0.35);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);
    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.35);
    osc2.stop(now + 0.35);
  } else if (type === 'retro-arcade-ghost' || type === 'bat-swarm') {
    // 8-Bit Ghost Ascension: Ethereal ascending chiptune arpeggio
    const ghostNotes = [523.25, 659.25, 783.99, 1046.5, 1318.51];
    ghostNotes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const start = now + idx * 0.06;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);
      osc.frequency.linearRampToValueAtTime(freq * 1.08, start + 0.22);
      gain.gain.setValueAtTime(0.18, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.25);
    });
  } else if (type === 'retro-coin-jackpot' || type === 'golden-cash-storm') {
    // Arcade Jackpot: Rapid cascading gold coin chime fanfare
    const coinNotes = [987.77, 1318.51, 1648.14, 1975.53, 2637.02];
    coinNotes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const start = now + idx * 0.055;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.2, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.28);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.28);
    });
  } else if (type === 'retro-pixel-skull' || type === 'neon-skull') {
    // 16-Bit Doom Skull: Deep infernal roar downsweep
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(260, now);
    osc.frequency.linearRampToValueAtTime(140, now + 0.12);
    osc.frequency.linearRampToValueAtTime(220, now + 0.2);
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.5);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.5);
  } else if (type === 'retro-synth-vector' || type === 'plasma-storm') {
    // 80s Neon Vector: Laser polygon sweep with square wave resonance
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(150, now + 0.28);
    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.32);
  } else if (type === 'retro-voxel-shatter') {
    // 3D Voxel Shatter: Crisp tumbling wooden/brick pixel clatters
    for (let i = 0; i < 4; i++) {
      const start = now + i * 0.045;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(380 - i * 60, start);
      osc.frequency.exponentialRampToValueAtTime(90, start + 0.08);
      gain.gain.setValueAtTime(0.22, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.08);
    }
  } else if (type === 'retro-slime-splat') {
    // Toxic Slime Meltdown: Bubbly cartoon squelch & sizzle
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(480, now);
    osc.frequency.linearRampToValueAtTime(240, now + 0.08);
    osc.frequency.linearRampToValueAtTime(360, now + 0.14);
    osc.frequency.exponentialRampToValueAtTime(90, now + 0.32);
    gain.gain.setValueAtTime(0.28, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.35);
  } else if (type === 'retro-black-hole' || type === 'void-singularity') {
    // 16-Bit Cosmic Void: Downward gravitational suction warp
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(900, now);
    osc.frequency.exponentialRampToValueAtTime(38, now + 0.5);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.55);
  }
}

export function playShieldPickupSound() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const subOsc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  subOsc.type = 'triangle';

  // Uplifting futuristic energy barrier hum
  osc.frequency.setValueAtTime(320, now);
  osc.frequency.exponentialRampToValueAtTime(880, now + 0.25);
  subOsc.frequency.setValueAtTime(160, now);
  subOsc.frequency.exponentialRampToValueAtTime(440, now + 0.25);

  gain.gain.setValueAtTime(0.2, now);
  gain.gain.linearRampToValueAtTime(0.25, now + 0.15);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

  osc.connect(gain);
  subOsc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  subOsc.start(now);
  osc.stop(now + 0.4);
  subOsc.stop(now + 0.4);
}

export function playShieldDeflectSound() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  // Resonant electric barrier deflect
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(1200, now);
  osc.frequency.exponentialRampToValueAtTime(300, now + 0.18);

  gain.gain.setValueAtTime(0.18, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.2);
}

export function playObstacleHitSound() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  // Heavy titanium clang / ricochet
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(450, now);
  osc.frequency.exponentialRampToValueAtTime(90, now + 0.12);

  gain.gain.setValueAtTime(0.2, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.14);
}

export function playAbilitySound(archetype: string) {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  if (archetype === 'angel') {
    // Divine heavenly chime + ascending bell
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();
    osc1.type = 'sine';
    osc2.type = 'triangle';
    osc1.frequency.setValueAtTime(523.25, now); // C5
    osc1.frequency.exponentialRampToValueAtTime(1046.5, now + 0.35); // C6
    osc2.frequency.setValueAtTime(659.25, now); // E5
    osc2.frequency.exponentialRampToValueAtTime(1318.5, now + 0.35); // E6
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);
    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.45);
    osc2.stop(now + 0.45);
  } else if (archetype === 'devil') {
    // Hellfire roar burst
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.linearRampToValueAtTime(80, now + 0.3);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.32);
  } else if (archetype === 'blackhole') {
    // Singularity deep cosmic warp suck
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.4);
    gain.gain.setValueAtTime(0.32, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.42);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.42);
  } else if (archetype === 'robot') {
    // Overclock turbine rev up
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(950, now + 0.3);
    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.35);
  } else if (archetype === 'dragon') {
    // Dragon flame breath hiss & flare
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(380, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.35);
    gain.gain.setValueAtTime(0.28, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.38);
  } else {
    // Cyber Glitch Dash quantum phase shift
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.setValueAtTime(440, now + 0.05);
    osc.frequency.setValueAtTime(1320, now + 0.1);
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.22);
  }
}

export function playCrateTickSound() {
  if (isMuted) return;
  if (retroSfxMode) {
    playRetroCrateTick();
    return;
  }
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(950, now);
  osc.frequency.exponentialRampToValueAtTime(320, now + 0.025);

  gain.gain.setValueAtTime(0.09, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.025);
}

export function playCrateWinSound(rarity: 'common' | 'uncommon' | 'epic' | 'legendary' | 'mythic' | 'secret') {
  if (isMuted) return;
  if (retroSfxMode && (rarity === 'secret' || rarity === 'mythic' || rarity === 'legendary')) {
    playRetroVictoryFanfare();
    return;
  }
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  if (rarity === 'secret') {
    const freqs = [523.25, 659.25, 783.99, 1046.5, 1318.5, 1567.98, 2093.0];
    freqs.forEach((f, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(f, now + idx * 0.08);
      gain.gain.setValueAtTime(0.18, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.7);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.7);
    });
  } else if (rarity === 'mythic') {
    [440, 554.37, 659.25, 880, 1108.7].forEach((f, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(f, now + idx * 0.07);
      gain.gain.setValueAtTime(0.14, now + idx * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.55);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.07);
      osc.stop(now + idx * 0.07 + 0.55);
    });
  } else if (rarity === 'legendary') {
    [523.25, 659.25, 783.99, 1046.5].forEach((f, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, now + idx * 0.09);
      gain.gain.setValueAtTime(0.15, now + idx * 0.09);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.09 + 0.45);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.09);
      osc.stop(now + idx * 0.09 + 0.45);
    });
  } else if (rarity === 'epic') {
    [440, 659.25, 880].forEach((f, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now + idx * 0.08);
      gain.gain.setValueAtTime(0.15, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.35);
    });
  } else {
    [523.25, 659.25].forEach((f, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now + idx * 0.07);
      gain.gain.setValueAtTime(0.12, now + idx * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.07);
      osc.stop(now + idx * 0.07 + 0.25);
    });
  }
}

// ==============================================================
// 8-BIT / 16-BIT RETRO CHIPTUNE LOBBY MUSIC SEQUENCER
// ==============================================================

type MusicStateListener = (isPlaying: boolean) => void;
const musicListeners = new Set<MusicStateListener>();

export function subscribeMusicState(listener: MusicStateListener): () => void {
  musicListeners.add(listener);
  listener(isLobbyMusicPlaying());
  return () => {
    musicListeners.delete(listener);
  };
}

function notifyMusicListeners() {
  const playing = isLobbyMusicPlaying();
  musicListeners.forEach((fn) => fn(playing));
}

let isMusicPlaying = false;
let musicSchedulerTimer: any = null;
let nextStepTime = 0;
let currentStep = 0;

// 128 BPM -> 16th note step = 0.1171875s
const TEMPO = 128;
const SECONDS_PER_STEP = 60 / (TEMPO * 4); // ~0.117s
const TOTAL_STEPS = 128; // 8 bars of 16 steps

// Note frequency map (in Hz)
const N = {
  REST: 0,
  // Bass / Octave 2
  C2: 65.41,
  D2: 73.42,
  Eb2: 77.78,
  E2: 82.41,
  F2: 87.31,
  G2: 98.0,
  A2: 110.0,
  Bb2: 116.54,
  B2: 123.47,
  // Octave 3
  C3: 130.81,
  D3: 146.83,
  Eb3: 155.56,
  E3: 164.81,
  F3: 174.61,
  G3: 196.0,
  A3: 220.0,
  Bb3: 233.08,
  B3: 246.94,
  // Octave 4
  C4: 261.63,
  D4: 293.66,
  Eb4: 311.13,
  E4: 329.63,
  F4: 349.23,
  G4: 392.0,
  A4: 440.0,
  Bb4: 466.16,
  B4: 493.88,
  // Octave 5
  C5: 523.25,
  D5: 587.33,
  Eb5: 622.25,
  E5: 659.25,
  F5: 698.46,
  G5: 783.99,
  A5: 880.0,
  Bb5: 932.33,
  B5: 987.77,
  // Octave 6
  C6: 1046.5,
  D6: 1174.66,
  E6: 1318.51,
  F6: 1396.91,
};

// 128-step Lead Melody (Classic 8-bit retro cyberpunk theme)
const LEAD_MELODY: number[] = [
  // Bar 1 (Dm)
  N.D5, N.REST, N.D5, N.REST, N.F5, N.REST, N.G5, N.REST,
  N.A5, N.REST, N.REST, N.A5, N.G5, N.REST, N.F5, N.REST,
  // Bar 2 (C)
  N.E5, N.REST, N.C5, N.REST, N.E5, N.REST, N.G5, N.REST,
  N.F5, N.REST, N.REST, N.REST, N.E5, N.REST, N.D5, N.REST,
  // Bar 3 (Bb)
  N.D5, N.REST, N.F5, N.REST, N.A5, N.REST, N.D6, N.REST,
  N.C6, N.REST, N.A5, N.REST, N.G5, N.REST, N.F5, N.REST,
  // Bar 4 (Am / A)
  N.E5, N.REST, N.E5, N.REST, N.G5, N.REST, N.F5, N.REST,
  N.E5, N.REST, N.D5, N.REST, N.E5, N.REST, N.A4, N.REST,

  // Bar 5 (F Major - Heroic Theme)
  N.F5, N.REST, N.A5, N.REST, N.C6, N.REST, N.A5, N.REST,
  N.Bb5, N.REST, N.REST, N.A5, N.G5, N.REST, N.F5, N.REST,
  // Bar 6 (C)
  N.G5, N.REST, N.E5, N.REST, N.G5, N.REST, N.C6, N.REST,
  N.A5, N.REST, N.REST, N.REST, N.G5, N.REST, N.E5, N.REST,
  // Bar 7 (Bb)
  N.D5, N.REST, N.F5, N.REST, N.A5, N.REST, N.D6, N.REST,
  N.C6, N.REST, N.Bb5, N.REST, N.A5, N.REST, N.G5, N.REST,
  // Bar 8 (Turnaround: A -> Dm)
  N.A5, N.REST, N.Bb5, N.REST, N.C6, N.REST, N.D6, N.REST,
  N.E6, N.REST, N.F6, N.REST, N.E6, N.REST, N.C6, N.REST,
];

// 128-step Bassline (Triangle wave driving retro pulse)
const BASSLINE: number[] = [
  // Bar 1 (Dm)
  N.D2, N.D2, N.D3, N.D2, N.D2, N.D2, N.F2, N.G2,
  N.D2, N.D2, N.D3, N.D2, N.D2, N.C2, N.D2, N.F2,
  // Bar 2 (C)
  N.C2, N.C2, N.C3, N.C2, N.C2, N.C2, N.E2, N.G2,
  N.C2, N.C2, N.C3, N.C2, N.C2, N.B2, N.C2, N.E2,
  // Bar 3 (Bb)
  N.Bb2, N.Bb2, N.Bb3, N.Bb2, N.Bb2, N.Bb2, N.D3, N.F3,
  N.Bb2, N.Bb2, N.Bb3, N.Bb2, N.Bb2, N.A2, N.Bb2, N.D3,
  // Bar 4 (A)
  N.A2, N.A2, N.A3, N.A2, N.A2, N.A2, N.C3, N.E3,
  N.A2, N.A2, N.A3, N.A2, N.A2, N.G2, N.A2, N.C3,

  // Bar 5 (F)
  N.F2, N.F2, N.F3, N.F2, N.F2, N.F2, N.A2, N.C3,
  N.F2, N.F2, N.F3, N.F2, N.F2, N.E2, N.F2, N.A2,
  // Bar 6 (C)
  N.C2, N.C2, N.C3, N.C2, N.C2, N.C2, N.E2, N.G2,
  N.C2, N.C2, N.C3, N.C2, N.C2, N.B2, N.C2, N.E2,
  // Bar 7 (Bb)
  N.Bb2, N.Bb2, N.Bb3, N.Bb2, N.Bb2, N.Bb2, N.D3, N.F3,
  N.Bb2, N.Bb2, N.Bb3, N.Bb2, N.Bb2, N.A2, N.Bb2, N.D3,
  // Bar 8 (A -> Dm)
  N.A2, N.A2, N.A3, N.A2, N.A2, N.A2, N.C3, N.E3,
  N.D2, N.D2, N.D3, N.D2, N.D3, N.D3, N.C3, N.A2,
];

// 16-step Arpeggio chords repeating across bars
const ARP_CHORDS = [
  [N.D4, N.F4, N.A4, N.D5], // Dm
  [N.C4, N.E4, N.G4, N.C5], // C
  [N.Bb3, N.D4, N.F4, N.Bb4], // Bb
  [N.A3, N.C4, N.E4, N.A4], // Am
  [N.F3, N.A3, N.C4, N.F4], // F
  [N.C4, N.E4, N.G4, N.C5], // C
  [N.Bb3, N.D4, N.F4, N.Bb4], // Bb
  [N.A3, N.D4, N.E4, N.A4], // A
];

function playChiptuneTone(
  freq: number,
  time: number,
  duration: number,
  type: OscillatorType,
  vol: number,
  decay = true
) {
  if (freq === 0 || !musicGain || !audioCtx) return;
  try {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, time);

    gain.gain.setValueAtTime(vol, time);
    if (decay) {
      gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);
    } else {
      gain.gain.setValueAtTime(vol, time + duration * 0.8);
      gain.gain.linearRampToValueAtTime(0.0001, time + duration);
    }

    osc.connect(gain);
    gain.connect(musicGain);

    osc.start(time);
    osc.stop(time + duration);
  } catch {
    // ignore
  }
}

function playRetroDrum(step: number, time: number) {
  if (!musicGain || !audioCtx) return;
  const beat = step % 16;

  // 1. Kick Drum (Steps 0, 4, 8, 12 + syncopation on step 10)
  if (beat === 0 || beat === 4 || beat === 8 || beat === 12 || beat === 10) {
    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(130, time);
      osc.frequency.exponentialRampToValueAtTime(25, time + 0.08);

      gain.gain.setValueAtTime(0.35, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.09);

      osc.connect(gain);
      gain.connect(musicGain);
      osc.start(time);
      osc.stop(time + 0.09);
    } catch {}
  }

  // 2. Snare Drum (Beats 4 and 12 -> 2 and 4 in 4/4)
  if (beat === 4 || beat === 12) {
    try {
      const bufferSize = audioCtx.sampleRate * 0.08;
      const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = audioCtx.createBufferSource();
      noise.buffer = buffer;

      const filter = audioCtx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1200, time);

      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(0.18, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.08);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(musicGain);
      noise.start(time);
    } catch {}
  }

  // 3. Hi-Hat (Every 16th note, accented on offbeats)
  try {
    const isAccented = beat % 2 === 1;
    const dur = isAccented ? 0.035 : 0.02;
    const bufferSize = audioCtx.sampleRate * dur;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;

    const filter = audioCtx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(8000, time);

    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(isAccented ? 0.06 : 0.03, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(musicGain);
    noise.start(time);
  } catch {}
}

function scheduleMusicStep(step: number, time: number) {
  // 1. Lead Melody
  const leadFreq = LEAD_MELODY[step % TOTAL_STEPS];
  if (leadFreq > 0) {
    playChiptuneTone(leadFreq, time, SECONDS_PER_STEP * 1.8, 'square', 0.12, true);
  }

  // 2. Bassline
  const bassFreq = BASSLINE[step % TOTAL_STEPS];
  if (bassFreq > 0) {
    playChiptuneTone(bassFreq, time, SECONDS_PER_STEP * 0.9, 'triangle', 0.22, true);
  }

  // 3. Arpeggio Counter-Melody
  const barIndex = Math.floor((step % TOTAL_STEPS) / 16);
  const chord = ARP_CHORDS[barIndex % ARP_CHORDS.length];
  const arpNote = chord[step % 4];
  if (arpNote > 0) {
    playChiptuneTone(arpNote, time, SECONDS_PER_STEP * 0.8, 'sawtooth', 0.04, true);
  }

  // 4. Rhythm Drums
  playRetroDrum(step, time);
}

function musicSchedulerLoop() {
  if (!isMusicPlaying || !audioCtx) return;

  const LOOKAHEAD_HORIZON = 0.15; // Schedule up to 150ms ahead
  while (nextStepTime < audioCtx.currentTime + LOOKAHEAD_HORIZON) {
    scheduleMusicStep(currentStep, nextStepTime);
    nextStepTime += SECONDS_PER_STEP;
    currentStep = (currentStep + 1) % TOTAL_STEPS;
  }
}

export function startLobbyMusic() {
  if (typeof window === 'undefined') return;
  const ctx = getAudioContext();
  if (!ctx) return;

  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }

  if (isMusicPlaying) return;
  isMusicPlaying = true;

  if (musicGain) {
    musicGain.gain.cancelScheduledValues(ctx.currentTime);
    musicGain.gain.setValueAtTime(0, ctx.currentTime);
    musicGain.gain.linearRampToValueAtTime(isMusicMuted ? 0 : musicVolume, ctx.currentTime + 0.6);
  }

  nextStepTime = ctx.currentTime + 0.05;
  currentStep = 0;

  if (musicSchedulerTimer) {
    clearInterval(musicSchedulerTimer);
  }
  musicSchedulerTimer = setInterval(musicSchedulerLoop, 35);
  notifyMusicListeners();
}

export function stopLobbyMusic(fadeSec = 0.4) {
  if (!isMusicPlaying) return;
  isMusicPlaying = false;

  if (musicGain && audioCtx) {
    try {
      musicGain.gain.cancelScheduledValues(audioCtx.currentTime);
      musicGain.gain.linearRampToValueAtTime(0.0001, audioCtx.currentTime + fadeSec);
    } catch {}
  }

  setTimeout(() => {
    if (!isMusicPlaying && musicSchedulerTimer) {
      clearInterval(musicSchedulerTimer);
      musicSchedulerTimer = null;
    }
  }, (fadeSec + 0.05) * 1000);

  notifyMusicListeners();
}

export function toggleLobbyMusic(): boolean {
  if (isLobbyMusicPlaying()) {
    stopLobbyMusic();
    return false;
  } else {
    startLobbyMusic();
    return true;
  }
}

export function isLobbyMusicPlaying(): boolean {
  return isMusicPlaying;
}

// Auto-unlock audio on first touch/interaction (satisfies mobile browser audio restrictions)
if (typeof window !== 'undefined') {
  const unlockAudio = () => {
    const ctx = getAudioContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    window.removeEventListener('pointerdown', unlockAudio);
    window.removeEventListener('keydown', unlockAudio);
    window.removeEventListener('touchstart', unlockAudio);
  };
  window.addEventListener('pointerdown', unlockAudio, { passive: true });
  window.addEventListener('keydown', unlockAudio, { passive: true });
  window.addEventListener('touchstart', unlockAudio, { passive: true });
}

// ==============================================================
// AUTHENTIC 8-BIT / RETRO ARCADE SOUND EFFECTS (Pixabay Retro Games style)
// ==============================================================

/**
 * Authentic 8-bit Dual-Tone Coin Pickup (B5 -> E6 square wave pulse)
 */
export function playRetroCoinSound() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'square';
  osc.frequency.setValueAtTime(987.77, now); // B5
  osc.frequency.setValueAtTime(1318.51, now + 0.06); // E6

  gain.gain.setValueAtTime(0.18, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.22);
}

/**
 * Classic 8-Bit Ascending Powerup Arpeggio (C5 -> E5 -> G5 -> B5 -> C6)
 */
export function playRetroPowerupSound() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  const notes = [523.25, 659.25, 783.99, 987.77, 1046.5, 1318.51];
  notes.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const start = now + idx * 0.045;

    osc.type = 'square';
    osc.frequency.setValueAtTime(freq, start);

    gain.gain.setValueAtTime(0.14, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(start);
    osc.stop(start + 0.12);
  });
}

/**
 * 8-Bit Retro Laser Blaster Chirp
 */
export function playRetroLaserSound(weaponType: WeaponType = 'ar') {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'square';

  if (weaponType === 'sniper') {
    osc.frequency.setValueAtTime(1400, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.18);
    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.18);
  } else if (weaponType === 'pistol') {
    osc.frequency.setValueAtTime(850, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.07);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.07);
  } else {
    // AR / default
    osc.frequency.setValueAtTime(1050, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.09);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.09);
  }
}

/**
 * 8-Bit Retro Hit / Crunch Impact
 */
export function playRetroHitSound() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  // Square chirp
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(320, now);
  osc.frequency.exponentialRampToValueAtTime(60, now + 0.08);
  gain.gain.setValueAtTime(0.2, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.08);
}

/**
 * 8-Bit Retro Boost Sweep
 */
export function playRetroBoostSound() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(160, now);
  osc.frequency.linearRampToValueAtTime(480, now + 0.15);
  gain.gain.setValueAtTime(0.12, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.16);
}

/**
 * 8-Bit Retro Button / Menu Click Blip
 */
export function playRetroButtonClick() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'square';
  osc.frequency.setValueAtTime(800, now);
  osc.frequency.setValueAtTime(1200, now + 0.025);
  gain.gain.setValueAtTime(0.1, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.05);
}

/**
 * 8-Bit Retro Roulette Tick (mechanical arcade click)
 */
export function playRetroCrateTick() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'square';
  osc.frequency.setValueAtTime(1400, now);
  osc.frequency.exponentialRampToValueAtTime(400, now + 0.02);
  gain.gain.setValueAtTime(0.14, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.02);
}

/**
 * 8-Bit Triumphant Fanfare (for winning rare/mythic/secret skins)
 */
export function playRetroVictoryFanfare() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  const fanfare = [
    { f: 392.0, d: 0.09 }, // G4
    { f: 523.25, d: 0.09 }, // C5
    { f: 659.25, d: 0.09 }, // E5
    { f: 783.99, d: 0.14 }, // G5
    { f: 659.25, d: 0.09 }, // E5
    { f: 1046.5, d: 0.35 }, // C6
  ];

  let elapsed = 0;
  fanfare.forEach((note) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const start = now + elapsed;

    osc.type = 'square';
    osc.frequency.setValueAtTime(note.f, start);

    gain.gain.setValueAtTime(0.18, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + note.d);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(start);
    osc.stop(start + note.d);
    elapsed += note.d * 0.9;
  });
}

/**
 * 8-Bit Retro Game Over Sound (descending minor arpeggio)
 */
export function playRetroGameOverSound() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  const notes = [440, 392, 349.23, 293.66, 220]; // A4 -> G4 -> F4 -> D4 -> A3
  notes.forEach((f, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const start = now + idx * 0.1;

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(f, start);
    osc.frequency.exponentialRampToValueAtTime(f * 0.85, start + 0.16);

    gain.gain.setValueAtTime(0.18, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.18);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(start);
    osc.stop(start + 0.18);
  });
}



