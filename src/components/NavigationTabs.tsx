import React from 'react';
import { motion } from 'motion/react';
import { Sliders, Palette, Lightbulb, MessageSquareCode, History } from 'lucide-react';
import { AppView } from '../types';

interface NavigationTabsProps {
  currentView: AppView;
  onSelectView: (view: AppView) => void;
  hasTrackLoaded: boolean;
  historyCount?: number;
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({
  currentView,
  onSelectView,
  hasTrackLoaded,
  historyCount = 0,
}) => {
  const tabs: { id: AppView; label: string; icon: React.FC<{ className?: string }>; badge?: string }[] = [
    {
      id: 'audit',
      label: 'Auditoría Acústica',
      icon: Sliders,
      badge: hasTrackLoaded ? 'DSP ACTIVO' : undefined,
    },
    {
      id: 'history',
      label: 'Historial',
      icon: History,
      badge: historyCount > 0 ? `${historyCount}/3` : undefined,
    },
    {
      id: 'cover-art',
      label: 'Estudio de Portadas',
      icon: Palette,
      badge: 'PROMPT IA',
    },
    {
      id: 'tips-pro',
      label: 'Tips del Día & Pro',
      icon: Lightbulb,
    },
    {
      id: 'assistant',
      label: 'Asistente IA de Estudio',
      icon: MessageSquareCode,
      badge: 'AES',
    },
  ];

  return (
    <nav className="w-full border-b border-slate-300 bg-slate-100/90 backdrop-blur-xs sticky top-[69px] sm:top-[77px] z-30 shadow-2xs">
      <div className="mx-auto flex max-w-7xl items-center justify-start sm:justify-center gap-2 overflow-x-auto px-4 py-2 sm:px-6">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentView === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onSelectView(tab.id)}
              className={`relative flex items-center gap-2 rounded-xl px-3.5 py-2 font-mono text-xs font-bold transition-colors shrink-0 cursor-pointer ${
                isActive
                  ? 'text-white'
                  : 'text-slate-700 hover:text-slate-900 bg-white/80 border border-slate-200/80 hover:bg-white shadow-2xs'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTabPill"
                  className="absolute inset-0 rounded-xl bg-slate-900 shadow-xs"
                  transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                <Icon className={`h-4 w-4 ${isActive ? 'text-sky-400' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`rounded px-1.5 py-0.5 text-[9px] font-mono font-extrabold uppercase ${
                      isActive
                        ? 'bg-sky-500 text-slate-950'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
