import { measureLufs, measureTruePeak, detectBPM } from './dsp';
import { computeCommercialReadiness, CommercialReadiness } from './commercialScore';

// --- Tipos de datos para el análisis ---
export interface AudioFeatures {
  danceability: number;
  energy: number;
  valence: number;
  tempo: number;
  duration: number;
}

export interface PlatformDNAScore {
  tiktokHookPotential: number;
  youtubeRetentionPotential: number;
}

export interface MarketDNAScore {
  commercialReadiness: number;
  artistPopularity: number;
  genreCompetition: number;
}

export interface HitPredictionResult {
  overallScore: number;
  viralProbability: string;
  hitDNA: number;
  platformDNA: PlatformDNAScore;
  marketDNA: MarketDNAScore;
  analysis: {
    strengths: string[];
    weaknesses: string[];
    summary: string;
  };
}

// --- Base de datos de géneros (simplificada) ---
const GENRE_PROFILES: Record<string, { bpmRange: [number, number]; optimalDuration: [number, number]; danceabilityBias: number; }> = {
  'reggaeton': { bpmRange: [88, 104], optimalDuration: [150, 210], danceabilityBias: 0.2 },
  'pop': { bpmRange: [95, 125], optimalDuration: [150, 210], danceabilityBias: 0.15 },
  'trap': { bpmRange: [130, 160], optimalDuration: [120, 180], danceabilityBias: 0.1 },
  'rock': { bpmRange: [90, 160], optimalDuration: [180, 240], danceabilityBias: 0.0 },
  'default': { bpmRange: [80, 140], optimalDuration: [150, 240], danceabilityBias: 0.05 },
};

function getGenreProfile(genre: string) {
  const g = genre.toLowerCase();
  if (g.includes('reggaeton') || g.includes('dembow')) return GENRE_PROFILES['reggaeton'];
  if (g.includes('pop')) return GENRE_PROFILES['pop'];
  if (g.includes('trap') || g.includes('drill')) return GENRE_PROFILES['trap'];
  if (g.includes('rock') || g.includes('metal')) return GENRE_PROFILES['rock'];
  return GENRE_PROFILES['default'];
}

// --- Cálculo de Características del Audio (ADN del Hit) ---
function estimateDanceability(buf: AudioBuffer, bpm: number): number {
  const safeBpm = Number.isFinite(bpm) && bpm > 0 ? bpm : 120;
  const bpmNorm = Math.min(1, safeBpm / 130); // Normalizar a 130 BPM
  const lufsRes = measureLufs(buf).integrated; // Usar LUFS como proxy de energía de graves
  const bassEnergy = Number.isFinite(lufsRes) ? lufsRes : -14;
  const bassScore = Math.max(0, Math.min(1, (bassEnergy + 20) / 15)); // Mapear a 0-1
  const score = Math.round((bpmNorm * 0.6 + bassScore * 0.4) * 100);
  return Number.isFinite(score) ? score : 60;
}

function estimateEnergy(buf: AudioBuffer): number {
  const lufsRes = measureLufs(buf).integrated;
  const lufs = Number.isFinite(lufsRes) ? lufsRes : -14;
  const energyScore = Math.max(0, Math.min(1, (lufs + 20) / 15));
  const score = Math.round(energyScore * 100);
  return Number.isFinite(score) ? score : 65;
}

function estimateValence(buf: AudioBuffer, key: string): number {
  const isMajor = (key || '').includes('Mayor') || (key || '').includes('Major');
  const baseScore = isMajor ? 0.7 : 0.3;
  return Math.round(baseScore * 100);
}

// --- Cálculo del ADN de Plataforma ---
function calculateTikTokPotential(buf: AudioBuffer, bpm: number, duration: number): number {
  const chData = buf.getChannelData(0);
  const totalSamples = chData.length;
  if (totalSamples === 0) return 50;

  const windowSec = Math.min(15, Math.max(1, duration));
  const windowSize = Math.max(1, Math.floor(buf.sampleRate * windowSec));
  let maxEnergy = 0;

  if (totalSamples <= windowSize) {
    let sum = 0;
    for (let j = 0; j < totalSamples; j++) {
      sum += Math.abs(chData[j] || 0);
    }
    maxEnergy = sum / totalSamples;
  } else {
    for (let i = 0; i <= totalSamples - windowSize; i += windowSize) {
      let sum = 0;
      for (let j = 0; j < windowSize; j++) {
        sum += Math.abs(chData[i + j] || 0);
      }
      maxEnergy = Math.max(maxEnergy, sum / windowSize);
    }
  }

  const energyScore = Math.min(100, (maxEnergy * 1000));
  const durationPenalty = duration > 210 ? 0.7 : 1.0;
  const res = Math.round(energyScore * durationPenalty);
  return Number.isFinite(res) ? res : 60;
}

