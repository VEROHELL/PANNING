import React from 'react';
import { RefreshCw, FileDown, MessageSquareCode, Layers, ShieldCheck, Sparkles, Sliders } from 'lucide-react';
import { AudioMetadata } from '../types';
import { BrandLogo } from './BrandLogo';

interface HeaderProps {
  metadata?: AudioMetadata | null;
  onReset: () => void;
  onSelectDemoModal?: () => void;
  onOpenChat?: () => void;
  onExportPDF?: () => void;
  isScanned?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  metadata,
  onReset,
  onSelectDemoModal,
  onOpenChat,
  onExportPDF,
  isScanned = false,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b-2 border-slate-300 bg-white/95 backdrop-blur-md shadow-xs transition-all">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4 lg:px-8">
        
        {/* Brand & Identity: PANNING by Armored Bass */}
        <div 
          onClick={onReset}
          className="group flex cursor-pointer items-center gap-3 transition-transform hover:scale-[1.01]"
        >
          <BrandLogo size="md" showSubtitle={false} className="shrink-0" />
          
          <div className="flex flex-col text-left">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono tracking-[0.25em] uppercase text-slate-500 font-extrabold">
                AUDITORÍA DSP & STREAMING
              </span>
              <span className="rounded-sm bg-slate-100 border border-slate-300 px-1.5 py-0.2 text-[9px] font-mono text-slate-700 font-bold uppercase">
                v4.2 PRO
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 font-display neon-title-glow">
                PANNING
              </span>
              <span className="text-xs sm:text-sm font-bold tracking-wider text-slate-500 font-mono uppercase">
                by Armored Bass
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic Center Telemetry Badge (When Scanned) */}
        {isScanned && metadata && (
          <div className="hidden md:flex items-center gap-3 rounded-xl border-2 border-slate-300 bg-slate-50 px-4 py-1.5 text-xs text-slate-700 shadow-xs">
            <div className="flex items-center gap-2 font-mono text-slate-900 font-semibold">
              <span className="h-2 w-2 rounded-full bg-sky-500 animate-pulse" />
              <span className="max-w-[140px] truncate lg:max-w-[200px]" title={metadata.fileName}>
                {metadata.fileName}
              </span>
            </div>
            <span className="h-3 w-px bg-slate-300" />
            <span className="font-mono text-[11px] font-bold text-slate-900 uppercase">
              {metadata.detectedGenre}
            </span>
            <span className="h-3 w-px bg-slate-300" />
            <span className="font-mono text-[11px] text-slate-600 font-medium">
              {metadata.estimatedBpm} BPM · {metadata.detectedKey}
            </span>
          </div>
        )}

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {isScanned ? (
            <>
              {/* Mini Chat "Como Hago Esto?" Button */}
              {onOpenChat && (
                <button
                  onClick={onOpenChat}
                  className="studio-btn-metallic text-xs !py-2 !px-3.5"
                  title="Abrir Asistente: ¿Cómo hago esto?"
                >
                  <MessageSquareCode className="h-4 w-4 mr-1.5 text-sky-400" />
                  <span className="hidden sm:inline">¿Cómo hago esto?</span>
                  <span className="sm:hidden">Chat</span>
                </button>
              )}

              {/* PDF Export Button */}
              {onExportPDF && (
                <button
                  onClick={onExportPDF}
                  className="studio-btn-silver text-xs !py-2 !px-3.5"
                  title="Descargar Reporte Completo en PDF"
                >
                  <FileDown className="h-4 w-4 mr-1.5 text-slate-700" />
                  <span className="hidden sm:inline">Exportar PDF</span>
                  <span className="sm:hidden">PDF</span>
                </button>
              )}

              {/* Reset Button */}
              <button
                onClick={onReset}
                className="flex items-center gap-1.5 rounded-xl border-2 border-slate-300 bg-slate-100 px-3 py-2 text-xs font-mono font-bold text-slate-700 hover:bg-slate-200 active:scale-95 transition-all shadow-xs"
                title="Escanear otro archivo de audio"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span className="hidden md:inline">Nueva Pista</span>
              </button>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 rounded-xl border-2 border-slate-300 bg-slate-50 px-3.5 py-1.5 text-[11px] font-mono font-semibold text-slate-700 shadow-2xs">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span>MOTOR DSP: ONLINE</span>
              </div>
            </>
          )}
        </div>

      </div>
    </header>
  );
};
