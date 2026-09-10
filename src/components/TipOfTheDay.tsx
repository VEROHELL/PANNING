import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, Lightbulb, Copy, Check, Sliders, Music, Flame, Zap, ShieldCheck } from 'lucide-react';
import { PRO_STUDIO_TIPS, ProStudioTip } from '../data/proStudioTips';

interface TipOfTheDayProps {
  initialTipId?: string;
  className?: string;
}

export const TipOfTheDay: React.FC<TipOfTheDayProps> = ({ initialTipId, className = '' }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Initialize with random tip on each session / mount
  useEffect(() => {
    if (initialTipId) {
      const idx = PRO_STUDIO_TIPS.findIndex((t) => t.id === initialTipId);
      if (idx !== -1) {
        setCurrentIndex(idx);
        return;
      }
    }
    const randomIdx = Math.floor(Math.random() * PRO_STUDIO_TIPS.length);
    setCurrentIndex(randomIdx);
  }, [initialTipId]);

  const currentTip: ProStudioTip = PRO_STUDIO_TIPS[currentIndex] || PRO_STUDIO_TIPS[0];

  const handleNextTip = () => {
    setCurrentIndex((prev) => (prev + 1) % PRO_STUDIO_TIPS.length);
  };

  const handleCopy = () => {
    const textToCopy = `💡 [Tip Pro del Productor - ${currentTip.category}]: ${currentTip.title}\n\n📌 Diagnóstico: ${currentTip.advice}\n\n🎛️ Acción Inmediata: ${currentTip.actionableStep}\n\n✨ Reflexión: "${currentTip.empatheticClosing}"\n— ${currentTip.authorTag}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Mezcla':
        return Sliders;
      case 'Mastering':
        return ShieldCheck;
      case 'Viralidad':
        return Flame;
      case 'Armonía':
        return Music;
      case 'Psicoacústica':
      default:
        return Zap;
    }
  };

  const CategoryIcon = getCategoryIcon(currentTip.category);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative overflow-hidden rounded-xl border-2 border-slate-300 bg-gradient-to-r from-white via-slate-50 to-slate-100 p-4 sm:p-5 shadow-sm marble-card transition-all duration-300 ${className}`}
    >
      {/* Top Metallic Micro-Accent Line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-500 via-amber-400 to-indigo-600 opacity-80" />

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        {/* Left: Icon & Badge */}
        <div className="flex items-start gap-3.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-300 bg-slate-900 text-amber-300 shadow-md">
            <Lightbulb className="h-5 w-5 animate-pulse" />
          </div>

          <div className="space-y-1.5 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-mono font-extrabold uppercase tracking-wider border shadow-2xs ${currentTip.categoryColor}">
                <CategoryIcon className="h-3 w-3" />
                TIP DEL PRODUCTOR // {currentTip.category}
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                {currentTip.authorTag}
              </span>
            </div>

            <h4 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight font-display">
              {currentTip.title}
            </h4>

            <p className="text-xs text-slate-700 leading-relaxed font-sans">
              {currentTip.advice}
            </p>

            {/* Actionable Blueprint Box */}
            <div className="mt-2 rounded-lg border border-slate-200 bg-white/90 p-2.5 shadow-2xs">
              <div className="flex items-start gap-2">
                <span className="text-[10px] font-mono font-bold text-sky-700 uppercase shrink-0 mt-0.5 flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-sky-600" />
                  ACCIÓN:
                </span>
                <p className="text-xs font-mono font-medium text-slate-800 leading-relaxed">
                  {currentTip.actionableStep}
                </p>
              </div>
            </div>

            {/* Empathetic Closing Reminder */}
            <p className="text-[11px] italic text-slate-600 font-sans pt-1 flex items-center gap-1.5">
              <span className="text-amber-600 font-bold">✨</span>
              "{currentTip.empatheticClosing}"
            </p>
          </div>
        </div>

        {/* Right: Actions Bar (Next Tip & Copy) */}
        <div className="flex md:flex-col items-center justify-between md:justify-start gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-200">
          <button
            onClick={handleNextTip}
            title="Ver otro consejo profesional"
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-800 shadow-2xs hover:bg-slate-100 hover:border-slate-400 active:scale-95 transition-all"
          >
            <span>Siguiente Consejo</span>
            <ArrowRight className="h-3.5 w-3.5 text-slate-600" />
          </button>

          <button
            onClick={handleCopy}
            title="Copiar tip para tus notas"
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 active:scale-95 transition-all"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-600" />
                <span className="text-[11px] font-bold text-emerald-700">¡Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 text-slate-500" />
                <span className="text-[11px]">Copiar Tip</span>
              </>
            )}
          </button>

          <span className="text-[9px] font-mono text-slate-400 text-center hidden md:block pt-1">
            {currentIndex + 1} de {PRO_STUDIO_TIPS.length}
          </span>
        </div>
      </div>
    </div>
  );
};
