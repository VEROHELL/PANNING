import React from 'react';
import { motion } from 'motion/react';
import { Activity, Palette, Lightbulb, Music2, Sparkles, Cpu, Radio, History } from 'lucide-react';
import { AppView } from '../types';

interface ViewTransitionLoaderProps {
  targetView: AppView;
}

export const ViewTransitionLoader: React.FC<ViewTransitionLoaderProps> = ({ targetView }) => {
  const getLoaderInfo = () => {
    switch (targetView) {
      case 'history':
        return {
          title: 'HISTORIAL DE ANÁLISIS & COMPARATIVA',
          step: 'Recuperando informes acústicos en memoria y buffers de audio...',
          accentColor: 'text-emerald-600',
          accentBg: 'bg-emerald-500',
          borderAccent: 'border-emerald-300',
          badgeText: 'MEMORIA DSP',
          icon: History,
          animationType: 'spark',
        };
      case 'cover-art':
        return {
          title: 'ESTUDIO DE PORTADAS & PROMPT IA',
          step: 'Sincronizando paletas cromáticas, proporciones 3000x3000px y motor generativo...',
          accentColor: 'text-indigo-600',
          accentBg: 'bg-indigo-500',
          borderAccent: 'border-indigo-300',
          badgeText: 'ARTE & ESTÉTICA',
          icon: Palette,
          animationType: 'canvas',
        };
      case 'tips-pro':
        return {
          title: 'TIPS DEL DÍA & GUÍA PRO DE PRODUCCIÓN',
          step: 'Cargando fórmulas psicoacústicas, tabla de frecuencias y secretos de estudio...',
          accentColor: 'text-amber-600',
          accentBg: 'bg-amber-500',
          borderAccent: 'border-amber-300',
          badgeText: 'SECRETOS AES',
          icon: Lightbulb,
          animationType: 'spark',
        };
      case 'audit':
      default:
        return {
          title: 'AUDITORÍA ACÚSTICA & TELEMETRÍA',
          step: 'Calibrando analizador FFT, semáforo EBU R128 y curva de retención viral...',
          accentColor: 'text-sky-600',
          accentBg: 'bg-sky-500',
          borderAccent: 'border-sky-300',
          badgeText: 'DSP ENGINE',
          icon: Activity,
          animationType: 'equalizer',
        };
    }
  };

  const info = getLoaderInfo();
  const IconComponent = info.icon;

  return (
    <div className="relative min-h-[420px] flex flex-col items-center justify-center rounded-2xl border-2 border-slate-300 bg-white/95 p-8 sm:p-12 shadow-sm marble-card overflow-hidden">
      
      {/* Background Decorative Tech Grid */}
      <div className="pointer-events-none absolute inset-0 opacity-15">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:24px_24px]" />
      </div>

      {/* Center Animated Visual Container */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-md w-full">
        
        {/* Animated Icon / Visualizer */}
        <div className="relative mb-6">
          
          {/* Pulsing Outer Rings */}
          <motion.div
            className={`absolute -inset-4 rounded-2xl border-2 ${info.borderAccent} opacity-40`}
            animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.1, 0.4] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
          />

          <motion.div
            className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-md border border-slate-700`}
            initial={{ scale: 0.8, rotate: -6 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <IconComponent className={`h-8 w-8 ${info.accentColor === 'text-sky-600' ? 'text-sky-400' : info.accentColor === 'text-indigo-600' ? 'text-indigo-400' : 'text-amber-400'}`} />
          </motion.div>
        </div>

        {/* Custom Mini Animations based on view */}
        {info.animationType === 'equalizer' && (
          <div className="flex items-end justify-center gap-1.5 h-10 mb-5">
            {[45, 80, 60, 95, 40, 85, 70, 100, 65, 90, 50].map((h, i) => (
              <motion.div
                key={i}
                className="w-1.5 rounded-full bg-sky-500"
                animate={{
                  height: [`${h * 0.3}%`, `${h}%`, `${h * 0.4}%`],
                  opacity: [0.6, 1, 0.7],
                }}
                transition={{
                  duration: 0.6 + (i % 3) * 0.2,
                  repeat: Infinity,
                  repeatType: 'reverse',
                  ease: 'easeInOut',
                  delay: i * 0.05,
                }}
              />
            ))}
          </div>
        )}

        {info.animationType === 'canvas' && (
          <div className="flex items-center justify-center gap-2 mb-5">
            {['bg-rose-500', 'bg-indigo-500', 'bg-sky-500', 'bg-amber-500', 'bg-emerald-500'].map((colorClass, i) => (
              <motion.div
                key={i}
                className={`h-5 w-5 rounded-md ${colorClass} shadow-xs`}
                animate={{
                  scale: [1, 1.25, 1],
                  rotate: [0, 10, 0],
                  y: [0, -4, 0],
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  delay: i * 0.12,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </div>
        )}

        {info.animationType === 'spark' && (
          <div className="flex items-center justify-center gap-2 mb-5">
            <motion.div
              className="flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-mono font-bold border border-amber-300"
              animate={{ opacity: [0.7, 1, 0.7], scale: [0.98, 1.02, 0.98] }}
              transition={{ duration: 0.9, repeat: Infinity }}
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span>SINTONIZANDO TRUCOS PRO</span>
            </motion.div>
          </div>
        )}

        {/* View Badge */}
        <div className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-700 border border-slate-300 mb-2">
          <span className="relative flex h-2 w-2">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${info.accentBg} opacity-75`} />
            <span className={`relative inline-flex rounded-full h-2 w-2 ${info.accentBg}`} />
          </span>
          {info.badgeText}
        </div>

        {/* Title */}
        <h3 className="text-base sm:text-lg font-black text-slate-900 font-display tracking-tight uppercase">
          {info.title}
        </h3>

        {/* Subtitle / Step description */}
        <p className="mt-2 text-xs text-slate-600 font-sans leading-relaxed">
          {info.step}
        </p>

        {/* Animated Progress Bar */}
        <div className="mt-5 w-full max-w-xs overflow-hidden rounded-full bg-slate-200 h-1.5 border border-slate-300">
          <motion.div
            className={`h-full ${info.accentBg}`}
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
          />
        </div>
      </div>
    </div>
  );
};
