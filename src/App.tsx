import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Header } from './components/Header';
import { NavigationTabs } from './components/NavigationTabs';
import { UploadHero } from './components/UploadHero';
import { ScorePanel } from './components/ScorePanel';
import { IndustryTrafficLight } from './components/IndustryTrafficLight';
import { FrequencySpectrum } from './components/FrequencySpectrum';
import { TimelineRoadmap } from './components/TimelineRoadmap';
import { ProducerComment } from './components/ProducerComment';
import { AudioPlayerBar } from './components/AudioPlayerBar';
import { EqExportModal } from './components/EqExportModal';
import { ProCertificateModal } from './components/ProCertificateModal';
import { StudioAssistantChat } from './components/StudioAssistantChat';
import { CoverArtStudio } from './components/CoverArtStudio';
import { TipsAcademy } from './components/TipsAcademy';
import { HistoryView } from './components/HistoryView';
import { ViewTransitionLoader } from './components/ViewTransitionLoader';
import { AnalysisReport, AppView, TrackHistoryItem } from './types';
import { analyzeAudioBuffer } from './utils/audioAnalyzer';
import { exportReportToPDF } from './utils/pdfExport';
import { DEMO_TRACKS, DemoTrackItem, createSyntheticDemoAudioBuffer } from './data/demoTracks';
import { MessageSquareCode, FileDown, Sparkles, Activity, Palette, Lightbulb, AlertTriangle, History } from 'lucide-react';

