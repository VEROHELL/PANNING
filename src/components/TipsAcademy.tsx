import React, { useState } from 'react';
import { 
  Lightbulb, 
  Sparkles, 
  Copy, 
  Check, 
  Search, 
  Filter, 
  Sliders, 
  Activity, 
  Volume2, 
  Flame, 
  Music, 
  Brain, 
  ShieldCheck, 
  ArrowRight,
  Disc,
  Radio,
  BookOpen
} from 'lucide-react';
import { PRO_STUDIO_TIPS, ProStudioTip } from '../data/proStudioTips';
import { AnalysisReport } from '../types';

interface TipsAcademyProps {
  report?: AnalysisReport | null;
  onNavigateToAudit?: () => void;
  onOpenChatWithTopic?: (topic: string) => void;
}

// Audio Frequency Periodic Table Guide
const FREQUENCY_CHEAT_SHEET = [
  {
    range: '20 Hz - 60 Hz',
    band: 'Sub-Bass & Infrasonidos',
    character: 'Peso físico, vibración de subwoofer, sensación en el pecho.',
    rule: 'Cortar a 30-32 Hz con High-Pass 24dB/oct en Master. Poner en mono estricto bajo 90 Hz para evitar cancelaciones de fase.',
    color: 'border-rose-300 bg-rose-50/50 text-rose-900',
  },
  {
    range: '60 Hz - 250 Hz',
    band: 'Graves & Pegada (Punch)',
    character: 'Cuerpo del bombo (Kick), fundamentales de la línea de bajo y 808.',
    rule: 'Sidechain compression rápido (ataque 1ms, release 60ms) para que el bombo no se pelee con el sub-bajo.',
    color: 'border-amber-300 bg-amber-50/50 text-amber-900',
  },
  {
    range: '250 Hz - 500 Hz',
    band: 'Medios-Bajos & Calidez (Warmth / Boxiness)',
    character: 'Cuerpo de guitarras, caja (snare) y voces masculinas. Zona propensa a sonido acartonado.',
    rule: 'Hacer un corte sutil de -1.5 a -2.5 dB con Q ancha si la mezcla suena opaca o "como dentro de una caja de zapatos".',
    color: 'border-yellow-300 bg-yellow-50/50 text-yellow-900',
  },
  {
    range: '500 Hz - 2.0 kHz',
    band: 'Medios & Dinámica Principal',
    character: 'Inteligibilidad armónica, sintetizadores melódicos, caja y presencia de voz.',
    rule: 'Evitar amontonar demasiados instrumentos tocando en las mismas octavas. Distribuir con paneo (L/R) o ecualización sustractiva.',
    color: 'border-emerald-300 bg-emerald-50/50 text-emerald-900',
  },
  {
    range: '2.0 kHz - 5.0 kHz',
    band: 'Medios-Altos & Zona de Presencia (Fletcher-Munson)',
    character: 'El oído humano es 3x más sensible aquí. Define si una voz corta la mezcla o se pierde.',
    rule: 'Ducking de -2 dB en 2.4-3.5 kHz en los instrumentos cuando la voz está cantando para abrir espacio automático.',
    color: 'border-sky-300 bg-sky-50/50 text-sky-900',
  },
  {
    range: '6.0 kHz - 20 kHz',
    band: 'Brillo, Sibilancia & Aire Analógico (Air Band)',
    character: 'Detalle de hi-hats, respiración de la voz, textura de platillos y apertura estéreo.',
    rule: 'Controlar las "S" con un De-Esser en 6.8-7.8 kHz y añadir un High-Shelf suave en 14 kHz para un acabado comercial sedoso.',
    color: 'border-indigo-300 bg-indigo-50/50 text-indigo-900',
  },
];

