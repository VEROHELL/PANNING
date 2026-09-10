import React, { useRef, useState } from 'react';
import { Upload, Music, Sparkles, ShieldCheck, Play, ArrowUpRight, Radio, Sliders, Disc3, Info, CheckCircle2 } from 'lucide-react';
import { DEMO_TRACKS, DemoTrackItem } from '../data/demoTracks';
import { BrandLogo } from './BrandLogo';

interface UploadHeroProps {
  onFileSelected: (file: File) => void;
  onDemoSelected: (demo: DemoTrackItem) => void;
  isAnalyzing: boolean;
  analysisStep: string;
  analysisProgress: number;
}

export const UploadHero: React.FC<UploadHeroProps> = ({
  onFileSelected,
  onDemoSelected,
  isAnalyzing,
  analysisStep,
  analysisProgress,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      onFileSelected(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const selected = files[0];
      e.target.value = ''; // Cleanly reset so re-selecting same or different files triggers fresh analysis
      onFileSelected(selected);
    }
  };

  return (
    <section className="relative mx-auto max-w-6xl px-2 sm:px-4 py-6 sm:py-10">
      
      {/* Brand Hero & Introduction Banner */}
      <div className="mb-8 rounded-2xl border-2 border-slate-300 bg-white/95 p-6 sm:p-10 shadow-sm overflow-hidden text-center relative marble-card">
        <div className="mx-auto max-w-3xl flex flex-col items-center">
          <BrandLogo size="hero" showSubtitle={true} className="mb-4" />
          
          <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-slate-300 bg-slate-100 px-3.5 py-1 text-xs font-bold text-slate-800 shadow-2xs">
            <Sparkles className="h-3.5 w-3.5 text-sky-600" />
            <span>Auditoría de Audio EBU R128 · Retención Algorítmica TikTok & Spotify</span>
          </div>

          <h1 className="mt-4 text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 font-display neon-title-glow">
            Descubre si tu canción está lista para competir en la industria musical
          </h1>

          <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl font-sans">
            Sube tu maqueta o máster final en MP3 o WAV para recibir un dictamen acústico instantáneo, semáforo de frecuencias FFT, nivel comercial en LUFS y el corte viral exacto para redes.
          </p>

          {/* 3 Value Pillars */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 w-full text-left">
            <div className="rounded-xl border-2 border-slate-200 bg-slate-50/80 p-3.5 shadow-2xs">
              <div className="flex items-center gap-2 font-bold text-xs text-slate-900 font-mono">
                <ShieldCheck className="h-4 w-4 text-slate-700 shrink-0" />
                <span>100% SEGURO Y LOCAL</span>
              </div>
              <p className="mt-1 text-[11px] text-slate-600 leading-normal">
                Tu audio se procesa en la memoria de tu navegador. Nadie puede descargar tu música.
              </p>
            </div>

            <div className="rounded-xl border-2 border-slate-200 bg-slate-50/80 p-3.5 shadow-2xs">
              <div className="flex items-center gap-2 font-bold text-xs text-slate-900 font-mono">
                <Radio className="h-4 w-4 text-slate-700 shrink-0" />
                <span>MEDICIÓN -9 LUFS</span>
              </div>
              <p className="mt-1 text-[11px] text-slate-600 leading-normal">
                Mide sonoridad integrada y True Peak para evitar que Spotify baje el volumen de tu canción.
              </p>
            </div>

            <div className="rounded-xl border-2 border-slate-200 bg-slate-50/80 p-3.5 shadow-2xs">
              <div className="flex items-center gap-2 font-bold text-xs text-slate-900 font-mono">
                <Sliders className="h-4 w-4 text-slate-700 shrink-0" />
                <span>CURVAS DAW & CHAT</span>
              </div>
              <p className="mt-1 text-[11px] text-slate-600 leading-normal">
                Obtén valores exactos para FL Studio, Ableton y Logic, y pregunta al asistente IA.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Drag & Drop Zone */}
      {!isAnalyzing ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`group relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-3 border-dashed p-8 text-center transition-all duration-200 sm:p-12 ${
            isDragOver
              ? 'border-slate-800 bg-slate-100/90 shadow-lg scale-[1.01]'
              : 'border-slate-300 bg-white/90 hover:border-slate-500 hover:bg-slate-50/90 shadow-sm'
          }`}
        >
          {/* Upload Button Icon */}
          <div className="relative mb-4 flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl border-2 border-slate-300 bg-slate-100 text-slate-800 shadow-xs transition-transform duration-300 group-hover:scale-110 group-hover:bg-slate-900 group-hover:text-white">
            <Upload className="h-8 w-8" />
          </div>

          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-display neon-title-glow">
            Arrastra aquí tu archivo de audio
          </h2>
          <p className="mt-1.5 text-xs sm:text-sm font-medium text-slate-500 font-sans">
            o haz clic para buscar en tu dispositivo · <span className="font-bold text-slate-900">WAV, MP3, M4A, FLAC, OGG</span>
          </p>

          {/* Big Clickable Action Button */}
          <div className="mt-6">
            <button
              type="button"
              className="studio-btn-metallic text-sm py-3 px-6 shadow-md pointer-events-none"
            >
              <Upload className="h-4 w-4 mr-2" />
              <span>Seleccionar Archivo de Audio</span>
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*,.mp3,.wav,.m4a,.aac,.flac,.ogg"
            className="hidden"
            onChange={handleFileInputChange}
          />
        </div>
      ) : (
        /* Advanced Scanning State */
        <div className="rounded-2xl border-2 border-slate-400 bg-white/95 p-8 sm:p-12 text-center shadow-lg animate-fade-in marble-card">
          {/* Animated radar circle */}
          <div className="relative mx-auto mb-6 flex h-24 w-24 items-center justify-center">
            <div className="absolute inset-0 rounded-full border-4 border-slate-400/30 animate-ping" />
            <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-slate-900 text-sky-400 shadow-md">
              <Music className="h-8 w-8 animate-pulse" />
            </div>
          </div>

          <span className="rounded-full bg-slate-100 border border-slate-300 px-3 py-1 text-[11px] font-mono font-bold uppercase tracking-widest text-slate-800">
            MOTOR DSP EN EJECUCIÓN
          </span>

          <h3 className="mt-3 text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-display neon-title-glow">
            Analizando Parámetros Acústicos
          </h3>

          <p className="mx-auto mt-2 max-w-md text-xs sm:text-sm font-mono text-slate-700">
            {analysisStep}
          </p>

          {/* Progress Bar */}
          <div className="mx-auto mt-6 max-w-md">
            <div className="h-2.5 w-full rounded-full bg-slate-200 overflow-hidden border border-slate-300">
              <div
                className="h-full rounded-full bg-gradient-to-r from-slate-700 via-slate-900 to-sky-600 transition-all duration-300"
                style={{ width: `${analysisProgress}%` }}
              />
            </div>
            <div className="mt-2 flex justify-between font-mono text-xs text-slate-600 font-semibold">
              <span>DECODIFICANDO</span>
              <span className="text-slate-900 font-bold">{Math.round(analysisProgress)}% COMPLETADO</span>
            </div>
          </div>
        </div>
      )}

      {/* Demo Test Tracks with Unmistakable Buttons */}
      <div className="mt-10">
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-slate-300 pb-3">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-900 text-sky-400 text-xs font-bold">
              ★
            </span>
            <h3 className="text-sm font-bold tracking-wide uppercase text-slate-900 font-display neon-title-glow">
              ¿No tienes un archivo a mano? Prueba con estas maquetas de ejemplo
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-600 font-semibold">
            1 CLIC PARA EVALUAR
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {DEMO_TRACKS.map((demo) => (
            <div
              key={demo.id}
              onClick={() => onDemoSelected(demo)}
              className="group flex cursor-pointer flex-col justify-between rounded-xl border-2 border-slate-300 bg-white/95 p-5 shadow-xs transition-all duration-200 hover:border-slate-500 hover:shadow-md hover:-translate-y-0.5 active:scale-98 marble-card"
            >
              <div>
                <div className="flex items-start justify-between gap-2 border-b border-slate-200 pb-3">
                  <div>
                    <span className="rounded-md bg-slate-100 border border-slate-300 px-2 py-0.5 text-[10px] font-mono font-bold text-slate-700 uppercase">
                      {demo.expectedScoreTag}
                    </span>
                    <h4 className="mt-2 text-base font-extrabold text-slate-900 group-hover:text-slate-700 transition-colors font-display">
                      {demo.name}
                    </h4>
                    <p className="text-xs font-mono text-slate-500">{demo.artist} · {demo.genre}</p>
                  </div>
                </div>

                <p className="mt-3 text-xs leading-relaxed text-slate-600 font-sans">
                  {demo.description}
                </p>
              </div>

              {/* Tangible Clickable Button */}
              <div className="mt-4 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-slate-300 bg-slate-100 py-2.5 text-xs font-bold text-slate-900 shadow-xs group-hover:border-slate-800 group-hover:bg-slate-900 group-hover:text-white transition-all pointer-events-none"
                >
                  <Play className="h-3.5 w-3.5 fill-current text-sky-400" />
                  <span>Escanear esta Maqueta</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
