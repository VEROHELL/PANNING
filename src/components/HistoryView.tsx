import React from 'react';
import { 
  History, 
  Play, 
  CheckCircle2, 
  ArrowRight, 
  Sliders, 
  Palette, 
  FileDown, 
  MessageSquareCode, 
  Trash2, 
  Clock, 
  Activity, 
  Gauge, 
  Volume2, 
  Music, 
  Zap, 
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { AnalysisReport, TrackHistoryItem } from '../types';

interface HistoryViewProps {
  history: TrackHistoryItem[];
  currentReport: AnalysisReport | null;
  onSelectTrack: (item: TrackHistoryItem) => void;
  onClearHistory: () => void;
  onNavigateToAudit: () => void;
  onNavigateToCoverArt: () => void;
  onOpenChat: () => void;
  onExportPDF: (report: AnalysisReport) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  history,
  currentReport,
  onSelectTrack,
  onClearHistory,
  onNavigateToAudit,
  onNavigateToCoverArt,
  onOpenChat,
  onExportPDF,
}) => {
  const currentFileName = currentReport?.metadata?.fileName;

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="relative rounded-2xl border-2 border-slate-300 bg-white/95 p-6 sm:p-8 shadow-sm marble-card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border-2 border-emerald-300 shadow-xs">
              <History className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 font-display uppercase tracking-tight">
                  Historial de Auditorías Recientes
                </h2>
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-mono font-bold text-emerald-800 border border-emerald-300">
                  {history.length} / 3 GUARDADOS
                </span>
              </div>
              <p className="text-xs text-slate-500 font-sans mt-0.5">
                Cambia instantáneamente entre los últimos 3 análisis acústicos en memoria sin volver a subir o procesar los archivos.
              </p>
            </div>
          </div>

          {history.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClearHistory}
                className="flex items-center gap-1.5 rounded-xl border border-rose-300 bg-rose-50 px-3.5 py-2 text-xs font-mono font-bold text-rose-700 hover:bg-rose-100 transition-colors shadow-2xs cursor-pointer"
                title="Limpiar historial de análisis"
              >
                <Trash2 className="h-3.5 w-3.5 text-rose-600" />
                <span>Limpiar Historial</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* History Items List */}
      {history.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-white/70 p-12 text-center shadow-xs">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mb-3 border border-slate-200">
            <History className="h-7 w-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800 font-display">
            Aún no hay análisis en el historial
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-5">
            Sube un archivo de audio o selecciona una maqueta demo en la pestaña de <strong>Auditoría Acústica</strong> para guardarla automáticamente en la memoria rápida.
          </p>
          <button
            type="button"
            onClick={onNavigateToAudit}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-slate-800 transition-all cursor-pointer font-mono"
          >
            <Sliders className="h-4 w-4 text-sky-400" />
            <span>Ir a la Auditoría Acústica</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((item, index) => {
            const isCurrent = currentFileName === item.report.metadata.fileName;
            const score = item.report.commercialScore;
            const scoreBadgeColor =
              score >= 80
                ? 'bg-emerald-500 text-white'
                : score >= 60
                ? 'bg-amber-500 text-slate-950'
                : 'bg-rose-500 text-white';

            const durationSec = Math.round(item.report.metadata.duration);
            const durationMin = Math.floor(durationSec / 60);
            const durationRemSec = durationSec % 60;
            const formattedDuration = `${durationMin}:${durationRemSec.toString().padStart(2, '0')}`;

            return (
              <div
                key={item.id || index}
                className={`relative rounded-2xl border-2 transition-all duration-200 p-5 sm:p-6 shadow-sm marble-card ${
                  isCurrent
                    ? 'border-sky-500 bg-sky-50/40 ring-2 ring-sky-500/20'
                    : 'border-slate-300 bg-white/95 hover:border-slate-400'
                }`}
              >
                {/* Active Indicator Ribbon */}
                {isCurrent && (
                  <div className="absolute top-0 right-6 -translate-y-1/2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-sky-500 px-3 py-0.5 text-[10px] font-mono font-extrabold uppercase text-white shadow-xs tracking-wider border border-sky-400">
                      <CheckCircle2 className="h-3 w-3" />
                      ACTIVO EN ESTUDIO
                    </span>
                  </div>
                )}

                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                  {/* Left Column: Track Info & Meta */}
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-xs font-mono font-black text-sky-400 shadow-xs">
                        #{index + 1}
                      </span>
                      <h3 className="text-base sm:text-lg font-extrabold text-slate-900 font-display tracking-tight truncate max-w-md">
                        {item.report.metadata.fileName}
                      </h3>
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-mono font-bold text-slate-600 border border-slate-200 uppercase">
                        {item.report.metadata.detectedGenre}
                      </span>
                    </div>

                    {/* Metadata Grid Chips */}
                    <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-slate-600">
                      <div className="flex items-center gap-1">
                        <span className="text-slate-400 font-bold">BPM:</span>
                        <strong className="text-slate-900">{item.report.metadata.estimatedBpm}</strong>
                      </div>
                      <span className="text-slate-300">•</span>
                      <div className="flex items-center gap-1">
                        <span className="text-slate-400 font-bold">TONALIDAD:</span>
                        <strong className="text-slate-900">{item.report.metadata.detectedKey}</strong>
                      </div>
                      <span className="text-slate-300">•</span>
                      <div className="flex items-center gap-1">
                        <span className="text-slate-400 font-bold">DURACIÓN:</span>
                        <strong className="text-slate-900">{formattedDuration}</strong>
                      </div>
                      <span className="text-slate-300">•</span>
                      <div className="flex items-center gap-1 text-[11px] text-slate-500">
                        <Clock className="h-3 w-3 text-slate-400" />
                        <span>Guardado a las {item.savedAt}</span>
                      </div>
                    </div>

                    {/* Producer Verdict Summary */}
                    <p className="text-xs text-slate-600 font-sans italic line-clamp-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                      "{item.report.globalVerdict || item.report.producerComment?.quote}"
                    </p>
                  </div>

                  {/* Center Column: Key Acoustic Metrics */}
                  <div className="grid grid-cols-3 gap-2.5 sm:gap-3 py-2 border-y lg:border-y-0 lg:border-x border-slate-200 lg:px-6">
                    {/* Score */}
                    <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-50 border border-slate-200 text-center min-w-[75px]">
                      <span className="text-[9px] font-mono uppercase font-bold text-slate-500">
                        PUNTAJE
                      </span>
                      <span className={`mt-0.5 px-2 py-0.5 rounded-md text-xs font-black font-mono shadow-2xs ${scoreBadgeColor}`}>
                        {score}/100
                      </span>
                    </div>

                    {/* LUFS */}
                    <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-50 border border-slate-200 text-center min-w-[75px]">
                      <span className="text-[9px] font-mono uppercase font-bold text-slate-500">
                        LUFS
                      </span>
                      <span className="text-xs font-extrabold font-mono text-slate-900 mt-0.5">
                        {item.report.lufsIntegrated}
                      </span>
                    </div>

                    {/* True Peak */}
                    <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-50 border border-slate-200 text-center min-w-[75px]">
                      <span className="text-[9px] font-mono uppercase font-bold text-slate-500">
                        TRUE PEAK
                      </span>
                      <span className="text-xs font-extrabold font-mono text-slate-900 mt-0.5">
                        {item.report.truePeakDb} dB
                      </span>
                    </div>
                  </div>

                  {/* Right Column: Actions */}
                  <div className="flex flex-wrap lg:flex-col items-center justify-end gap-2 shrink-0">
                    {!isCurrent ? (
                      <button
                        type="button"
                        onClick={() => onSelectTrack(item)}
                        className="flex-1 lg:flex-none flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-slate-800 transition-all cursor-pointer font-mono min-w-[170px]"
                      >
                        <Play className="h-3.5 w-3.5 text-sky-400 fill-current" />
                        <span>Cargar este Análisis</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={onNavigateToAudit}
                        className="flex-1 lg:flex-none flex items-center justify-center gap-2 rounded-xl bg-sky-500 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-sky-600 transition-all cursor-pointer font-mono min-w-[170px]"
                      >
                        <Sliders className="h-3.5 w-3.5" />
                        <span>Ver en Auditoría</span>
                      </button>
                    )}

                    <div className="flex items-center gap-1.5 w-full justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          if (!isCurrent) onSelectTrack(item);
                          onNavigateToCoverArt();
                        }}
                        className="flex-1 lg:flex-none p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs transition-colors flex items-center justify-center gap-1 shadow-2xs cursor-pointer"
                        title="Generar portada para este track"
                      >
                        <Palette className="h-3.5 w-3.5 text-indigo-600" />
                        <span className="text-[11px] font-mono">Portada</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onExportPDF(item.report)}
                        className="flex-1 lg:flex-none p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs transition-colors flex items-center justify-center gap-1 shadow-2xs cursor-pointer"
                        title="Exportar reporte en PDF"
                      >
                        <FileDown className="h-3.5 w-3.5 text-emerald-600" />
                        <span className="text-[11px] font-mono">PDF</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Comparative Summary Strip (When 2 or 3 tracks are in history) */}
      {history.length >= 2 && (
        <div className="rounded-2xl border-2 border-slate-300 bg-white/95 p-5 sm:p-6 shadow-sm marble-card">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="h-4 w-4 text-sky-500" />
            <h4 className="text-xs font-bold font-mono text-slate-900 uppercase tracking-wider">
              Comparativa Rápida de Sesiones en Memoria
            </h4>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="pb-2 font-bold">TRACK</th>
                  <th className="pb-2 font-bold">GÉNERO / KEY</th>
                  <th className="pb-2 font-bold">TEMPO</th>
                  <th className="pb-2 font-bold">PUNTAJE</th>
                  <th className="pb-2 font-bold">LUFS</th>
                  <th className="pb-2 font-bold">ALERTAS EQ</th>
                  <th className="pb-2 font-bold text-right">ACCIÓN</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {history.map((h, i) => {
                  const isCurrent = currentFileName === h.report.metadata.fileName;
                  return (
                    <tr key={h.id || i} className={isCurrent ? 'bg-sky-50/60 font-semibold' : ''}>
                      <td className="py-2.5 pr-2 truncate max-w-[180px] font-display text-slate-900">
                        {h.report.metadata.fileName} {isCurrent && '★'}
                      </td>
                      <td className="py-2.5 pr-2">{h.report.metadata.detectedGenre} ({h.report.metadata.detectedKey})</td>
                      <td className="py-2.5 pr-2">{h.report.metadata.estimatedBpm} BPM</td>
                      <td className="py-2.5 pr-2">
                        <span className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-900 font-bold">
                          {h.report.commercialScore}/100
                        </span>
                      </td>
                      <td className="py-2.5 pr-2">{h.report.lufsIntegrated} LUFS</td>
                      <td className="py-2.5 pr-2">{h.report.frequencyAlerts?.length || 0} bandas</td>
                      <td className="py-2.5 text-right">
                        {!isCurrent ? (
                          <button
                            type="button"
                            onClick={() => onSelectTrack(h)}
                            className="text-sky-600 hover:text-sky-800 font-bold underline cursor-pointer"
                          >
                            Cargar
                          </button>
                        ) : (
                          <span className="text-emerald-600 font-bold">Activo</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
