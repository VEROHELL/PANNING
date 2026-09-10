import { analyzeAudioBuffer } from '../utils/audioAnalyzer';
import { AnalysisReport } from '../types';

export interface DemoTrackItem {
  id: string;
  name: string;
  artist: string;
  genre: string;
  description: string;
  expectedScoreTag: '0-50 (Diamante en Bruto)' | '51-79 (Casi Pro)' | '80-100 (Hit Comercial)';
  badgeColor: string;
  durationSec: number;
}

export const DEMO_TRACKS: DemoTrackItem[] = [
  {
    id: 'demo-medium',
    name: 'Noches en la Ciudad (Demo Coro)',
    artist: 'Camilo R. & Studio Lab',
    genre: 'Urbano / Trap Latino',
    description: 'Estructura sólida y coro pegajoso, pero con problemas de Sub-Bass y bajo volumen comercial.',
    expectedScoreTag: '51-79 (Casi Pro)',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    durationSec: 154,
  },
  {
    id: 'demo-low',
    name: 'Intro Lunar (Maqueta Inicial)',
    artist: 'BeatMaker 09',
    genre: 'R&B / Synthwave Lento',
    description: 'Arranque de 45 segundos sin gancho, voz tapada por el sinte y master a -16 LUFS.',
    expectedScoreTag: '0-50 (Diamante en Bruto)',
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    durationSec: 178,
  },
  {
    id: 'demo-high',
    name: 'Fuego en el Club (Master Final)',
    artist: 'DJ Nova & La Firma',
    genre: 'Reggaetón / Club Hit',
    description: 'Gancho instantáneo a los 8 segundos, pegada sidechain perfecta y volumen a -8.8 LUFS.',
    expectedScoreTag: '80-100 (Hit Comercial)',
    badgeColor: 'bg-[#CCFF00]/20 text-[#CCFF00] border-[#CCFF00]/30',
    durationSec: 142,
  },
];

/**
 * Procedurally generates an AudioBuffer for any demo so the Web Audio engine
 * can decode, play back, and analyze authentic sound waves in real time.
 */
export function createSyntheticDemoAudioBuffer(
  audioCtx: AudioContext,
  demoId: string
): AudioBuffer {
  const sampleRate = audioCtx.sampleRate;
  const duration = demoId === 'demo-low' ? 12 : demoId === 'demo-high' ? 14 : 15;
  const buffer = audioCtx.createBuffer(2, sampleRate * duration, sampleRate);
  const left = buffer.getChannelData(0);
  const right = buffer.getChannelData(1);

  const bpm = demoId === 'demo-low' ? 84 : demoId === 'demo-high' ? 98 : 120;
  const beatSec = 60 / bpm;

  for (let i = 0; i < buffer.length; i++) {
    const t = i / sampleRate;
    const beatPos = (t % beatSec) / beatSec;
    const barPos = (t % (beatSec * 4)) / (beatSec * 4);

    let sample = 0;

    // Kick drum synthesis on beat
    const kickDecay = Math.exp(-beatPos * 18);
    const kickFreq = 120 * Math.exp(-beatPos * 25) + 42;
    const kick = Math.sin(2 * Math.PI * kickFreq * t) * kickDecay;

    // Bassline / 808
    const bassFreq = demoId === 'demo-low' ? 45 : demoId === 'demo-high' ? 55 : 50;
    const bassMod = Math.sin(2 * Math.PI * (bassFreq + Math.sin(t * 3) * 4) * t);
    const bass = bassMod * (0.35 + Math.sin(t * 1.5) * 0.15);

    // Hi-hats
    const hatPos = (t % (beatSec / 2)) / (beatSec / 2);
    const hatNoise = (Math.random() * 2 - 1) * Math.exp(-hatPos * 40) * 0.12;

    // Synth chord pad
    const chordFreq1 = demoId === 'demo-low' ? 220 : demoId === 'demo-high' ? 330 : 261.63;
    const chordFreq2 = chordFreq1 * 1.25;
    const chordFreq3 = chordFreq1 * 1.5;
    const pad = (
      Math.sin(2 * Math.PI * chordFreq1 * t) * 0.1 +
      Math.sin(2 * Math.PI * chordFreq2 * t) * 0.08 +
      Math.sin(2 * Math.PI * chordFreq3 * t) * 0.06
    ) * (0.5 + Math.sin(t * 0.8) * 0.4);

    // Hook lead melody
    let lead = 0;
    if (demoId === 'demo-high' || (demoId === 'demo-medium' && t > 4)) {
      const melodyFreq = 440 * (1 + ((Math.floor(t * 2) % 4) * 0.25));
      lead = Math.sin(2 * Math.PI * melodyFreq * t) * 0.14 * (1 - (t % 0.5));
    }

    if (demoId === 'demo-low') {
      // Quiet intro, muddy sub
      const subMud = Math.sin(2 * Math.PI * 30 * t) * 0.45;
      sample = (kick * 0.2) + subMud + (pad * 0.4) + (hatNoise * 0.05);
    } else if (demoId === 'demo-high') {
      // Punchy, loud, crisp
      sample = (kick * 0.5) + (bass * 0.4) + (hatNoise * 0.2) + (pad * 0.25) + (lead * 0.3);
    } else {
      // Medium: nice vibe, slight mud
      sample = (kick * 0.4) + (bass * 0.5) + (hatNoise * 0.15) + (pad * 0.3) + (lead * 0.2);
    }

    // Apply stereo pan and soft saturation
    const softClipped = Math.tanh(sample * 1.2) * 0.85;
    left[i] = softClipped * (1 - Math.sin(t * 0.5) * 0.1);
    right[i] = softClipped * (1 + Math.sin(t * 0.5) * 0.1);
  }

  return buffer;
}