export const TipsAcademy: React.FC<TipsAcademyProps> = ({ 
  report, 
  onNavigateToAudit,
  onOpenChatWithTopic
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedTipId, setCopiedTipId] = useState<string | null>(null);
  const [activeDailyTipIndex, setActiveDailyTipIndex] = useState(0);

  const categories = ['Todos', 'Mezcla', 'Mastering', 'Viralidad', 'Armonía', 'Psicoacústica'];

  // Filtered Tips
  const filteredTips = PRO_STUDIO_TIPS.filter((tip) => {
    const matchesCat = selectedCategory === 'Todos' || tip.category === selectedCategory;
    const matchesSearch = 
      tip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tip.advice.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tip.actionableStep.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const dailyTip = PRO_STUDIO_TIPS[activeDailyTipIndex] || PRO_STUDIO_TIPS[0];

  const handleCopyTip = (tip: ProStudioTip) => {
    const textToCopy = `💡 CONSEJO PRO DE ESTUDIO // ${tip.category.toUpperCase()}\n${tip.title}\n\n• Diagnóstico: ${tip.advice}\n• Acción Inmediata: ${tip.actionableStep}\n\n— ${tip.authorTag}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedTipId(tip.id);
    setTimeout(() => setCopiedTipId(null), 2500);
  };

  const nextDailyTip = () => {
    setActiveDailyTipIndex((prev) => (prev + 1) % PRO_STUDIO_TIPS.length);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="mb-8 rounded-3xl border-2 border-slate-300 bg-white/95 p-6 sm:p-8 shadow-sm marble-card">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 font-mono text-xs font-extrabold tracking-[0.25em] text-slate-500 uppercase">
              <span>STUDIO KNOWLEDGE HUB // SECRETOS DE PRODUCCIÓN</span>
              <span className="rounded bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 text-[10px]">
                AES & EBU R128 STANDARDS
              </span>
            </div>
            <h1 className="mt-2 text-2xl sm:text-3xl font-black text-slate-900 font-display neon-title-glow">
              TIPS DEL DÍA & SECRETOS PRO DE PRODUCCIÓN
            </h1>
            <p className="mt-2 text-sm text-slate-600 max-w-3xl font-sans">
              Guía técnica, secretos de mezcla analógica, fórmulas psicoacústicas de retención viral y la tabla periódica de frecuencias para conseguir un sonido de calidad internacional.
            </p>
          </div>

          {report && onNavigateToAudit && (
            <button
              onClick={onNavigateToAudit}
              className="inline-flex items-center gap-2 rounded-xl border-2 border-slate-300 bg-slate-50 px-4 py-2.5 text-xs font-mono font-bold text-slate-800 hover:bg-slate-100 transition-all shadow-xs shrink-0"
            >
              <span>Volver a la Auditoría</span>
              <ArrowRight className="h-4 w-4 text-slate-600" />
            </button>
          )}
        </div>
      </div>

      {/* Featured: Tip del Día Interactivo */}
      <div className="mb-10 rounded-2xl border-2 border-slate-800 bg-slate-900 p-6 sm:p-8 text-white shadow-md relative overflow-hidden text-left">
        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-amber-500/10 blur-3xl" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-400/20 text-amber-400 border border-amber-400/40">
              <Lightbulb className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-extrabold uppercase tracking-widest text-amber-400">
                  TIP DESTACADO DEL DÍA
                </span>
                <span className="rounded bg-slate-800 border border-slate-700 px-2 py-0.5 font-mono text-[10px] text-slate-300">
                  {dailyTip.category}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">{dailyTip.authorTag}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={nextDailyTip}
              className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-mono font-bold text-slate-300 hover:bg-slate-700 transition-colors shadow-2xs"
            >
              Siguiente Tip
            </button>
            <button
              onClick={() => handleCopyTip(dailyTip)}
              className="studio-btn-metallic !py-1.5 !px-3.5 text-xs font-bold flex items-center gap-1.5"
            >
              {copiedTipId === dailyTip.id ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span>¡Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copiar</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          <h3 className="text-xl sm:text-2xl font-bold font-display text-white">
            {dailyTip.title}
          </h3>
          <p className="text-sm text-slate-300 leading-relaxed font-sans">
            {dailyTip.advice}
          </p>

          <div className="rounded-xl border border-slate-700 bg-slate-950 p-4">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-sky-400 uppercase tracking-wider mb-1">
              <Sparkles className="h-4 w-4" />
              <span>ACCIÓN INMEDIATA EN TU DAW:</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-200 font-mono leading-relaxed">
              {dailyTip.actionableStep}
            </p>
          </div>

          <p className="text-xs italic text-amber-200/80 font-sans">
            "{dailyTip.empatheticClosing}"
          </p>
        </div>
      </div>

      {/* Tabla Periódica de Frecuencias de Mezcla */}
      <div className="mb-10 rounded-2xl border-2 border-slate-300 bg-white p-6 sm:p-8 shadow-sm text-left">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-6">
          <div className="flex items-center gap-2 text-xs font-mono font-extrabold tracking-wider text-slate-900 uppercase">
            <Activity className="h-4 w-4 text-sky-600" />
            <span>TABLA DE FRECUENCIAS CRÍTICAS & RECETAS DE EQ</span>
          </div>
          <span className="font-mono text-[10px] text-slate-500 hidden sm:inline">
            Guía de bolsillo para FL Studio, Ableton y Logic Pro
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FREQUENCY_CHEAT_SHEET.map((band, idx) => (
            <div 
              key={idx}
              className={`rounded-xl border-2 p-4 flex flex-col justify-between transition-all hover:shadow-sm ${band.color}`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono text-xs font-black tracking-wide">
                    {band.range}
                  </span>
                  <span className="text-[10px] font-mono font-bold uppercase opacity-75">
                    Banda {idx + 1}
                  </span>
                </div>
                <h4 className="font-bold text-sm text-slate-900 font-display mb-2">
                  {band.band}
                </h4>
                <p className="text-xs text-slate-700 font-sans mb-3 leading-relaxed">
                  {band.character}
                </p>
              </div>

              <div className="rounded-lg bg-white/90 border border-slate-200/80 p-2.5 text-[11px] font-mono text-slate-800 leading-snug">
                <strong className="text-slate-900 block mb-0.5">Ajuste de Estudio:</strong>
                {band.rule}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-mono font-bold transition-all shrink-0 cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white border-2 border-slate-200 text-slate-700 hover:border-slate-400'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por técnica o Hz..."
            className="w-full rounded-xl border-2 border-slate-300 bg-white pl-9 pr-3 py-1.5 text-xs font-medium text-slate-800 focus:border-sky-500 focus:outline-hidden"
          />
        </div>
      </div>

      {/* All Tips Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
        {filteredTips.map((tip) => (
          <div 
            key={tip.id}
            className="rounded-2xl border-2 border-slate-300 bg-white p-6 shadow-sm flex flex-col justify-between hover:border-slate-400 transition-all"
          >
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                <span className={`rounded-md border px-2 py-0.5 font-mono text-[10px] font-bold ${tip.categoryColor}`}>
                  {tip.category}
                </span>
                <span className="font-mono text-[10px] text-slate-400">{tip.authorTag}</span>
              </div>

              <h4 className="text-base font-bold text-slate-900 font-display mb-2 leading-snug">
                {tip.title}
              </h4>

              <p className="text-xs text-slate-600 font-sans leading-relaxed mb-4">
                {tip.advice}
              </p>

              <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 mb-3">
                <span className="font-mono text-[10px] font-bold text-sky-700 uppercase block mb-1">
                  PARÁMETROS EXACTOS:
                </span>
                <p className="text-xs font-mono text-slate-800 leading-snug">
                  {tip.actionableStep}
                </p>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
              <p className="text-[11px] italic text-slate-500 font-sans pr-2">
                "{tip.empatheticClosing}"
              </p>
              <button
                onClick={() => handleCopyTip(tip)}
                className="rounded-lg border border-slate-200 bg-slate-100 p-2 text-slate-700 hover:bg-slate-200 transition-colors shrink-0"
                title="Copiar Tip"
              >
                {copiedTipId === tip.id ? (
                  <Check className="h-4 w-4 text-emerald-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
