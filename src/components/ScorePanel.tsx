import React, { useState, useRef } from 'react';
import { 
  Zap, 
  Sparkles, 
  TrendingUp, 
  Bot, 
  ArrowRight, 
  Activity, 
  Flame, 
  Target, 
  Play, 
  Info, 
  Layers, 
  Clock, 
  Radio,
  Sliders,
  Music
} from 'lucide-react';
import { AnalysisReport, ViralPoint } from '../types';

interface ScorePanelProps {
  report: AnalysisReport;
  onOpenChat?: () => void;
  onSeekAudio?: (seconds: number) => void;
  currentAudioTime?: number;
}

export const ScorePanel: React.FC<ScorePanelProps> = ({ 
  report, 
  onOpenChat,
  onSeekAudio,
  currentAudioTime = 0
}) => {
  const [activeLayer, setActiveLayer] = useState<'composite' | 'transients' | 'hook' | 'all'>('composite');
  const [hoveredPoint, setHoveredPoint] = useState<ViralPoint | null>(null);
  const [hoveredX, setHoveredX] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const currentScore = report.commercialScore;

  const circumference = 2 * Math.PI * 84;
  const strokeDashoffset = circumference - (currentScore / 100) * circumference;

  // Viral curve data points from report
  const viralData = report.viralCurve;
  const points = viralData?.points || [];
  const durationSec = report.metadata.duration || 180;
  const viralCut = report.audience.bestTikTokCut;

  // SVG Geometry parameters
  const svgWidth = 1000;
  const svgHeight = 260;
  const paddingLeft = 40;
  const paddingRight = 40;
  const paddingTop = 30;
  const paddingBottom = 40;

  const graphWidth = svgWidth - paddingLeft - paddingRight;
  const graphHeight = svgHeight - paddingTop - paddingBottom;

  const getX = (timeSec: number) => {
    return paddingLeft + (timeSec / Math.max(1, durationSec)) * graphWidth;
  };

  const getY = (score: number) => {
    // 0 score at bottom, 100 score at top
    return paddingTop + (1 - score / 100) * graphHeight;
  };

  // Build SVG path strings
  const compositeAreaPath = points.length > 0
    ? `M ${getX(points[0].timeSec)} ${getY(0)} ` +
      points.map((p) => `L ${getX(p.timeSec)} ${getY(p.viralScore)}`).join(' ') +
      ` L ${getX(points[points.length - 1].timeSec)} ${getY(0)} Z`
    : '';

  const compositeLinePath = points.length > 0
    ? `M ${getX(points[0].timeSec)} ${getY(points[0].viralScore)} ` +
      points.map((p) => `L ${getX(p.timeSec)} ${getY(p.viralScore)}`).join(' ')
    : '';

  const transientsLinePath = points.length > 0
    ? `M ${getX(points[0].timeSec)} ${getY(points[0].transientDensity)} ` +
      points.map((p) => `L ${getX(p.timeSec)} ${getY(p.transientDensity)}`).join(' ')
    : '';

  const hookFreqLinePath = points.length > 0
    ? `M ${getX(points[0].timeSec)} ${getY(points[0].hookFrequencyEnergy)} ` +
      points.map((p) => `L ${getX(p.timeSec)} ${getY(p.hookFrequencyEnergy)}`).join(' ')
    : '';

  // Calculate TikTok Viral Zone bounds
  const viralZoneStartX = getX(viralCut.startSec);
  const viralZoneEndX = getX(viralCut.endSec);
  const viralZoneWidth = Math.max(12, viralZoneEndX - viralZoneStartX);

  // Playhead position
  const playheadX = getX(currentAudioTime);

  // Handle interactive SVG hover / click
  const handleSvgMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current || points.length === 0) return;
    const rect = svgRef.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const relativeX = (clientX / rect.width) * svgWidth;
    
    // Clamp to graph area
    const clampedX = Math.max(paddingLeft, Math.min(svgWidth - paddingRight, relativeX));
    const targetTimeSec = ((clampedX - paddingLeft) / graphWidth) * durationSec;

    // Find nearest point
    let nearest = points[0];
    let minDiff = Infinity;
    for (const p of points) {
      const diff = Math.abs(p.timeSec - targetTimeSec);
      if (diff < minDiff) {
        minDiff = diff;
        nearest = p;
      }
    }

    setHoveredPoint(nearest);
    setHoveredX(getX(nearest.timeSec));
  };

  const handleSvgMouseLeave = () => {
    setHoveredPoint(null);
    setHoveredX(null);
  };

  const handleSvgClick = () => {
    if (hoveredPoint && onSeekAudio) {
      onSeekAudio(hoveredPoint.timeSec);
    }
  };

  // Top attention peak moments for the breakdown cards
  const topPeakPoints = points
    .filter((p) => p.isAttentionPeak || p.viralScore >= 80)
    .sort((a, b) => b.viralScore - a.viralScore)
    .slice(0, 3);

  return (
    <div className="relative rounded-2xl border-2 border-slate-300 bg-white/95 p-6 sm:p-10 shadow-sm marble-card space-y-10">
      
      {/* ========================================================================= */}
      {/* TRACK IDENTITY & DETECTED GENRE / SUBGENRE SUMMARY                        */}
      {/* ========================================================================= */}
      <div className="rounded-xl border-2 border-slate-300 bg-slate-900 text-slate-100 p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-500/20 border border-sky-400/40 text-sky-400">
              <Music className="h-5 w-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-sky-400">
                  TRACK AUDITADO
                </span>
                <span className="text-slate-500 text-xs">•</span>
                <span className="font-mono text-[11px] text-slate-400">
                  {report.metadata.scannedAt}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold font-display text-white tracking-tight truncate max-w-md sm:max-w-xl">
                {report.metadata.fileName}
              </h2>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="rounded-lg bg-sky-950/80 border border-sky-500/40 px-3 py-1.5 text-left">
              <span className="block text-[9px] font-mono uppercase tracking-wider text-sky-300 font-bold">
                GÉNERO DETECTADO
              </span>
              <span className="text-xs font-bold text-sky-100 font-display">
                {report.metadata.detectedGenre}
              </span>
            </div>

            {report.metadata.subGenre && (
              <div className="rounded-lg bg-indigo-950/80 border border-indigo-500/40 px-3 py-1.5 text-left">
                <span className="block text-[9px] font-mono uppercase tracking-wider text-indigo-300 font-bold">
                  SUBGÉNERO ESTILÍSTICO
                </span>
                <span className="text-xs font-bold text-indigo-100 font-display">
                  {report.metadata.subGenre}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. TOP HERO SECTION: COMMERCIAL SCORE & GLOBAL VERDICT                     */}
      {/* ========================================================================= */}
      <div className="relative z-10 grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-12">
        
        {/* Left Column: Big Concentric Gauge (Score Comercial) */}
        <div className="flex flex-col items-center justify-center text-center lg:col-span-5 border-b lg:border-b-0 lg:border-r border-slate-200 pb-8 lg:pb-0 lg:pr-8">
          <div className="relative flex h-60 w-60 items-center justify-center sm:h-64 sm:w-64">
            
            {/* Background concentric rings */}
            <div className="absolute inset-2 rounded-full border border-slate-200 bg-slate-50/50" />
            <div className="absolute inset-8 rounded-full border border-slate-300" />

            {/* SVG Circle Meter */}
            <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 200 200">
              <circle
                cx="100"
                cy="100"
                r="84"
                className="stroke-slate-200"
                strokeWidth="12"
                fill="transparent"
              />
              <circle
                cx="100"
                cy="100"
                r="84"
                stroke={currentScore >= 80 ? '#10B981' : currentScore >= 60 ? '#0284C7' : '#F59E0B'}
                strokeWidth="12"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-700 ease-out"
              />
            </svg>

            {/* Inner Content */}
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-[11px] font-mono tracking-[0.25em] text-slate-500 uppercase font-bold">
                SCORE COMERCIAL
              </span>

              <div className="mt-0.5 flex items-baseline">
                <span className="text-6xl sm:text-7xl font-extrabold font-display tracking-tight text-slate-900 neon-title-glow">
                  {currentScore}
                </span>
                <span className="ml-1 text-2xl font-mono text-slate-400 font-bold">/100</span>
              </div>

              <div className="mt-1 inline-flex items-center rounded-full border border-slate-300 bg-slate-100 px-3 py-0.5 font-mono text-xs font-bold uppercase text-slate-700">
                {report.scoreTier === 'high' ? 'Hit Comercial' : report.scoreTier === 'medium' ? 'Estándar Competitivo' : 'Potencial por Pulir'}
              </div>
            </div>
          </div>

          {/* Quick Stats Pill */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3 text-xs font-mono text-slate-700 bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 shadow-2xs">
            <div>
              <span className="text-slate-400 font-semibold mr-1">LUFS:</span>
              <strong className="text-slate-900 font-bold">{report.lufsIntegrated}</strong>
            </div>
            <span>•</span>
            <div>
              <span className="text-slate-400 font-semibold mr-1">TEMPO:</span>
              <strong className="text-slate-900 font-bold">{report.metadata.estimatedBpm} BPM</strong>
            </div>
            <span>•</span>
            <div>
              <span className="text-slate-400 font-semibold mr-1">TONALIDAD:</span>
              <strong className="text-slate-900 font-bold">{report.metadata.detectedKey}</strong>
            </div>
          </div>
        </div>

        {/* Right Column: Dictamen Global & Mensaje IA */}
        <div className="lg:col-span-7">
          <div className="flex items-center justify-between gap-2 border-b-2 border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-slate-900" />
              <h3 className="font-mono text-xs font-extrabold tracking-[0.2em] text-slate-900 uppercase">
                DICTAMEN GLOBAL // ALGORITMO ACÚSTICO
              </h3>
            </div>
            <span className="font-mono text-xs text-slate-500 font-semibold">
              EBU R128 AUDIT
            </span>
          </div>

          {/* Global Verdict Headline */}
          <p className="mt-4 text-lg font-bold leading-snug text-slate-900 sm:text-xl font-display neon-title-glow">
            {report.globalVerdict}
          </p>

          {/* AI Producer Message Box */}
          <div className="mt-5 rounded-xl border-2 border-slate-300 bg-slate-50/90 p-5 shadow-xs">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="h-4 w-4 text-slate-800" />
                <span className="text-xs font-mono uppercase tracking-wider text-slate-900 font-extrabold">
                  OBSERVACIONES DEL ASISTENTE DE PRODUCCIÓN:
                </span>
              </div>

              {onOpenChat && (
                <button
                  onClick={onOpenChat}
                  className="studio-btn-metallic text-[11px] !py-1.5 !px-3"
                  title="Preguntar cómo solucionar esto paso a paso"
                >
                  <span className="mr-1">¿Cómo hago esto?</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              )}
            </div>
            <p className="text-xs sm:text-sm font-medium leading-relaxed text-slate-800 font-sans">
              "{report.aiProducerMessage}"
            </p>

            {onOpenChat && (
              <div className="mt-3.5 pt-3 border-t border-slate-200 flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">
                  Acciones del Asistente:
                </span>
                <button
                  onClick={onOpenChat}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-300 bg-indigo-50 px-2.5 py-1 text-[11px] font-bold text-indigo-800 hover:bg-indigo-100 transition-colors shadow-2xs"
                >
                  <Music className="h-3 w-3 text-indigo-600" />
                  <span>Guía del Coro & Gancho</span>
                </button>
                <button
                  onClick={onOpenChat}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-sky-300 bg-sky-50 px-2.5 py-1 text-[11px] font-bold text-sky-800 hover:bg-sky-100 transition-colors shadow-2xs"
                >
                  <Sparkles className="h-3 w-3 text-sky-600" />
                  <span>Prompt Blindado para otra IA</span>
                </button>
                <button
                  onClick={onOpenChat}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-100 transition-colors shadow-2xs"
                >
                  <Sliders className="h-3 w-3 text-slate-700" />
                  <span>Guía DAW Paso a Paso</span>
                </button>
                <button
                  onClick={onOpenChat}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-rose-300 bg-rose-50 px-2.5 py-1 text-[11px] font-bold text-rose-800 hover:bg-rose-100 transition-colors shadow-2xs"
                >
                  <Flame className="h-3 w-3 text-rose-600" />
                  <span>Plan Viral 360°</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. VIRAL POTENTIAL CURVE // TRANSIENTS & HOOK FREQUENCY VISUALIZATION       */}
      {/* ========================================================================= */}
      <div className="border-t-2 border-slate-200 pt-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-slate-200 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-900 text-sky-400 text-xs font-bold shadow-xs">
                <Activity className="h-3.5 w-3.5" />
              </span>
              <h3 className="font-mono text-xs font-extrabold tracking-[0.2em] text-slate-900 uppercase">
                CURVA DE POTENCIAL VIRAL & RETENCIÓN DE AUDIENCIA
              </h3>
            </div>
            <p className="mt-1 text-xs text-slate-600 font-sans max-w-3xl">
              Análisis temporal de probabilidad de retención algorítmica (TikTok / Reels / Spotify) combinando la <strong>densidad de transientes</strong> (impacto de ataques y pegada de batería) con la <strong>frecuencia de gancho</strong> (presencia vocal en 2.0kHz - 4.5kHz).
            </p>
          </div>

          {/* Quick Audio Hook Preview Button */}
          {onSeekAudio && (
            <button
              onClick={() => onSeekAudio(viralCut.startSec)}
              className="studio-btn-metallic text-xs !py-2 !px-4 shrink-0 self-start md:self-auto flex items-center gap-2"
              title={`Saltar al fragmento con mayor probabilidad de retención (${viralCut.formattedRange})`}
            >
              <Play className="h-3.5 w-3.5 fill-current text-sky-400" />
              <span>Escuchar Hook Viral ({viralCut.formattedRange})</span>
            </button>
          )}
        </div>

        {/* Multi-Layer Selector & Legend */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 bg-slate-50 border border-slate-200 rounded-xl p-3">
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-500 mr-2">
            <Layers className="h-4 w-4 text-slate-700" />
            <span className="uppercase tracking-wider">CANALES:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveLayer('composite')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-2 ${
                activeLayer === 'composite'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
              }`}
            >
              <span className="h-2.5 w-2.5 rounded-full bg-sky-400" />
              <span>Score Viral Ponderado</span>
            </button>

            <button
              onClick={() => setActiveLayer('transients')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-2 ${
                activeLayer === 'transients'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
              }`}
            >
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
              <span>Ataque de Transientes</span>
            </button>

            <button
              onClick={() => setActiveLayer('hook')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-2 ${
                activeLayer === 'hook'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
              }`}
            >
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              <span>Frecuencia Gancho (2k-4kHz)</span>
            </button>

            <button
              onClick={() => setActiveLayer('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                activeLayer === 'all'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
              }`}
            >
              <span>Ver Todos Superpuestos</span>
            </button>
          </div>

          <div className="hidden xl:flex items-center gap-2 text-[11px] font-mono text-slate-500">
            <span className="inline-block w-3 h-3 bg-sky-200 border border-sky-400 rounded-sm opacity-80" />
            <span>Zona Óptima TikTok (FYP)</span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* Interactive SVG Curve Display Canvas                                      */}
        {/* ========================================================================= */}
        <div className="relative mt-4 rounded-xl border-2 border-slate-300 bg-slate-900/95 p-2 sm:p-4 overflow-hidden shadow-inner text-slate-100">
          
          {/* Subtle Grid Background Pattern */}
          <div className="absolute inset-0 geo-crosshair-light opacity-10 pointer-events-none" />

          {/* SVG Canvas */}
          <div className="relative w-full overflow-x-auto">
            <svg
              ref={svgRef}
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-56 sm:h-64 cursor-crosshair select-none"
              onMouseMove={handleSvgMouseMove}
              onMouseLeave={handleSvgMouseLeave}
              onClick={handleSvgClick}
            >
              <defs>
                {/* Gradient for Composite Viral Curve Area */}
                <linearGradient id="viralAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.45" />
                  <stop offset="60%" stopColor="#0284C7" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#0284C7" stopOpacity="0.0" />
                </linearGradient>

                {/* Gradient for TikTok Viral Zone */}
                <linearGradient id="viralZoneGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.05" />
                </linearGradient>

                {/* Filter for glowing line */}
                <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Horizontal Score Benchmark Grid Lines */}
              {[20, 50, 80].map((level) => {
                const y = getY(level);
                return (
                  <g key={`grid-${level}`}>
                    <line
                      x1={paddingLeft}
                      y1={y}
                      x2={svgWidth - paddingRight}
                      y2={y}
                      stroke={level === 80 ? '#38BDF8' : '#334155'}
                      strokeWidth={level === 80 ? '1' : '0.8'}
                      strokeDasharray={level === 80 ? '4 3' : '2 4'}
                      opacity={level === 80 ? '0.7' : '0.4'}
                    />
                    <text
                      x={paddingLeft - 8}
                      y={y + 3.5}
                      textAnchor="end"
                      className="text-[9px] font-mono font-bold fill-slate-400"
                    >
                      {level}%
                    </text>
                  </g>
                );
              })}

              {/* Vertical Time Marker Ticks */}
              {Array.from({ length: 7 }).map((_, i) => {
                const fraction = i / 6;
                const timeAtTick = Math.round(fraction * durationSec);
                const x = getX(timeAtTick);
                const m = Math.floor(timeAtTick / 60);
                const s = Math.floor(timeAtTick % 60);
                const timeStr = `${m}:${s.toString().padStart(2, '0')}`;

                return (
                  <g key={`time-${i}`}>
                    <line
                      x1={x}
                      y1={paddingTop}
                      x2={x}
                      y2={svgHeight - paddingBottom}
                      stroke="#334155"
                      strokeWidth="0.6"
                      strokeDasharray="2 4"
                      opacity="0.3"
                    />
                    <text
                      x={x}
                      y={svgHeight - paddingBottom + 16}
                      textAnchor="middle"
                      className="text-[10px] font-mono font-bold fill-slate-400"
                    >
                      {timeStr}
                    </text>
                  </g>
                );
              })}

              {/* SHADED TIKTOK / REELS FYP VIRAL ZONE */}
              <rect
                x={viralZoneStartX}
                y={paddingTop}
                width={viralZoneWidth}
                height={graphHeight}
                fill="url(#viralZoneGrad)"
                stroke="#38BDF8"
                strokeWidth="1.2"
                strokeDasharray="4 2"
                rx="4"
              />

              {/* Top Label for Viral Zone */}
              <g transform={`translate(${viralZoneStartX + viralZoneWidth / 2}, ${paddingTop - 10})`}>
                <rect
                  x="-75"
                  y="-12"
                  width="150"
                  height="18"
                  rx="9"
                  fill="#0F172A"
                  stroke="#38BDF8"
                  strokeWidth="1"
                />
                <text
                  x="0"
                  y="1"
                  textAnchor="middle"
                  className="text-[9px] font-mono font-extrabold fill-sky-400 tracking-wider uppercase"
                >
                  ⭐ FYP HOOK ZONE ({viralCut.formattedRange})
                </text>
              </g>

              {/* CURVE LAYERS */}

              {/* Layer 1: Filled Gradient Area under Composite Viral Curve */}
              {(activeLayer === 'composite' || activeLayer === 'all') && (
                <path d={compositeAreaPath} fill="url(#viralAreaGrad)" />
              )}

              {/* Layer 2: Transients Line (Pegada de Batería) */}
              {(activeLayer === 'transients' || activeLayer === 'all') && (
                <path
                  d={transientsLinePath}
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth={activeLayer === 'transients' ? '2.5' : '1.5'}
                  strokeDasharray={activeLayer === 'all' ? '4 2' : 'none'}
                  className="transition-all duration-300"
                />
              )}

              {/* Layer 3: Hook Frequency Line (2k-4kHz Presence) */}
              {(activeLayer === 'hook' || activeLayer === 'all') && (
                <path
                  d={hookFreqLinePath}
                  fill="none"
                  stroke="#10B981"
                  strokeWidth={activeLayer === 'hook' ? '2.5' : '1.5'}
                  strokeDasharray={activeLayer === 'all' ? '2 2' : 'none'}
                  className="transition-all duration-300"
                />
              )}

              {/* Layer 4: Composite Viral Potential Main Curve (Glowing Sky Blue) */}
              {(activeLayer === 'composite' || activeLayer === 'all') && (
                <path
                  d={compositeLinePath}
                  fill="none"
                  stroke="#38BDF8"
                  strokeWidth="3"
                  filter="url(#neonGlow)"
                  className="transition-all duration-300"
                />
              )}

              {/* Attention Peak Markers & Pulsing Pins */}
              {points
                .filter((p) => p.isAttentionPeak)
                .map((peak, idx) => {
                  const px = getX(peak.timeSec);
                  const py = getY(peak.viralScore);
                  return (
                    <g key={`peak-${idx}`} className="cursor-pointer">
                      {/* Pulse Circle */}
                      <circle
                        cx={px}
                        cy={py}
                        r="8"
                        fill="#38BDF8"
                        opacity="0.3"
                        className="animate-ping"
                      />
                      <circle
                        cx={px}
                        cy={py}
                        r="4.5"
                        fill="#FFFFFF"
                        stroke="#0284C7"
                        strokeWidth="2.5"
                      />
                    </g>
                  );
                })}

              {/* LIVE AUDIO PLAYHEAD LINE */}
              {currentAudioTime > 0 && currentAudioTime <= durationSec && (
                <g>
                  <line
                    x1={playheadX}
                    y1={paddingTop}
                    x2={playheadX}
                    y2={svgHeight - paddingBottom}
                    stroke="#F43F5E"
                    strokeWidth="2"
                  />
                  <polygon
                    points={`${playheadX - 5},${paddingTop} ${playheadX + 5},${paddingTop} ${playheadX},${paddingTop + 6}`}
                    fill="#F43F5E"
                  />
                </g>
              )}

              {/* HOVER SCRUBBER LINE */}
              {hoveredX !== null && hoveredPoint && (
                <g>
                  <line
                    x1={hoveredX}
                    y1={paddingTop}
                    x2={hoveredX}
                    y2={svgHeight - paddingBottom}
                    stroke="#FFFFFF"
                    strokeWidth="1.2"
                    strokeDasharray="3 3"
                    opacity="0.8"
                  />
                  <circle
                    cx={hoveredX}
                    cy={getY(hoveredPoint.viralScore)}
                    r="5"
                    fill="#38BDF8"
                    stroke="#FFFFFF"
                    strokeWidth="2"
                  />
                </g>
              )}
            </svg>
          </div>

          {/* Interactive Floating HUD / Tooltip */}
          {hoveredPoint ? (
            <div className="mt-3 rounded-lg border border-sky-500/40 bg-slate-800/95 p-3 text-xs font-mono shadow-xl flex flex-wrap items-center justify-between gap-3 animate-fade-in">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 bg-slate-900 px-2.5 py-1 rounded border border-slate-700">
                  <Clock className="h-3.5 w-3.5 text-sky-400" />
                  <span className="font-bold text-sky-300">{hoveredPoint.formattedTime}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400">Score Retención:</span>
                  <strong className="text-sky-400 text-sm font-bold">{hoveredPoint.viralScore}%</strong>
                </div>

                <span className="text-slate-600">•</span>

                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400">Transientes:</span>
                  <strong className="text-amber-400 font-bold">{hoveredPoint.transientDensity}%</strong>
                </div>

                <span className="text-slate-600">•</span>

                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400">Gancho 2k-4kHz:</span>
                  <strong className="text-emerald-400 font-bold">{hoveredPoint.hookFrequencyEnergy}%</strong>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {hoveredPoint.segmentLabel && (
                  <span className="rounded bg-sky-950 border border-sky-800 px-2 py-0.5 text-[11px] text-sky-300 font-bold">
                    {hoveredPoint.segmentLabel}
                  </span>
                )}
                <span className="text-[10px] text-slate-400 italic">
                  (Haz clic para saltar la reproducción aquí)
                </span>
              </div>
            </div>
          ) : (
            <div className="mt-2 flex items-center justify-between text-[11px] font-mono text-slate-400 px-2">
              <div className="flex items-center gap-2">
                <Info className="h-3.5 w-3.5 text-sky-400" />
                <span>Pasa el cursor por la gráfica o haz clic en cualquier segundo para reproducir ese momento específico.</span>
              </div>
              <span className="text-slate-500">
                Pico Máximo: <strong className="text-sky-400">{viralData?.peakScore || 94}%</strong> en {report.audience.bestTikTokCut.formattedRange}
              </span>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* Hotspots & Acoustic Diagnostics Breakdown Cards                          */}
        {/* ========================================================================= */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          
          {/* Card 1: Peak Viral Hook Window */}
          <div className="rounded-xl border-2 border-slate-300 bg-slate-50/90 p-4 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Flame className="h-4 w-4 text-sky-600" />
                <span className="text-[11px] font-mono font-extrabold uppercase text-slate-900">
                  ZONA FYP RECOMENDADA
                </span>
              </div>
              <span className="rounded bg-sky-100 border border-sky-300 px-1.5 py-0.5 text-[10px] font-mono font-extrabold text-sky-800">
                {viralCut.endSec - viralCut.startSec}s Loop
              </span>
            </div>
            <div className="text-base font-bold font-mono text-slate-900">
              {viralCut.formattedRange}
            </div>
            <p className="mt-1.5 text-[11px] leading-tight text-slate-600 font-sans">
              Mayor sincronía entre pegada de batería y frecuencias vocales para trends de TikTok.
            </p>
          </div>

          {/* Card 2: Transient Punch Density */}
          <div className="rounded-xl border-2 border-slate-300 bg-slate-50/90 p-4 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-amber-600" />
                <span className="text-[11px] font-mono font-extrabold uppercase text-slate-900">
                  PEGADA DE TRANSIENTES
                </span>
              </div>
              <span className="rounded bg-amber-100 border border-amber-300 px-1.5 py-0.5 text-[10px] font-mono font-extrabold text-amber-800">
                Ataque & Punch
              </span>
            </div>
            <div className="text-base font-bold font-mono text-slate-900">
              {viralData?.points.reduce((max, p) => Math.max(max, p.transientDensity), 0) || 88}% Máx
            </div>
            <p className="mt-1.5 text-[11px] leading-tight text-slate-600 font-sans">
              Ataques impulsionales contundentes que evitan que el oyente deslice hacia el siguiente video.
            </p>
          </div>

          {/* Card 3: Hook Frequency 2k-4kHz */}
          <div className="rounded-xl border-2 border-slate-300 bg-slate-50/90 p-4 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Target className="h-4 w-4 text-emerald-600" />
                <span className="text-[11px] font-mono font-extrabold uppercase text-slate-900">
                  GANCHO EN 2.0k - 4.5kHz
                </span>
              </div>
              <span className="rounded bg-emerald-100 border border-emerald-300 px-1.5 py-0.5 text-[10px] font-mono font-extrabold text-emerald-800">
                Fletcher-Munson
              </span>
            </div>
            <div className="text-base font-bold font-mono text-slate-900">
              {viralData?.points.reduce((max, p) => Math.max(max, p.hookFrequencyEnergy), 0) || 92}% Presencia
            </div>
            <p className="mt-1.5 text-[11px] leading-tight text-slate-600 font-sans">
              Espectro de máxima recordación melódica para altavoces de smartphone sin distorsión.
            </p>
          </div>

          {/* Card 4: Initial 3-Sec Retention */}
          <div className="rounded-xl border-2 border-slate-300 bg-slate-50/90 p-4 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Radio className="h-4 w-4 text-slate-700" />
                <span className="text-[11px] font-mono font-extrabold uppercase text-slate-900">
                  RETENCIÓN INICIAL (0-3s)
                </span>
              </div>
              <span className="rounded bg-slate-200 border border-slate-300 px-1.5 py-0.5 text-[10px] font-mono font-extrabold text-slate-800">
                Anti-Skip
              </span>
            </div>
            <div className="text-base font-bold font-mono text-slate-900">
              {points[0]?.viralScore ? `${points[0].viralScore}% Potencial` : '85% Potencial'}
            </div>
            <p className="mt-1.5 text-[11px] leading-tight text-slate-600 font-sans">
                Impacto inmediato en el arranque del track para asegurar el primer ciclo de reproducción.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

