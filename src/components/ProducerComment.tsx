import React from 'react';
import { Quote, Users, ListMusic, Sparkles, Award, Radio, MessageSquare, Disc3, Flame } from 'lucide-react';
import { AnalysisReport } from '../types';

interface ProducerCommentProps {
  report: AnalysisReport;
  onOpenChat?: () => void;
}

export const ProducerComment: React.FC<ProducerCommentProps> = ({ report, onOpenChat }) => {
  const { producerComment, audience, metadata } = report;

  return (
    <section className="mt-10">
      {/* Section Header */}
      <div className="mb-6 flex items-center justify-between border-b-2 border-slate-300 pb-4">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-extrabold tracking-[0.25em] text-slate-500 uppercase">
            EXPERT AUDIT // 04
          </span>
          <span className="text-slate-300">•</span>
          <h3 className="text-xl font-bold text-slate-900 sm:text-2xl font-display neon-title-glow">
            COMENTARIO DEL INGENIERO & AUDIENCIA OBJETIVO
          </h3>
        </div>

        {onOpenChat && (
          <button
            onClick={onOpenChat}
            className="hidden sm:inline-flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900 px-3.5 py-1.5 text-xs font-mono font-bold text-sky-400 hover:bg-slate-800 transition-colors shadow-xs"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>Consultar con el Productor</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        
        {/* Left Column: Producer Expert Box */}
        <div className="relative rounded-2xl border-2 border-slate-300 bg-white/95 p-6 sm:p-8 lg:col-span-7 shadow-sm marble-card flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5">
              <div className="flex items-center gap-4">
                <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border-2 border-slate-400 bg-slate-100 p-0.5 shadow-xs">
                  <img
                    src={producerComment.avatar}
                    alt={producerComment.name}
                    className="h-full w-full object-cover rounded-lg"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-sky-400 shadow-xs">
                    <Award className="h-3 w-3" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-900 text-base font-display">
                      {producerComment.name}
                    </h4>
                    <span className="rounded-md border border-slate-300 bg-slate-100 px-2 py-0.5 font-mono text-[10px] font-bold text-slate-800">
                      VERIFICADO AES
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-mono">{producerComment.role}</p>
                </div>
              </div>

              {/* Genre and Key Acoustic Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-mono font-semibold text-slate-700">
                  <Disc3 className="h-3 w-3 text-slate-500" />
                  {metadata.detectedGenre}
                </span>
                <span className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-mono font-bold text-slate-900">
                  {metadata.estimatedBpm} BPM
                </span>
              </div>
            </div>

            <div className="relative mt-5">
              <Quote className="absolute -left-1 -top-2 h-7 w-7 text-slate-200 -scale-x-100" />
              <p className="pl-6 text-xs sm:text-sm font-medium leading-relaxed text-slate-700 italic font-sans whitespace-pre-line">
                "{producerComment.quote}"
              </p>
            </div>
          </div>

          <div className="mt-6">
            <div className="rounded-xl bg-slate-100/90 p-4 border border-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-900 uppercase tracking-wider">
                <Sparkles className="h-4 w-4 text-sky-500 shrink-0" />
                <span>PRIORIDAD CRÍTICA DE MEZCLA:</span>
              </div>
              <span className="text-xs font-mono text-slate-900 font-bold bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                {producerComment.priorityAction}
              </span>
            </div>

            {onOpenChat && (
              <div className="mt-3 sm:hidden">
                <button
                  onClick={onOpenChat}
                  className="w-full flex items-center justify-center gap-2 rounded-lg border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs font-mono font-bold text-sky-400"
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>Consultar con el Productor</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Audience & Playlists Match */}
        <div className="flex flex-col justify-between rounded-2xl border-2 border-slate-300 bg-white/95 p-6 sm:p-8 lg:col-span-5 shadow-sm marble-card">
          <div>
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2 text-xs font-mono font-extrabold tracking-[0.2em] text-slate-900 uppercase">
                <Users className="h-4 w-4 text-slate-800" />
                <span>PERFIL DE OYENTE RECOMENDADO</span>
              </div>
              <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                <Flame className="h-3 w-3 text-emerald-600" />
                {audience.streamingReadinessScore}% MATCH
              </span>
            </div>

            <h4 className="mt-4 text-sm font-bold text-slate-900 uppercase font-mono leading-snug">
              {audience.targetDemographic}
            </h4>

            {audience.viralSoundFormat && (
              <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50/70 p-3 text-xs text-slate-600 font-sans">
                <strong className="font-mono text-[10px] uppercase text-slate-500 tracking-wider block mb-1">
                  FORMATO DE CONTENIDO VIRAL:
                </strong>
                {audience.viralSoundFormat}
              </div>
            )}

            <div className="mt-5">
              <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider mb-3">
                <ListMusic className="h-4 w-4 text-slate-700" />
                <span>Playlists Editoriales con Mayor Afinidad:</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {audience.recommendedPlaylists.map((playlist, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1 text-xs font-mono text-slate-700 hover:border-slate-500 hover:bg-slate-50 transition-colors shadow-2xs font-semibold"
                  >
                    <Radio className="h-3 w-3 text-sky-500 shrink-0" />
                    <span>{playlist}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 border-t border-slate-200 pt-4 flex items-center justify-between text-xs font-mono text-slate-600">
            <span>COMPATIBILIDAD CON ALGORITMOS:</span>
            <strong className="text-slate-900 font-extrabold text-sm">{audience.streamingReadinessScore}% COMPATIBLE</strong>
          </div>
        </div>

      </div>
    </section>
  );
};