let sharedDecodeCtx: AudioContext | null = null;
function getDecodeCtx(): AudioContext {
  if (!sharedDecodeCtx || sharedDecodeCtx.state === 'closed') {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    sharedDecodeCtx = new AudioCtx();
  }
  if (sharedDecodeCtx.state === 'suspended') {
    sharedDecodeCtx.resume();
  }
  return sharedDecodeCtx;
}

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('audit');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionTargetView, setTransitionTargetView] = useState<AppView>('audit');
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState('');
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [isEqModalOpen, setIsEqModalOpen] = useState(false);
  const [isProModalOpen, setIsProModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [seekTime, setSeekTime] = useState<number | null>(null);
  const [currentAudioTime, setCurrentAudioTime] = useState(0);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [history, setHistory] = useState<TrackHistoryItem[]>([]);

  // Helper to maintain the last 3 processed reports in state
  const saveToHistory = useCallback((newReport: AnalysisReport, buffer: AudioBuffer | null) => {
    setHistory((prev) => {
      const filtered = prev.filter(
        (item) => item.report.metadata.fileName !== newReport.metadata.fileName
      );
      const now = new Date();
      const savedAt = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const newItem: TrackHistoryItem = {
        id: `hist-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        report: newReport,
        audioBuffer: buffer,
        savedAt,
      };
      return [newItem, ...filtered].slice(0, 3);
    });
  }, []);

  // Process uploaded audio file cleanly (resets previous track state immediately)
  const handleFileSelected = useCallback(async (file: File) => {
    // Cleanly wipe any old state first
    setReport(null);
    setAudioBuffer(null);
    setSeekTime(null);
    setCurrentAudioTime(0);

    setIsAnalyzing(true);
    setAnalysisProgress(10);
    setAnalysisStep('1. Decodificando archivo de audio y transientes...');

    try {
      const arrayBuffer = await file.arrayBuffer();
      const audioCtx = getDecodeCtx();

      setAnalysisProgress(35);
      setAnalysisStep('2. Calculando espectro de frecuencias FFT y rango dinámico...');
      await new Promise((r) => setTimeout(r, 400));

      const decodedBuffer = await audioCtx.decodeAudioData(arrayBuffer);
      setAudioBuffer(decodedBuffer);

      setAnalysisProgress(65);
      setAnalysisStep('3. Midiendo sonoridad EBU R128 (-9 LUFS) y fuerza del gancho...');
      await new Promise((r) => setTimeout(r, 450));

      setAnalysisProgress(88);
      setAnalysisStep('4. Evaluando retención algorítmica para TikTok y Spotify...');
      await new Promise((r) => setTimeout(r, 350));

      const analysisResult = analyzeAudioBuffer(decodedBuffer, file.name);
      setReport(analysisResult);
      saveToHistory(analysisResult, decodedBuffer);
      setAnalysisProgress(100);
      setIsAnalyzing(false);
      setCurrentView('audit');

      // Asynchronously enrich with specialized human producer review from Gemini if available
      enrichWithProducerVerdict(analysisResult);
    } catch (err) {
      console.error('Error analyzing audio:', err);
      setIsAnalyzing(false);
      const msg = 'Hubo un problema al decodificar este archivo de audio. Por favor intenta con otro archivo MP3, WAV o M4A.';
      setErrorNotice(msg);
      setTimeout(() => {
        setErrorNotice((prev) => (prev === msg ? null : prev));
      }, 4500);
    }
  }, [saveToHistory]);

  // Enrich with specialized human producer review
  const enrichWithProducerVerdict = async (baseReport: AnalysisReport) => {
    try {
      const res = await fetch('/api/producer-verdict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ report: baseReport }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.quote) {
          const enrichReportData = (prevReport: AnalysisReport): AnalysisReport => ({
            ...prevReport,
            producerComment: {
              ...prevReport.producerComment,
              name: data.engineerName || prevReport.producerComment.name,
              role: data.engineerRole || prevReport.producerComment.role,
              quote: data.quote || prevReport.producerComment.quote,
              priorityAction: data.priorityAction || prevReport.producerComment.priorityAction,
            },
            audience: {
              ...prevReport.audience,
              targetDemographic: data.targetDemographic || prevReport.audience.targetDemographic,
              recommendedPlaylists: Array.isArray(data.recommendedPlaylists) && data.recommendedPlaylists.length > 0 
                ? data.recommendedPlaylists 
                : prevReport.audience.recommendedPlaylists,
            }
          });

          setReport((prev) => {
            if (!prev) return prev;
            return enrichReportData(prev);
          });

          setHistory((prevHist) =>
            prevHist.map((item) => {
              if (item.report.metadata.fileName === baseReport.metadata.fileName) {
                return {
                  ...item,
                  report: enrichReportData(item.report),
                };
              }
              return item;
            })
          );
        }
      }
    } catch (e) {
      console.debug('Using local acoustic engine verdict');
    }
  };

  // Process built-in demo track cleanly
  const handleDemoSelected = useCallback(async (demo: DemoTrackItem) => {
    // Cleanly wipe any old state first
    setReport(null);
    setAudioBuffer(null);
    setSeekTime(null);
    setCurrentAudioTime(0);

    setIsAnalyzing(true);
    setAnalysisProgress(15);
    setAnalysisStep(`Cargando maqueta de prueba: ${demo.name}...`);

    try {
      const audioCtx = getDecodeCtx();

      setAnalysisProgress(40);
      setAnalysisStep('Generando buffer acústico y midiendo choques de fase...');
      await new Promise((r) => setTimeout(r, 400));

      const synthBuffer = createSyntheticDemoAudioBuffer(audioCtx, demo.id);
      setAudioBuffer(synthBuffer);

      setAnalysisProgress(75);
      setAnalysisStep('Calculando métricas comerciales y semáforo de industria...');
      await new Promise((r) => setTimeout(r, 450));

      setAnalysisProgress(95);
      setAnalysisStep('Generando hoja de ruta con marcas de tiempo...');
      await new Promise((r) => setTimeout(r, 300));

      const analysisResult = analyzeAudioBuffer(synthBuffer, `${demo.name} (${demo.genre})`);
      setReport(analysisResult);
      saveToHistory(analysisResult, synthBuffer);
      setAnalysisProgress(100);
      setIsAnalyzing(false);
      setCurrentView('audit');

      // Asynchronously enrich with specialized human producer review from Gemini
      enrichWithProducerVerdict(analysisResult);
    } catch (err) {
      console.error('Error generating demo analysis:', err);
      setIsAnalyzing(false);
    }
  }, [saveToHistory]);

  const initializedRef = useRef(false);

  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      handleDemoSelected(DEMO_TRACKS[0]);
    }
  }, [handleDemoSelected]);

  const handleReset = () => {
    setReport(null);
    setAudioBuffer(null);
    setSeekTime(null);
    setCurrentAudioTime(0);
    setIsChatOpen(false);
    setIsTransitioning(false);
    setCurrentView('audit');
  };

  const switchViewWithTransition = useCallback((newView: AppView) => {
    if (newView === 'assistant') {
      setIsChatOpen(true);
      return;
    }
    if (newView === currentView) return;

    setTransitionTargetView(newView);
    setIsTransitioning(true);

    const timer = setTimeout(() => {
      setCurrentView(newView);
      setIsTransitioning(false);
    }, 380);

    return () => clearTimeout(timer);
  }, [currentView]);

  const handleSeekFromTimeline = (seconds: number) => {
    setSeekTime(seconds);
    setTimeout(() => setSeekTime(null), 100);
  };

  const handleExportPDF = (targetReport?: AnalysisReport) => {
    const reportToExport = targetReport || report;
    if (reportToExport) {
      exportReportToPDF(reportToExport);
    }
  };

  const handleSelectFromHistory = useCallback((item: TrackHistoryItem) => {
    setReport(item.report);
    setAudioBuffer(item.audioBuffer);
    setSeekTime(null);
    setCurrentAudioTime(0);
    switchViewWithTransition('audit');
  }, [switchViewWithTransition]);

  const handleClearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  const handleTabSelected = (view: AppView) => {
    switchViewWithTransition(view);
  };

  return (
    <div className="relative min-h-screen ar-infinite-wallpaper text-slate-900 selection:bg-slate-900 selection:text-white border-[4px] sm:border-[8px] md:border-[10px] border-[#CBD5E1] flex flex-col justify-between">
      
      {/* Floating Error Toast Notification */}
      {errorNotice && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-2xl bg-rose-950/95 border-2 border-rose-500/80 px-5 py-3 text-white shadow-2xl animate-fade-in backdrop-blur-md max-w-lg">
          <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0 animate-pulse" />
          <span className="text-xs font-mono text-rose-100 flex-1">
            {errorNotice}
          </span>
          <button
            onClick={() => setErrorNotice(null)}
            className="text-rose-400 hover:text-white p-1 rounded-md transition-colors cursor-pointer text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* Structural Crosshair Coordinates Axes */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        {/* Central Vertical Axis */}
        <div className="absolute top-0 left-1/2 w-px h-full bg-slate-900/[0.04]" />
        {/* Central Horizontal Axis */}
        <div className="absolute top-1/2 left-0 w-full h-px bg-slate-900/[0.04]" />
        {/* Secondary Vertical Quarters */}
        <div className="hidden lg:block absolute top-0 left-1/4 w-px h-full bg-slate-900/[0.03]" />
        <div className="hidden lg:block absolute top-0 left-3/4 w-px h-full bg-slate-900/[0.03]" />
        {/* Geometric Crosshair Light Pattern */}
        <div className="absolute inset-0 geo-crosshair-light opacity-30" />
      </div>

      {/* Frame Corner Accents (Metallic Matte Accents) */}
      <div className="pointer-events-none fixed top-2 left-2 sm:top-4 sm:left-4 z-50 w-4 h-4 border-t-2 border-l-2 border-slate-700" />
      <div className="pointer-events-none fixed top-2 right-2 sm:top-4 sm:right-4 z-50 w-4 h-4 border-t-2 border-r-2 border-slate-700" />
      <div className="pointer-events-none fixed bottom-2 left-2 sm:bottom-4 sm:left-4 z-50 w-4 h-4 border-b-2 border-l-2 border-slate-700" />
      <div className="pointer-events-none fixed bottom-2 right-2 sm:bottom-4 sm:right-4 z-50 w-4 h-4 border-b-2 border-r-2 border-slate-700" />

      {/* Main App Navigation Header */}
      <Header
        metadata={report?.metadata}
        onReset={handleReset}
        onOpenChat={() => setIsChatOpen(true)}
        onExportPDF={() => handleExportPDF()}
        isScanned={!!report}
      />

      {/* Persistent Multi-View Navigation Bar */}
      <NavigationTabs
        currentView={currentView}
        onSelectView={handleTabSelected}
        hasTrackLoaded={!!report}
        historyCount={history.length}
      />

      {/* Main Content Area */}
      <main className="relative z-10 mx-auto w-full max-w-7xl px-3 py-5 sm:px-6 sm:py-8 lg:px-8 pb-36 min-h-[550px]">
        
        <AnimatePresence mode="wait">
          {isTransitioning ? (
            <motion.div
              key={`loader-${transitionTargetView}`}
              initial={{ opacity: 0, y: 10, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.99 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
            >
              <ViewTransitionLoader targetView={transitionTargetView} />
            </motion.div>
          ) : (
            <motion.div
              key={`view-${currentView}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.24, ease: 'easeOut' }}
            >
              {/* VIEW 1: AUDITORÍA ACÚSTICA */}
              {currentView === 'audit' && (
                <>
                  {!report ? (
                    <div className="space-y-6">
                      <UploadHero
                        onFileSelected={handleFileSelected}
                        onDemoSelected={handleDemoSelected}
                        isAnalyzing={isAnalyzing}
                        analysisStep={analysisStep}
                        analysisProgress={analysisProgress}
                      />
                    </div>
                  ) : (
                    /* Full Detailed Studio Report */
                    <div className="space-y-8 sm:space-y-10 animate-fadeIn">
                      
                      {/* Top Identity & Track Data Bar (Geometric Telemetry Frame) */}
                      <div className="relative rounded-xl border-2 border-slate-300 bg-white/95 px-6 py-4 shadow-sm marble-card">
                        <div className="flex flex-wrap items-center justify-between gap-4 text-xs">
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-mono tracking-[0.25em] text-slate-500 font-extrabold uppercase">
                              FILE // AUDIO_TARGET
                            </span>
                            <span className="h-3 w-px bg-slate-300" />
                            <span className="font-extrabold text-slate-900 text-sm sm:text-base tracking-tight truncate max-w-[260px] sm:max-w-md font-display neon-title-glow">
                              {report.metadata.fileName}
                            </span>
                          </div>

                          <div className="flex items-center gap-5 text-xs font-mono text-slate-600 font-semibold">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">GÉNERO:</span>
                              <strong className="text-slate-900 tracking-wide font-bold">{report.metadata.detectedGenre}</strong>
                            </div>
                            <span className="text-slate-300">•</span>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">FECHA:</span>
                              <strong className="text-slate-900 tracking-wide">{report.metadata.scannedAt}</strong>
                            </div>
                            <span className="text-slate-300">•</span>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">DURACIÓN:</span>
                              <strong className="text-slate-900 tracking-wide font-bold">{Math.floor(report.metadata.duration / 60)}:{Math.floor(report.metadata.duration % 60).toString().padStart(2, '0')}</strong>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Quick Switch to History, Cover Art or Tips CTA banner */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <button
                          onClick={() => switchViewWithTransition('history')}
                          className="flex items-center justify-between rounded-xl border-2 border-slate-300 bg-white p-4 text-left shadow-2xs hover:border-slate-800 hover:shadow-xs transition-all cursor-pointer group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200 group-hover:scale-105 transition-transform">
                              <History className="h-5 w-5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-xs font-mono text-slate-900 uppercase">
                                  Historial
                                </h4>
                                <span className="rounded bg-emerald-100 px-1.5 py-0.2 text-[9px] font-mono font-bold text-emerald-800">
                                  {history.length}/3
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 font-sans">
                                Cambiar de track o comparar mediciones.
                              </p>
                            </div>
                          </div>
                          <span className="text-xs font-mono font-bold text-emerald-600 group-hover:translate-x-1 transition-transform">→</span>
                        </button>

                        <button
                          onClick={() => switchViewWithTransition('cover-art')}
                          className="flex items-center justify-between rounded-xl border-2 border-slate-300 bg-white p-4 text-left shadow-2xs hover:border-slate-800 hover:shadow-xs transition-all cursor-pointer group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-50 text-sky-600 border border-sky-200 group-hover:scale-105 transition-transform">
                              <Palette className="h-5 w-5" />
                            </div>
                            <div>
                              <h4 className="font-bold text-xs font-mono text-slate-900 uppercase">
                                Crear Portada & Prompt IA
                              </h4>
                              <p className="text-[11px] text-slate-500 font-sans">
                                Medidas 3000x3000px y prompts.
                              </p>
                            </div>
                          </div>
                          <span className="text-xs font-mono font-bold text-sky-600 group-hover:translate-x-1 transition-transform">→</span>
                        </button>

                        <button
                          onClick={() => switchViewWithTransition('tips-pro')}
                          className="flex items-center justify-between rounded-xl border-2 border-slate-300 bg-white p-4 text-left shadow-2xs hover:border-slate-800 hover:shadow-xs transition-all cursor-pointer group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600 border border-amber-200 group-hover:scale-105 transition-transform">
                              <Lightbulb className="h-5 w-5" />
                            </div>
                            <div>
                              <h4 className="font-bold text-xs font-mono text-slate-900 uppercase">
                                Tips del Día & Secretos Pro
                              </h4>
                              <p className="text-[11px] text-slate-500 font-sans">
                                Tabla frecuencias y fórmulas.
                              </p>
                            </div>
                          </div>
                          <span className="text-xs font-mono font-bold text-amber-600 group-hover:translate-x-1 transition-transform">→</span>
                        </button>
                      </div>

                      {/* PANEL CENTRAL: EL PUNTAJE DE ÉXITO */}
                      <ScorePanel 
                        report={report} 
                        onOpenChat={() => setIsChatOpen(true)}
                        onSeekAudio={handleSeekFromTimeline}
                        currentAudioTime={currentAudioTime}
                      />

                      {/* SECCIÓN 1: EL SEMÁFORO DE LA INDUSTRIA */}
                      <IndustryTrafficLight 
                        report={report} 
                        onOpenChat={() => setIsChatOpen(true)}
                      />

                      {/* SECCIÓN 2: ESCANEO DE FRECUENCIAS INTERACTIVO */}
                      <FrequencySpectrum
                        report={report}
                        onOpenEqModal={() => setIsEqModalOpen(true)}
                        onOpenChat={() => setIsChatOpen(true)}
                      />

                      {/* SECCIÓN 3: HOJA DE RUTA TÉCNICA (FEEDBACK CON MARCAS DE TIEMPO) */}
                      <TimelineRoadmap
                        report={report}
                        onSeekAudio={handleSeekFromTimeline}
                        currentAudioTime={currentAudioTime}
                      />

                      {/* SECCIÓN 4: COMENTARIO DEL PRODUCTOR */}
                      <ProducerComment 
                        report={report} 
                        onOpenChat={() => setIsChatOpen(true)}
                      />
                    </div>
                  )}
                </>
              )}

              {/* VIEW 2: HISTORIAL DE REPORTES */}
              {currentView === 'history' && (
                <HistoryView
                  history={history}
                  currentReport={report}
                  onSelectTrack={handleSelectFromHistory}
                  onClearHistory={handleClearHistory}
                  onNavigateToAudit={() => switchViewWithTransition('audit')}
                  onNavigateToCoverArt={() => switchViewWithTransition('cover-art')}
                  onOpenChat={() => setIsChatOpen(true)}
                  onExportPDF={handleExportPDF}
                />
              )}

              {/* VIEW 3: ESTUDIO DE PORTADAS & PROMPT GENERATOR */}
              {currentView === 'cover-art' && (
                <CoverArtStudio 
                  report={report} 
                  onNavigateToAudit={() => switchViewWithTransition('audit')}
                />
              )}

              {/* VIEW 4: TIPS DEL DÍA & GUÍA PRO */}
              {currentView === 'tips-pro' && (
                <TipsAcademy 
                  report={report} 
                  onNavigateToAudit={() => switchViewWithTransition('audit')}
                  onOpenChatWithTopic={(topic) => setIsChatOpen(true)}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>

      </main>

      {/* Telemetry Footer Bar */}
      <footer className="relative z-10 w-full px-6 sm:px-12 py-4 border-t-2 border-slate-300 bg-white/95 text-slate-700">
        <div className="mx-auto max-w-7xl grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
          <div className="flex flex-col space-y-1">
            <span className="text-[9px] uppercase tracking-[0.3em] text-slate-400 font-mono font-bold">SISTEMA</span>
            <span className="text-xs font-mono tracking-tight text-slate-900 font-semibold">PANNING by Armored Bass</span>
          </div>
          <div className="flex flex-col space-y-1">
            <span className="text-[9px] uppercase tracking-[0.3em] text-slate-400 font-mono font-bold">ESTADO DEL MOTOR</span>
            <span className="text-xs font-mono tracking-tight text-emerald-600 font-bold">ACTIVO // MULTI-SUITE</span>
          </div>
          <div className="flex flex-col space-y-1">
            <span className="text-[9px] uppercase tracking-[0.3em] text-slate-400 font-mono font-bold">NORMATIVA</span>
            <span className="text-xs font-mono tracking-tight text-slate-900 font-semibold">EBU_R128 · -9 LUFS DSP</span>
          </div>
          <div className="flex flex-col space-y-1 sm:text-right">
            <span className="text-[9px] uppercase tracking-[0.3em] text-slate-400 font-mono font-bold">TEMA</span>
            <span className="text-xs font-mono tracking-tight text-slate-700 font-bold">METALLIC_MARBLE</span>
          </div>
        </div>
      </footer>

      {/* Floating Action Button for PRO Certificate (When report is active) */}
      {report && (
        <button
          onClick={() => setIsProModalOpen(true)}
          className="fixed bottom-36 right-5 z-40 flex items-center gap-2 rounded-xl border-2 border-amber-400/90 bg-gradient-to-r from-amber-500 to-yellow-500 px-4 py-2.5 text-xs font-bold text-slate-950 shadow-2xl transition-transform hover:scale-105 hover:from-amber-400 hover:to-yellow-400 cursor-pointer font-display"
          title="Abrir Certificado de Masterización DropCheck PRO"
        >
          <Sparkles className="h-4 w-4 text-slate-950 animate-pulse" />
          <span className="hidden sm:inline">Certificado PRO</span>
        </button>
      )}

      {/* Floating Action Button for Mini Chat (When report is active) */}
      {report && !isChatOpen && (
        <button
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-20 right-5 z-40 studio-btn-metallic text-xs !py-3 !px-5 shadow-2xl animate-bounce cursor-pointer"
          title="Abrir Asistente: ¿Cómo hago esto?"
        >
          <MessageSquareCode className="h-5 w-5 mr-2 text-sky-400" />
          <span className="hidden sm:inline">¿Cómo hago esto? (Chat)</span>
        </button>
      )}

      {/* Sticky Bottom Audio Player Bar - Always active when track is loaded */}
      {report && (
        <AudioPlayerBar
          audioBuffer={audioBuffer}
          trackName={report.metadata.fileName}
          durationSec={report.metadata.duration}
          viralStartSec={report.audience.bestTikTokCut.startSec}
          viralEndSec={report.audience.bestTikTokCut.endSec}
          seekTime={seekTime}
          onTimeUpdate={(t) => setCurrentAudioTime(t)}
        />
      )}

      {/* EQ Preset Export Modal */}
      {report && (
        <EqExportModal
          isOpen={isEqModalOpen}
          onClose={() => setIsEqModalOpen(false)}
          frequencyAlerts={report.frequencyAlerts}
          trackName={report.metadata.fileName}
        />
      )}

      {/* DropCheck PRO Certificate Modal */}
      {report && (
        <ProCertificateModal
          isOpen={isProModalOpen}
          onClose={() => setIsProModalOpen(false)}
          report={report}
        />
      )}

      {/* Mini Chat Assistant: ¿Cómo hago esto? */}
      {report && (
        <StudioAssistantChat
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          report={report}
        />
      )}
    </div>
  );
}
