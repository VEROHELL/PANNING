export interface AudioMetadata {
  fileName: string;
  fileSize?: string;
  duration: number;
  sampleRate: number;
  channels: number;
  detectedGenre: string;
  subGenre?: string;
  estimatedBpm: number;
  detectedKey: string;
  scannedAt: string;
}

export interface MetricDetail {
  id: string;
  name: string;
  score: number; // 0 - 100
  status: 'good' | 'warning' | 'critical'; // 🟢 🟡 🔴
  headline: string;
  description: string;
  targetBenchmark: string;
  currentValue: string;
}

export interface FrequencyAlert {
  id: string;
  bandName: string;
  frequencyRange: string;
  severity: 'critical' | 'warning' | 'optimal';
  detectedIssue: string;
  studioSolution: string;
  gainAdjustment: string;
  qFactor: string;
  pluginTip: string;
}

export interface TimestampFeedback {
  id: string;
  timestamp: number; // seconds
  formattedTime: string;
  sectionName: string;
  type: 'intro' | 'hook' | 'verse' | 'climax' | 'outro';
  status: 'positive' | 'warning' | 'action_needed';
  feedback: string;
  solution: string;
  viralGrowthTip: string;
}

export interface AudienceProfile {
  targetDemographic: string;
  recommendedPlaylists: string[];
  viralSoundFormat: string;
  bestTikTokCut: {
    startSec: number;
    endSec: number;
    formattedRange: string;
    hookReason: string;
  };
  streamingReadinessScore: number;
}

export interface ViralPoint {
  timeSec: number;
  formattedTime: string;
  viralScore: number; // 0 - 100
  transientDensity: number; // 0 - 100 (attack & drum punch impact)
  hookFrequencyEnergy: number; // 0 - 100 (vocal presence & melodic catchiness in 2kHz - 4kHz)
  isAttentionPeak: boolean;
  segmentLabel?: string;
  highlightDescription?: string;
}

export interface ViralCurveData {
  points: ViralPoint[];
  peakTimeSec: number;
  peakScore: number;
  averageScore: number;
  bestWindow: {
    startSec: number;
    endSec: number;
    formattedRange: string;
    retentionRate: string;
    reason: string;
  };
  transientAnalysisSummary: string;
  hookFrequencySummary: string;
}

export interface ImprovementBooster {
  id: string;
  title: string;
  description: string;
  potentialScoreBoost: number;
  category: 'mix' | 'arrangement' | 'vocals' | 'mastering';
  applied: boolean;
}

export type AppView = 'audit' | 'real-analyzer' | 'cover-art' | 'tips-pro' | 'history' | 'assistant';

export interface TrackHistoryItem {
  id: string;
  report: AnalysisReport;
  audioBuffer: AudioBuffer | null;
  savedAt: string;
}

export interface CoverColorSwatch {
  name: string;
  hex: string;
  role: string;
}

export interface CoverArtPromptData {
  conceptTitle: string;
  conceptDescription: string;
  specs: {
    dimensions: string;
    resolution: string;
    colorSpace: string;
    safeZone: string;
    fileFormat: string;
  };
  colorPalette: CoverColorSwatch[];
  typography: {
    titleFont: string;
    artistFont: string;
    titleSizePercent: string;
    artistSizePercent: string;
    letterSpacing: string;
    placement: string;
    advisoryPlacement: string;
  };
  prompts: {
    midjourney: string;
    dalle3: string;
    ideogram: string;
    leonardo: string;
  };
  spotifyCanvasTip?: string;
}

export interface AnalysisReport {
  metadata: AudioMetadata;
  commercialScore: number; // 0 - 100
  potentialBoostedScore: number;
  scoreTier: 'low' | 'medium' | 'high'; // low: 0-50, medium: 51-79, high: 80-100
  globalVerdict: string;
  aiProducerMessage: string;
  lufsIntegrated: number;
  truePeakDb: number;
  dynamicRangeDb: number;
  technicalData?: {
    lufs: number;
    truePeak: number;
    dynamicRange: number;
  };
  metrics: {
    structureAndRhythm: MetricDetail;
    hookStrength: MetricDetail;
    mixQuality: MetricDetail;
    commercialLufs: MetricDetail;
  };
  frequencyAlerts: FrequencyAlert[];
  spectrumData: {
    frequency: string;
    hz: number;
    actualLevel: number;
    targetLevel: number;
    issue?: string;
  }[];
  roadmap: TimestampFeedback[];
  producerComment: {
    avatar: string;
    name: string;
    role: string;
    quote: string;
    priorityAction: string;
  };
  audience: AudienceProfile;
  boosters: ImprovementBooster[];
  energyProfile: number[];
  viralCurve: ViralCurveData;
}
