import React from 'react';
import { X, ShieldCheck, Sparkles, Award, CheckCircle2, FileCheck, Radio, Flame, FileDown } from 'lucide-react';
import { AnalysisReport } from '../types';
import { exportReportToPDF } from '../utils/pdfExport';

interface ProCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: AnalysisReport;
}

export const ProCertificateModal: React.FC<ProCertificateModalProps> = ({
  isOpen,
  onClose,
  report,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl rounded-2xl border-2 border-slate-300 bg-white/98 p-6 sm:p-8 shadow-2xl marble-card">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-lg border-2 border-slate-300 bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 border-b-2 border-slate-300 pb-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border-2 border-slate-300 bg-slate-100 text-slate-800 shadow-2xs">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-900 font-display neon-title-glow">
                PANNING PRO // CERTIFICADO DIGITAL
              </h3>
              <span className="rounded-md border border-slate-300 bg-slate-100 px-2 py-0.5 font-mono text-[9px] font-bold text-slate-800">
                AES VERIFIED
              </span>
            </div>
            <p className="text-xs font-mono text-slate-600">
              Acreditación técnica para enviar a sellos discográficos, distribuidoras y A&R.
            </p>
          </div>
        </div>

        {/* Certificate Card Preview */}
        <div className="mt-5 rounded-xl border-2 border-slate-300 bg-slate-50 p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-bold">TRACK ANALIZADO</span>
              <h4 className="font-mono font-extrabold text-slate-900 text-base">{report.metadata.fileName}</h4>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-bold">CALIFICACIÓN</span>
              <div className="font-mono font-extrabold text-xl text-slate-900 neon-title-glow">
                {report.commercialScore} / 100
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 text-xs font-mono sm:grid-cols-4">
            <div className="rounded-lg border border-slate-300 bg-white p-2.5 shadow-2xs">
              <span className="text-slate-500 block text-[10px] font-bold">LUFS OBJETIVO</span>
              <strong className="text-slate-900 font-bold">{report.lufsIntegrated} LUFS</strong>
            </div>
            <div className="rounded-lg border border-slate-300 bg-white p-2.5 shadow-2xs">
              <span className="text-slate-500 block text-[10px] font-bold">GÉNERO</span>
              <strong className="text-slate-900 font-bold truncate block">{report.metadata.detectedGenre}</strong>
            </div>
            <div className="rounded-lg border border-slate-300 bg-white p-2.5 shadow-2xs">
              <span className="text-slate-500 block text-[10px] font-bold">BPM ESTIMADO</span>
              <strong className="text-slate-900 font-bold">{report.metadata.estimatedBpm} BPM</strong>
            </div>
            <div className="rounded-lg border border-slate-300 bg-white p-2.5 shadow-2xs">
              <span className="text-slate-500 block text-[10px] font-bold">COMPATIBILIDAD</span>
              <strong className="text-slate-900 font-bold">ALTA (TIKTOK/DSP)</strong>
            </div>
          </div>
        </div>

        {/* Pro Benefits list */}
        <div className="mt-6 space-y-3">
          <div className="text-xs font-mono font-extrabold text-slate-900 uppercase tracking-[0.2em]">
            BENEFICIOS INCLUIDOS EN PANNING PRO
          </div>

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 text-xs font-mono text-slate-700">
            <div className="flex items-start gap-2 rounded-lg border border-slate-300 bg-white p-3 shadow-2xs">
              <FileCheck className="h-4 w-4 text-slate-800 shrink-0 mt-0.5" />
              <span>Certificado digital de calidad acústica descargable en PDF con sello oficial.</span>
            </div>
            <div className="flex items-start gap-2 rounded-lg border border-slate-300 bg-white p-3 shadow-2xs">
              <Radio className="h-4 w-4 text-slate-800 shrink-0 mt-0.5" />
              <span>Comparativa A/B contra los 50 tracks más escuchados de tu género este mes.</span>
            </div>
            <div className="flex items-start gap-2 rounded-lg border border-slate-300 bg-white p-3 shadow-2xs">
              <Sparkles className="h-4 w-4 text-sky-500 shrink-0 mt-0.5" />
              <span>Revisión de Stems (Voz, Batería, Bajo, Sintetizadores por separado).</span>
            </div>
            <div className="flex items-start gap-2 rounded-lg border border-slate-300 bg-white p-3 shadow-2xs">
              <Flame className="h-4 w-4 text-sky-500 shrink-0 mt-0.5" />
              <span>Estrategia de lanzamiento para viralizar tu sonido en TikTok Ads y Shorts.</span>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="mt-6 flex items-center justify-between border-t border-slate-300 pt-4">
          <button
            onClick={onClose}
            className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
          >
            Cerrar
          </button>

          <button
            onClick={() => {
              exportReportToPDF(report);
            }}
            className="studio-btn-metallic text-xs !py-2.5 !px-5"
          >
            <FileDown className="h-4 w-4 mr-1 text-sky-400" />
            <span>Descargar Certificado PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
};
