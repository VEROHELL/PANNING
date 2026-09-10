import React from 'react';
import { Clock, Zap, Sliders, Volume2, Flame, RefreshCw, Smartphone, TrendingUp, HelpCircle } from 'lucide-react';
import { AnalysisReport, MetricDetail } from '../types';

interface IndustryTrafficLightProps {
  report: AnalysisReport;
  onOpenChat?: () => void;
}

export const IndustryTrafficLight: React.FC<IndustryTrafficLightProps> = ({ report, onOpenChat }) => {
  const { structureAndRhythm, hookStrength, mixQuality, commercialLufs } = report.metrics;

  const renderStatusDot = (status: MetricDetail['status']) => {
    switch (status) {
      case 'good':
        return <span className="h-3 w-3 rounded-full bg-emerald-500 shadow-xs" title="Óptimo" />;
      case 'warning':
        return <span className="h-3 w-3 rounded-full bg-amber-400 shadow-xs" title="Alerta" />;
      case 'critical':
        return <span className="h-3 w-3 rounded-full bg-rose-500 shadow-xs" title="Crítico" />;
    }
  };

  const getProgressColor = (status: MetricDetail['status']) => {
    switch (status) {
      case 'good':
        return 'bg-emerald-500';
      case 'warning':
        return 'bg-amber-400';
      case 'critical':
        return 'bg-rose-500';
    }
  };

  const allMetrics = [structureAndRhythm, hookStrength, mixQuality, commercialLufs];

  return (
    <section className="mt-8">
      {/* Section Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-slate-300 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-extrabold tracking-[0.25em] text-slate-500 uppercase">
              METRIC PROTOCOL // 01
            </span>
            <span className="text-slate-300">•</span>
            <h3 className="text-xl font-bold text-slate-900 sm:text-2xl font-display neon-title-glow">
              SEMÁFORO DE LA INDUSTRIA
            </h3>
          </div>
          <p className="mt-1 text-xs text-slate-600 font-sans">
            Comparativa contra el estándar de streaming digital (-9 LUFS) y algoritmos de retención de audiencia.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono font-semibold text-slate-700 bg-white/90 border-2 border-slate-300 rounded-xl px-3.5 py-1.5 shadow-2xs">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            <span>Óptimo (&gt;80%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
            <span>Alerta (60-79%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
            <span>Crítico (&lt;60%)</span>
          </div>
        </div>
      </div>

      {/* 4 Core Traffic Light Cards in Symmetrical Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {allMetrics.map((metric, idx) => (
          <div
            key={metric.id}
            className="flex flex-col justify-between rounded-xl border-2 border-slate-300 bg-white/95 p-5 shadow-xs transition-all hover:border-slate-500 hover:shadow-md marble-card"
          >
            <div>
              {/* Card Top Row */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2 text-xs font-mono font-extrabold uppercase tracking-wider text-slate-900">
                  <span className="text-slate-500 font-display font-bold text-base">0{idx + 1}</span>
                  <span>{metric.name}</span>
                </div>
                {renderStatusDot(metric.status)}
              </div>

              {/* Metric Value / Score */}
              <div className="mt-4 flex items-baseline justify-between">
                <span className="text-3xl font-extrabold tracking-tight text-slate-900 font-display neon-title-glow">
                  {metric.id === 'm4' ? `${report.lufsIntegrated} LUFS` : `${metric.score}%`}
                </span>
                <span className="font-mono text-[10px] text-slate-500 font-bold tracking-wider">
                  OBJETIVO: {metric.targetBenchmark}
                </span>
              </div>

              {/* Progress Bar in Clean Line */}
              <div className="mt-2.5 h-2 w-full rounded-full bg-slate-100 overflow-hidden border border-slate-300">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${getProgressColor(metric.status)}`}
                  style={{ width: `${Math.min(100, Math.max(10, metric.score))}%` }}
                />
              </div>

              {/* Headline & Description */}
              <h4 className="mt-4 text-xs font-extrabold text-slate-900 uppercase tracking-wide leading-snug">
                {metric.headline}
              </h4>
              <p className="mt-1 text-xs leading-relaxed text-slate-600 font-sans">
                {metric.description}
              </p>
            </div>

            {/* Bottom Status Pill */}
            <div className="mt-5 border-t border-slate-200 pt-3 flex items-center justify-between text-[11px] font-mono text-slate-500 uppercase">
              <span>EVALUACIÓN:</span>
              <span
                className={`font-extrabold tracking-wider rounded-md px-2 py-0.5 ${
                  metric.status === 'good'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                    : metric.status === 'warning'
                    ? 'bg-amber-50 text-amber-700 border border-amber-300'
                    : 'bg-rose-50 text-rose-700 border border-rose-300'
                }`}
              >
                {metric.status === 'good' ? 'OPTIMIZADO' : metric.status === 'warning' ? 'REVISIÓN LEVE' : 'ACCIÓN URGENTE'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Extra Viral Retention Radar Banner */}
      <div className="mt-4 rounded-xl border-2 border-slate-300 bg-slate-50/90 p-5 shadow-xs marble-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 border-slate-300 bg-white text-slate-900 shadow-2xs">
              <Smartphone className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-extrabold uppercase tracking-[0.2em] text-slate-900">
                  RETENCIÓN EN ALGORITMOS DIGITALES // TIKTOK & REELS:
                </span>
                <span className="rounded-md border border-slate-300 bg-white px-2 py-0.5 font-mono text-[10px] font-bold text-slate-800">
                  {report.commercialScore >= 75 ? 'ALTA PROBABILIDAD DE RETENCIÓN' : 'MODERADA (REQUIERE CORTE)'}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-700 font-sans">
                {report.commercialScore >= 75
                  ? 'El audio cuenta con transientes marcados ideales para sincronización de contenido y micro-videos.'
                  : 'El audio requiere una entrada con mayor impacto dinámico en los primeros 3 segundos para reducir la tasa de salto.'}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 rounded-xl border-2 border-slate-300 bg-white px-3.5 py-2 text-xs font-mono text-slate-800 shadow-2xs">
            <Flame className="h-4 w-4 text-sky-500" />
            <span>Índice de Retención: <strong className="text-slate-900 font-bold">{report.commercialScore >= 75 ? '8.9 / 10' : '6.2 / 10'}</strong></span>
          </div>
        </div>
      </div>
    </section>
  );
};
