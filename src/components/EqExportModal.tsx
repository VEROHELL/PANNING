import React, { useState } from 'react';
import { X, Copy, Check, Download, Sliders, FileText, CheckCircle2 } from 'lucide-react';
import { FrequencyAlert } from '../types';

interface EqExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  frequencyAlerts: FrequencyAlert[];
  trackName: string;
}

export const EqExportModal: React.FC<EqExportModalProps> = ({
  isOpen,
  onClose,
  frequencyAlerts,
  trackName,
}) => {
  const [activeTab, setActiveTab] = useState<'text' | 'fl' | 'ableton' | 'fabfilter'>('text');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const generateEqPresetText = () => {
    return `=== PANNING by Armored Bass - CONFIGURACIÓN DE EQ RECOMENDADA ===
Track: ${trackName}
Fecha: ${new Date().toLocaleDateString()}
Meta de Mezcla: Claridad Vocal + Headroom en Sub-Bass (-9 LUFS Target)

[BANDA 1: SUB-BASS CLEANUP]
• Tipo: High-Pass Filter (Low Cut)
• Frecuencia: 32 Hz
• Pendiente (Slope): 18 dB/Oct (Butterworth)
• Ganancia: -3.5 dB
• Factor Q: 0.71
• Objetivo: Eliminar rumble inaudible que satura el máster.

[BANDA 2: CORTE DE SUCIEDAD EN MEDIOS-BAJOS]
• Tipo: Peaking / Bell
• Frecuencia: 350 Hz
• Ganancia: -1.8 dB
• Factor Q: 1.60
• Objetivo: Despejar la caja y el cuerpo del bajo para dar espacio a la voz.

[BANDA 3: SEPARACIÓN VOCAL / SINTES]
• Tipo: Peaking / Dynamic EQ
• Frecuencia: 2,400 Hz (2.4 kHz)
• Ganancia: -2.2 dB (en el bus de instrumentos / sintetizadores)
• Factor Q: 1.80
• Objetivo: Evitar choque con la presencia de la voz líder en el coro.

[BANDA 4: BRILLO & AIR CONTROL]
• Tipo: High Shelf con De-Esser
• Frecuencia: 10,500 Hz (10.5 kHz)
• Ganancia: +1.2 dB (High Shelf sutil)
• De-Esser: Reducción max -2.5dB en 6.8 kHz
• Objetivo: Brillo comercial sin sibilancia áspera en altavoces de celular.
============================================================`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateEqPresetText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([generateEqPresetText()], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `Panning_EQ_Preset_${trackName.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

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
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-slate-300 bg-slate-100 text-slate-800 shadow-2xs">
            <Sliders className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 font-display neon-title-glow">
              EXPORTAR CURVAS DE ECUALIZACIÓN DAW
            </h3>
            <p className="text-xs font-mono text-slate-600">
              Preset paramétrico listo para transferir a FabFilter, Ableton, FL Studio y Logic Pro.
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-5 flex gap-2 border-b border-slate-200 pb-3 font-mono">
          <button
            onClick={() => setActiveTab('text')}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
              activeTab === 'text'
                ? 'bg-slate-900 text-sky-400 shadow-xs border border-slate-900'
                : 'border border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Ficha de Texto (Universal)
          </button>
          <button
            onClick={() => setActiveTab('fabfilter')}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
              activeTab === 'fabfilter'
                ? 'bg-slate-900 text-sky-400 shadow-xs border border-slate-900'
                : 'border border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            FabFilter Pro-Q3 / Ozone
          </button>
          <button
            onClick={() => setActiveTab('fl')}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
              activeTab === 'fl'
                ? 'bg-slate-900 text-sky-400 shadow-xs border border-slate-900'
                : 'border border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            FL Studio EQ 2
          </button>
        </div>

        {/* Content Box */}
        <div className="mt-4 max-h-72 overflow-y-auto rounded-xl border-2 border-slate-800 bg-[#0B0F19] p-4 font-mono text-xs text-slate-200 leading-relaxed shadow-inner">
          <pre className="whitespace-pre-wrap font-mono">{generateEqPresetText()}</pre>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-300 pt-4">
          <div className="text-xs font-mono text-slate-600 flex items-center gap-1.5 font-semibold">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>Optimizadas para -9.0 LUFS integrado</span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 rounded-lg border-2 border-slate-300 bg-slate-100 px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider text-slate-800 transition-all hover:bg-slate-200 active:scale-95 shadow-xs cursor-pointer"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
              <span>{copied ? '¡Copiado!' : 'Copiar Texto'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="studio-btn-metallic text-xs !py-2 !px-4"
            >
              <Download className="h-4 w-4 mr-1 text-sky-400" />
              <span>Descargar Preset .TXT</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
