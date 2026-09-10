import React, { useState } from 'react';
import { Activity, AlertTriangle, CheckCircle, Info, Sliders, VolumeX, Wrench, Sparkles, MessageSquareCode } from 'lucide-react';
import { AnalysisReport, FrequencyAlert } from '../types';

interface FrequencySpectrumProps {
  report: AnalysisReport;
  onOpenEqModal?: () => void;
  onOpenChat?: () => void;
}

export const FrequencySpectrum: React.FC<FrequencySpectrumProps> = ({
  report,
  onOpenEqModal,
  onOpenChat,
}) => {
  const [selectedBand, setSelectedBand] = useState<string>('Sub-Bass');
  const { spectrumData, frequencyAlerts } = report;

  const currentAlert =
    frequencyAlerts.find((a) => a.bandName.toLowerCase().includes(selectedBand.toLowerCase())) ||
    frequencyAlerts[0];

  return (
    <section className="mt-10">
      {/* Section Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-slate-300 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-extrabold tracking-[0.25em] text-slate-500 uppercase">
              RTA SPECTROGRAM // 02
            </span>
            <span className="text-slate-300">•</span>
            <h3 className="text-xl font-bold text-slate-900 sm:text-2xl font-display neon-title-glow">
              ESCANEO DE FRECUENCIAS INTERACTIVO (FFT)
            </h3>
          </div>
          <p className="mt-1 text-xs text-slate-600 font-sans">
            Espectrograma en tiempo real con detección de choques armónicos, acumulación de graves y pérdida de claridad vocal.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onOpenEqModal && (
            <button
              onClick={onOpenEqModal}
              className="studio-btn-metallic text-xs"
            >
              <Sliders className="h-4 w-4 mr-2 text-sky-400" />
              <span>Exportar Curva EQ Recomendada</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Spectrum Visualizer Card */}
      <div className="relative rounded-2xl border-2 border-slate-300 bg-white/95 p-6 sm:p-8 shadow-sm marble-card">
        
        {/* Spectrum Canvas / Dark High-Contrast Visualizer Box */}
        <div className="relative rounded-xl border-2 border-slate-800 bg-[#0B0F19] p-4 sm:p-6 shadow-inner">
          
          {/* Top Info Bar */}
          <div className="mb-4 flex items-center justify-between text-xs font-mono text-slate-400 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-white font-bold">
                <span className="h-2.5 w-2.5 rounded-full bg-sky-400 shadow-xs" />
                <span>NIVEL REAL FFT</span>
              </span>
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="h-2 w-2 border border-dashed border-slate-400" />
                <span>CURVA OBJETIVO -9 LUFS</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sky-400 font-mono text-xs font-bold">RANGO: 20 Hz — 20 kHz</span>
            </div>
          </div>

          {/* Spectrum Bars Graph */}
          <div className="relative grid h-44 sm:h-52 grid-cols-12 items-end gap-1.5 sm:gap-2.5 pt-4">
            {/* Grid Line Markers (-10dB, -20dB, -30dB, -40dB) */}
            <div className="pointer-events-none absolute inset-0 flex flex-col justify-between border-b border-slate-800 opacity-20">
              <div className="border-b border-slate-600 w-full" />
              <div className="border-b border-slate-600 w-full" />
              <div className="border-b border-slate-600 w-full" />
              <div className="border-b border-slate-600 w-full" />
            </div>

            {spectrumData.map((band, idx) => {
              const hasAlert = !!band.issue;
              const isSelected = selectedBand.toLowerCase().includes(band.frequency.split(' ')[0].toLowerCase()) || (idx === 1 && selectedBand === 'Sub-Bass');

              // Normalize height from -50dB to 0dB -> 0% to 100%
              const heightPercent = Math.min(100, Math.max(10, ((band.actualLevel + 50) / 50) * 100));
              const targetHeightPercent = Math.min(100, Math.max(10, ((band.targetLevel + 50) / 50) * 100));

              return (
                <div
                  key={band.frequency}
                  onClick={() => {
                    if (idx <= 2) setSelectedBand('Sub-Bass');
                    else if (idx >= 6 && idx <= 8) setSelectedBand('Medios-Altos');
                    else setSelectedBand('Presencia & Brillo');
                  }}
                  className={`group relative flex h-full cursor-pointer flex-col justify-end items-center rounded-t-sm transition-all ${
                    isSelected ? 'bg-white/10' : 'hover:bg-white/5'
                  }`}
                >
                  {/* Warning Icon on Problem Band */}
                  {hasAlert && (
                    <div className="absolute -top-3 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-mono font-black text-white shadow-md">
                      !
                    </div>
                  )}

                  {/* Ideal Target Line Indicator */}
                  <div
                    className="absolute w-full border-t-2 border-dashed border-sky-400 z-10 pointer-events-none"
                    style={{ bottom: `${targetHeightPercent}%` }}
                    title={`Objetivo: ${band.targetLevel} dB`}
                  />

                  {/* Actual Level Bar */}
                  <div
                    className={`w-full rounded-t-sm transition-all duration-500 ${
                      hasAlert
                        ? 'bg-rose-500 shadow-sm'
                        : isSelected
                        ? 'bg-sky-400 shadow-sm'
                        : 'bg-slate-500 group-hover:bg-slate-400'
                    }`}
                    style={{ height: `${heightPercent}%` }}
                  />

                  {/* Frequency Label */}
                  <span className="mt-2 text-[10px] font-mono text-slate-400 group-hover:text-white truncate max-w-full font-semibold">
                    {band.frequency.split(' ')[0]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Problem & Solution Cards for Selected/Detected Bands */}
        <div className="mt-8">
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-slate-200 pb-2">
            <h4 className="text-xs font-mono font-extrabold uppercase tracking-[0.2em] text-slate-900 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <span>DIAGNÓSTICO ACÚSTICO Y CURVA CORRECTIVA DAW:</span>
            </h4>
            <span className="text-xs font-mono text-slate-500 font-semibold">3 NODOS DE FRECUENCIA CRÍTICOS</span>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {frequencyAlerts.map((alert, idx) => {
              const isSelected = selectedBand.toLowerCase().includes(alert.bandName.toLowerCase());

              return (
                <div
                  key={alert.id}
                  onClick={() => setSelectedBand(alert.bandName)}
                  className={`flex cursor-pointer flex-col justify-between rounded-xl border-2 p-5 transition-all shadow-xs ${
                    alert.severity === 'critical'
                      ? isSelected
                        ? 'border-rose-500 bg-rose-50/70 ring-2 ring-rose-500/20'
                        : 'border-rose-300 bg-rose-50/30 hover:border-rose-400'
                      : alert.severity === 'warning'
                      ? isSelected
                        ? 'border-amber-500 bg-amber-50/70 ring-2 ring-amber-500/20'
                        : 'border-amber-300 bg-amber-50/30 hover:border-amber-400'
                      : isSelected
                      ? 'border-slate-800 bg-slate-100 ring-2 ring-slate-800/20'
                      : 'border-slate-300 bg-slate-50 hover:border-slate-400'
                  }`}
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-slate-600 text-xs font-extrabold">0{idx + 1}</span>
                        <span className="font-extrabold text-slate-900 text-xs uppercase tracking-wider font-mono">
                          {alert.bandName}
                        </span>
                      </div>
                      <span className="font-mono text-xs font-bold text-slate-600">
                        {alert.frequencyRange}
                      </span>
                    </div>

                    {/* Problem statement */}
                    <div className="mt-3 rounded-lg bg-white p-3 border border-slate-200 shadow-2xs">
                      <div className="text-[10px] font-mono font-extrabold text-rose-700 uppercase tracking-wide">
                        ALERTA DETECTADA:
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-slate-700 font-medium font-sans">
                        {alert.detectedIssue}
                      </p>
                    </div>

                    {/* Studio Solution */}
                    <div className="mt-3 rounded-lg bg-slate-100 p-3 border border-slate-300">
                      <div className="text-[10px] font-mono font-extrabold text-slate-900 uppercase tracking-wide flex items-center gap-1">
                        <Wrench className="h-3 w-3 text-slate-700" />
                        <span>CORRECCIÓN DE ECUALIZACIÓN DAW:</span>
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-slate-900 font-semibold font-sans">
                        {alert.studioSolution}
                      </p>
                    </div>
                  </div>

                  {/* Technical Values */}
                  <div className="mt-4 border-t border-slate-200 pt-3 grid grid-cols-2 gap-2 text-xs font-mono text-slate-600">
                    <div>
                      <span className="text-slate-400">GANANCIA:</span> <strong className="text-slate-900 font-bold">{alert.gainAdjustment}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400">FACTOR Q:</span> <strong className="text-slate-900 font-bold">{alert.qFactor}</strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
