import React from 'react';
import { RefreshCw, Sliders, ShieldCheck, Sparkles, FileDown, MessageSquareCode, CheckCircle2 } from 'lucide-react';
import { AnalysisReport } from '../types';
import { exportReportToPDF } from '../utils/pdfExport';

interface ActionFooterProps {
  report: AnalysisReport;
  onReset: () => void;
  onOpenEqModal: () => void;
  onOpenProModal: () => void;
  onOpenChat?: () => void;
  onExportPDF?: () => void;
}

export const ActionFooter: React.FC<ActionFooterProps> = ({
  report,
  onReset,
  onOpenEqModal,
  onOpenProModal,
  onOpenChat,
  onExportPDF,
}) => {
  const handleExportPDF = () => {
    if (onExportPDF) {
      onExportPDF();
    } else {
      exportReportToPDF(report);
    }
  };

  return (
    <footer className="mt-12 rounded-2xl border-2 border-slate-300 bg-white/95 p-6 sm:p-10 shadow-sm relative marble-card">
      
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b-2 border-slate-300 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-extrabold tracking-[0.25em] text-slate-500 uppercase">
              EXPORT & TOOLS // 05
            </span>
            <span className="text-slate-300">•</span>
            <h3 className="text-xl font-bold text-slate-900 sm:text-2xl font-display neon-title-glow">
              CAJA DE ACCIONES & HERRAMIENTAS DE ESTUDIO
            </h3>
          </div>
          <p className="mt-1 text-xs text-slate-600 font-sans">
            Exporta tus configuraciones acústicas, obtén el PDF completo o pregunta al Asistente IA cómo aplicar los cambios en tu DAW.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-slate-100 px-3.5 py-1 font-mono text-xs font-extrabold text-slate-900 shadow-2xs">
            <Sparkles className="h-4 w-4 text-sky-500" />
            <span>SCORE ACTUAL: {report.commercialScore}/100</span>
          </span>
        </div>
      </div>

      {/* Main Action Buttons Grid with Unmistakable Tactile Buttons */}
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        
        {/* 1. Exportar Auditoría en PDF */}
        <button
          onClick={handleExportPDF}
          className="group flex flex-col items-center justify-between rounded-xl border-2 border-slate-900 bg-slate-900 p-5 text-center text-white shadow-md transition-all hover:bg-slate-800 hover:shadow-lg active:scale-98 cursor-pointer"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-white transition-transform group-hover:scale-110 shadow-xs border border-white/20">
            <FileDown className="h-6 w-6 text-sky-400" />
          </div>
          <div className="mt-4">
            <h4 className="font-mono font-extrabold text-xs uppercase tracking-wide">
              Descargar Reporte PDF
            </h4>
            <p className="mt-1 text-[11px] text-slate-300 leading-normal font-sans">
              Ficha técnica completa en PDF con marcas de tiempo y recomendaciones.
            </p>
          </div>
          <div className="mt-3 rounded-md bg-white/15 px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-sky-300">
            Descarga Inmediata
          </div>
        </button>

        {/* 2. Mini Chat Asistente: Como hago esto? */}
        <button
          onClick={onOpenChat}
          className="group flex flex-col items-center justify-between rounded-xl border-2 border-slate-300 bg-slate-50/90 p-5 text-center transition-all hover:border-slate-800 hover:bg-white hover:shadow-md active:scale-98 cursor-pointer"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-slate-300 bg-white text-slate-900 transition-transform group-hover:scale-110 shadow-2xs">
            <MessageSquareCode className="h-6 w-6 text-sky-500" />
          </div>
          <div className="mt-4">
            <h4 className="font-mono font-extrabold text-slate-900 text-xs uppercase tracking-wide group-hover:text-slate-900">
              ¿Cómo hago esto? (Chat)
            </h4>
            <p className="mt-1 text-[11px] text-slate-600 leading-normal font-sans">
              Pregunta paso a paso cómo corregir las frecuencias en FL Studio, Ableton o Logic.
            </p>
          </div>
          <div className="mt-3 rounded-md border border-slate-300 bg-white px-3 py-1 text-[10px] font-mono font-bold text-slate-800 uppercase tracking-wider group-hover:border-slate-800 group-hover:bg-slate-100">
            Abrir Asistente
          </div>
        </button>

        {/* 3. Exportar Curvas EQ */}
        <button
          onClick={onOpenEqModal}
          className="group flex flex-col items-center justify-between rounded-xl border-2 border-slate-300 bg-slate-50/90 p-5 text-center transition-all hover:border-slate-800 hover:bg-white hover:shadow-md active:scale-98 cursor-pointer"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-slate-300 bg-white text-slate-900 transition-transform group-hover:scale-110 shadow-2xs">
            <Sliders className="h-6 w-6 text-slate-800" />
          </div>
          <div className="mt-4">
            <h4 className="font-mono font-extrabold text-slate-900 text-xs uppercase tracking-wide group-hover:text-slate-900">
              Exportar Curva EQ
            </h4>
            <p className="mt-1 text-[11px] text-slate-600 leading-normal font-sans">
              Descarga valores exactos para FabFilter Pro-Q3, Ableton EQ Eight y FL Studio.
            </p>
          </div>
          <div className="mt-3 rounded-md border border-slate-300 bg-white px-3 py-1 text-[10px] font-mono font-bold text-slate-800 uppercase tracking-wider group-hover:border-slate-800 group-hover:bg-slate-100">
            Ver Parámetros
          </div>
        </button>

        {/* 4. Volver a Escanear */}
        <button
          onClick={onReset}
          className="group flex flex-col items-center justify-between rounded-xl border-2 border-slate-300 bg-slate-50/90 p-5 text-center transition-all hover:border-slate-800 hover:bg-white hover:shadow-md active:scale-98 cursor-pointer"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-slate-300 bg-white text-slate-700 transition-transform group-hover:scale-110 shadow-2xs">
            <RefreshCw className="h-6 w-6 text-slate-700" />
          </div>
          <div className="mt-4">
            <h4 className="font-mono font-extrabold text-slate-900 text-xs uppercase tracking-wide group-hover:text-slate-900">
              Escanear Nueva Versión
            </h4>
            <p className="mt-1 text-[11px] text-slate-600 leading-normal font-sans">
              Sube el nuevo render corregido para verificar si el score sube a verde.
            </p>
          </div>
          <div className="mt-3 rounded-md border border-slate-300 bg-white px-3 py-1 text-[10px] font-mono font-bold text-slate-700 uppercase tracking-wider">
            Subir Audio
          </div>
        </button>

      </div>

      <div className="mt-8 border-t border-slate-300 pt-4 flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-slate-500 gap-2 font-semibold">
        <span>PANNING BY ARMORED BASS · ACOUSTIC DSP ENGINE V4.2</span>
        <span>EBU R128 & ITU-R BS.1770 COMPLIANT</span>
      </div>
    </footer>
  );
};
