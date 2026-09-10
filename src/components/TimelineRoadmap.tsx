import React from 'react';
import { Play, Flame, Share2, Sparkles, CheckCircle2, AlertCircle, Wrench, Video, Scissors, ChevronRight } from 'lucide-react';
import { AnalysisReport, TimestampFeedback } from '../types';

interface TimelineRoadmapProps {
  report: AnalysisReport;
  onSeekAudio?: (seconds: number) => void;
  currentAudioTime?: number;
}

export const TimelineRoadmap: React.FC<TimelineRoadmapProps> = ({
  report,
  onSeekAudio,
  currentAudioTime = 0,
}) => {
  const { roadmap, audience } = report;

  const renderStatusBadge = (status: TimestampFeedback['status']) => {
    switch (status) {
      case 'positive':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-0.5 font-mono text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span>PUNTO ÓPTIMO</span>
          </span>
        );
      case 'warning':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-2.5 py-0.5 font-mono text-[10px] font-bold text-amber-700 uppercase tracking-wider">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            <span>REVISIÓN LEVE</span>
          </span>
        );
      case 'action_needed':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-300 bg-rose-50 px-2.5 py-0.5 font-mono text-[10px] font-bold text-rose-700 uppercase tracking-wider">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
            <span>CORRECCIÓN CRÍTICA</span>
          </span>
        );
    }
  };

  return (
    <section className="mt-10">
      {/* Section Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-slate-300 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-extrabold tracking-[0.25em] text-slate-500 uppercase">
              TIMELINE ROADMAP // 03
            </span>
            <span className="text-slate-300">•</span>
            <h3 className="text-xl font-bold text-slate-900 sm:text-2xl font-display neon-title-glow">
              HOJA DE RUTA TÉCNICA (SEGUNDO A SEGUNDO)
            </h3>
          </div>
          <p className="mt-1 text-xs text-slate-600 font-sans">
            Marcas de tiempo milimétricas para retención de audiencia y optimización en plataformas digitales.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        
        {/* Left Column: Vertical Interactive Timeline */}
        <div className="lg:col-span-8">
          <div className="relative border-l-2 border-slate-300 pl-6 sm:pl-8 ml-3 space-y-6">
            {roadmap.map((item, idx) => {
              const isCurrent = Math.abs(currentAudioTime - item.timestamp) < 5;

              return (
                <div key={item.id} className="relative group">
                  {/* Timeline node icon */}
                  <button
                    onClick={() => onSeekAudio?.(item.timestamp)}
                    className={`absolute -left-[35px] sm:-left-[43px] top-1 flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all duration-200 shadow-sm ${
                      isCurrent
                        ? 'border-slate-900 bg-slate-900 text-sky-400 scale-110'
                        : 'border-slate-400 bg-white text-slate-700 hover:border-slate-800 hover:text-slate-900'
                    }`}
                    title={`Reproducir desde ${item.formattedTime}`}
                  >
                    <Play className="h-3.5 w-3.5 fill-current ml-0.5" />
                  </button>

                  {/* Card Container */}
                  <div
                    className={`rounded-xl border-2 p-5 transition-all shadow-xs marble-card ${
                      isCurrent
                        ? 'border-slate-900 bg-slate-100 ring-2 ring-slate-800/20'
                        : 'border-slate-300 bg-white/95 hover:border-slate-400 hover:shadow-sm'
                    }`}
                  >
                    {/* Header Row */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2.5 py-0.5 border border-slate-300 rounded-md">
                          {item.formattedTime}
                        </span>
                        <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wide font-display">
                          {item.sectionName}
                        </h4>
                      </div>
                      {renderStatusBadge(item.status)}
                    </div>

                    {/* Feedback content */}
                    <p className="mt-3 text-xs sm:text-sm leading-relaxed text-slate-700 font-sans font-medium">
                      {item.feedback}
                    </p>

                    {/* Actionable Solution */}
                    <div className="mt-3 rounded-lg bg-slate-50 p-3 border border-slate-300">
                      <div className="flex items-center gap-1.5 text-[10px] font-mono font-extrabold text-slate-900 uppercase tracking-wide">
                        <Wrench className="h-3 w-3 text-slate-700" />
                        <span>SOLUCIÓN TÉCNICA DE PRODUCCIÓN:</span>
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-slate-800 font-medium font-sans">
                        {item.solution}
                      </p>
                    </div>

                    {/* TikTok / YouTube Algorithm Tip */}
                    <div className="mt-2.5 flex items-start gap-2 rounded-lg bg-slate-100/70 p-3 text-xs text-slate-800 border border-slate-300">
                      <Flame className="h-4 w-4 shrink-0 text-sky-500 mt-0.5" />
                      <div>
                        <strong className="text-slate-900 uppercase font-mono text-[10px] block font-bold">ESTRATEGIA VIRAL: </strong>
                        <span className="text-slate-700 font-sans">{item.viralGrowthTip}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: TikTok Best Snippet & Format Pack */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Viral Clip Box */}
          <div className="rounded-2xl border-2 border-slate-400 bg-white/95 p-6 shadow-sm relative marble-card">
            <div className="flex items-center gap-2 text-xs font-mono font-extrabold tracking-[0.2em] text-slate-700 uppercase">
              <Scissors className="h-4 w-4 text-sky-500" />
              <span>CORTE OFICIAL RECOMENDADO</span>
            </div>

            <h4 className="mt-3 text-2xl font-bold text-slate-900 font-display">
              Clip: <strong className="text-slate-900 font-extrabold font-mono neon-title-glow">{audience.bestTikTokCut.formattedRange}</strong>
            </h4>

            <p className="mt-2 text-xs leading-relaxed text-slate-600 font-sans">
              {audience.bestTikTokCut.hookReason}
            </p>

            <div className="mt-5 rounded-xl bg-slate-50 p-4 border border-slate-300">
              <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-2 font-bold">
                ESTRUCTURA DE VIDEO DIGITAL:
              </div>
              <ul className="space-y-2 text-xs font-mono text-slate-700 font-medium">
                <li className="flex items-start gap-2">
                  <span className="text-slate-900 font-bold">0-3s:</span>
                  <span>Gancho visual o pregunta de impacto inicial.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-900 font-bold">4-10s:</span>
                  <span>Explosión del coro o transición dinámica.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-900 font-bold">11-14s:</span>
                  <span>Bucle de retorno sin silencios para doble reproducción.</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => onSeekAudio?.(audience.bestTikTokCut.startSec)}
              className="mt-5 studio-btn-metallic w-full text-xs !py-3"
            >
              <Play className="h-3.5 w-3.5 fill-current mr-2 text-sky-400" />
              <span>Reproducir Corte ({audience.bestTikTokCut.formattedRange})</span>
            </button>
          </div>

          {/* Algorithm Checklist */}
          <div className="rounded-2xl border-2 border-slate-300 bg-white/95 p-6 shadow-xs marble-card">
            <h4 className="text-xs font-mono font-extrabold tracking-[0.2em] text-slate-900 uppercase flex items-center gap-2 border-b border-slate-200 pb-3">
              <Video className="h-4 w-4 text-slate-800" />
              <span>CHECKLIST DE LANZAMIENTO</span>
            </h4>

            <div className="mt-4 space-y-3 text-xs text-slate-600 font-sans">
              <div className="flex items-start gap-2.5">
                <span className="font-mono text-slate-900 font-bold">[01]</span>
                <span>Crear sonido original en plataformas cortas previo al lanzamiento.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="font-mono text-slate-900 font-bold">[02]</span>
                <span>Exportar con rango dinámico EBU R128 para evitar sobre-compresión en redes sociales.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="font-mono text-slate-900 font-bold">[03]</span>
                <span>Enviar pitch a curadores editoriales con 7 días de antelación mínima.</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