function calculateYouTubeRetention(buf: AudioBuffer, duration: number): number {
  const chData = buf.getChannelData(0);
  const totalSamples = chData.length;
  if (totalSamples === 0) return 65;

  const maxSamples = Math.min(totalSamples, Math.floor(buf.sampleRate * 30)); // Máximo primeros 30 segundos o largo de pista
  let introEnergy = 0;
  for (let i = 0; i < maxSamples; i++) {
    introEnergy += Math.abs(chData[i] || 0);
  }
  introEnergy /= Math.max(1, maxSamples);
  const introScore = Math.min(100, introEnergy * 800);
  const structureScore = duration > 150 && duration < 240 ? 100 : 70;
  const res = Math.round(introScore * 0.7 + structureScore * 0.3);
  return Number.isFinite(res) ? res : 70;
}

// --- Función Principal ---
export function predictHitPotential(
  buffer: AudioBuffer,
  fileName: string,
  detectedGenre: string,
  commercialReadiness: CommercialReadiness,
  artistPopularity: number = 50 // 0-100, valor por defecto
): HitPredictionResult {
  // 1. ADN del Hit
  const bpm = detectBPM(buffer);
  const duration = buffer.duration || 180;
  const genreProfile = getGenreProfile(detectedGenre);

  const danceability = estimateDanceability(buffer, bpm);
  const energy = estimateEnergy(buffer);
  const valence = estimateValence(buffer, 'C Mayor'); // Placeholder, se puede mejorar

  const bpmScore = bpm >= genreProfile.bpmRange[0] && bpm <= genreProfile.bpmRange[1] ? 100 : 70;
  const durationScore = duration >= genreProfile.optimalDuration[0] && duration <= genreProfile.optimalDuration[1] ? 100 : 75;
  const audioQualityScore = commercialReadiness?.components?.find(c => c.id === 'lufs')?.score || 50;

  const hitDNAVal = (danceability * 0.25) + (energy * 0.20) + (valence * 0.15) +
    (bpmScore * 0.15) + (durationScore * 0.10) + (audioQualityScore * 0.15);
  const hitDNA = Number.isFinite(hitDNAVal) ? Math.round(hitDNAVal) : 70;

  // 2. ADN de Plataforma
  const tiktokHookPotential = calculateTikTokPotential(buffer, bpm, duration);
  const youtubeRetentionPotential = calculateYouTubeRetention(buffer, duration);
  const platformDNA = { tiktokHookPotential, youtubeRetentionPotential };

  // 3. ADN de Mercado
  const genreCompetition = 50 + (Math.random() * 30 - 15); // Simulación, en producción se conectaría a una API
  const readinessVal = Number.isFinite(commercialReadiness?.total) ? commercialReadiness.total : 75;
  const marketDNA = {
    commercialReadiness: readinessVal,
    artistPopularity: Number.isFinite(artistPopularity) ? artistPopularity : 50,
    genreCompetition: Math.round(genreCompetition),
  };

  // 4. Cálculo Final
  const overallVal = (hitDNA * 0.35) +
    (((tiktokHookPotential + youtubeRetentionPotential) / 2) * 0.40) +
    (((marketDNA.commercialReadiness + marketDNA.artistPopularity + marketDNA.genreCompetition) / 3) * 0.25);
  const overallScore = Number.isFinite(overallVal) ? Math.round(overallVal) : 70;

  // 5. Análisis Cualitativo
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  if (danceability > 70) strengths.push('Alta bailabilidad, ideal para tendencias de baile.');
  else weaknesses.push('Baja bailabilidad, puede no destacar en TikTok.');
  if (energy > 75) strengths.push('Alta energía, capta la atención rápidamente.');
  else weaknesses.push('Energía media, puede pasar desapercibida.');
  if (tiktokHookPotential > 70) strengths.push('Excelente potencial de gancho para TikTok.');
  else weaknesses.push('El gancho para TikTok no es lo suficientemente fuerte.');
  if (youtubeRetentionPotential > 70) strengths.push('Alta retención en YouTube.');
  else weaknesses.push('La retención en YouTube es mejorable.');
  if (commercialReadiness.total > 80) strengths.push('Mezcla lista para el mercado.');
  else weaknesses.push('La mezcla necesita ajustes técnicos.');

  let summary = '';
  if (overallScore >= 80) summary = 'Tu canción tiene un potencial de hit muy alto. Los datos indican que encaja perfectamente con las tendencias actuales.';
  else if (overallScore >= 60) summary = 'Tu canción tiene un buen potencial. Con algunos ajustes en las áreas débiles, podría destacar.';
  else summary = 'El potencial es limitado. Se recomienda trabajar en los puntos débiles para mejorar sus posibilidades.';

  const viralProbability = overallScore >= 80 ? 'ALTA' : overallScore >= 60 ? 'MEDIA' : 'BAJA';

  return {
    overallScore,
    viralProbability,
    hitDNA,
    platformDNA,
    marketDNA,
    analysis: { strengths, weaknesses, summary },
  };
}
