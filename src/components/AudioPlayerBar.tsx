import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Smartphone, Headphones, Speaker, Car, Scissors, Music } from 'lucide-react';
import { formatTime } from '../utils/audioAnalyzer';

interface AudioPlayerBarProps {
  audioBuffer: AudioBuffer | null;
  trackName: string;
  durationSec: number;
  viralStartSec: number;
  viralEndSec: number;
  seekTime?: number | null;
  onTimeUpdate?: (currentTime: number) => void;
}

export type ListeningMode = 'studio' | 'phone' | 'airpods' | 'car';

export const AudioPlayerBar: React.FC<AudioPlayerBarProps> = ({
  audioBuffer,
  trackName,
  durationSec,
  viralStartSec,
  viralEndSec,
  seekTime,
  onTimeUpdate,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [listeningMode, setListeningMode] = useState<ListeningMode>('studio');
  const [isViralLoopActive, setIsViralLoopActive] = useState(false);

  const isPlayingRef = useRef(false);
  const isViralLoopRef = useRef(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const filterNodeRef = useRef<BiquadFilterNode | null>(null);
  const startTimeRef = useRef<number>(0);
  const pauseOffsetRef = useRef<number>(0);
  const animFrameRef = useRef<number | null>(null);

  // Calculate real 70 RMS values from audioBuffer for waveform
  const waveformBars = useMemo(() => {
    const NUM_BARS = 70;
    if (!audioBuffer) {
      return Array.from({ length: NUM_BARS }, () => 25);
    }
    try {
      const channelData = audioBuffer.getChannelData(0);
      const blockSize = Math.floor(channelData.length / NUM_BARS);
      if (blockSize <= 0) return Array.from({ length: NUM_BARS }, () => 25);

      const bars: number[] = [];
      for (let i = 0; i < NUM_BARS; i++) {
        const start = i * blockSize;
        let sumSquares = 0;
        const count = Math.min(blockSize, channelData.length - start);
        for (let j = 0; j < count; j++) {
          const sample = channelData[start + j];
          sumSquares += sample * sample;
        }
        const rms = Math.sqrt(sumSquares / count);
        // Normalize RMS to a height percentage between 15% and 92%
        const barHeight = Math.min(92, Math.max(15, Math.round(rms * 220 + 15)));
        bars.push(barHeight);
      }
      return bars;
    } catch (e) {
      return Array.from({ length: NUM_BARS }, () => 25);
    }
  }, [audioBuffer]);

  // Initialize or get AudioContext
  const getAudioContext = () => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioCtxRef.current = new AudioCtx();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  // Reset audio playback cleanly whenever a new audioBuffer or trackName arrives
  useEffect(() => {
    stopAudio();
    isPlayingRef.current = false;
    isViralLoopRef.current = false;
    setIsPlaying(false);
    setIsViralLoopActive(false);
    setCurrentTime(0);
    pauseOffsetRef.current = 0;
  }, [audioBuffer, trackName]);

  // Apply environment filters
  const applyListeningMode = (mode: ListeningMode) => {
    setListeningMode(mode);
    if (!filterNodeRef.current) return;
    const filter = filterNodeRef.current;

    if (mode === 'phone') {
      // Phone speaker: high pass around 350Hz, cut high treble
      filter.type = 'bandpass';
      filter.frequency.value = 1800;
      filter.Q.value = 0.8;
    } else if (mode === 'airpods') {
      // AirPods: slight bass boost, standard high fidelity
      filter.type = 'peaking';
      filter.frequency.value = 100;
      filter.gain.value = 2.5;
      filter.Q.value = 1.0;
    } else if (mode === 'car') {
      // Car stereo: heavy bass response, mid dip
      filter.type = 'lowshelf';
      filter.frequency.value = 120;
      filter.gain.value = 4.0;
    } else {
      // Flat studio monitors
      filter.type = 'allpass';
    }
  };

  const stopAudio = () => {
    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.stop();
        sourceNodeRef.current.disconnect();
      } catch (e) {
        // already stopped
      }
      sourceNodeRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }
  };

  const playAudio = (startOffset: number = 0) => {
    if (!audioBuffer) return;
    const ctx = getAudioContext();
    stopAudio();

    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;

    const gainNode = ctx.createGain();
    gainNode.gain.value = isMuted ? 0 : volume;
    gainNodeRef.current = gainNode;

    const filterNode = ctx.createBiquadFilter();
    filterNodeRef.current = filterNode;
    applyListeningMode(listeningMode);

    source.connect(filterNode);
    filterNode.connect(gainNode);
    gainNode.connect(ctx.destination);

    sourceNodeRef.current = source;
    const safeOffset = Math.max(0, Math.min(startOffset, audioBuffer.duration - 0.1));
    startTimeRef.current = ctx.currentTime - safeOffset;
    pauseOffsetRef.current = safeOffset;

    source.start(0, safeOffset);
    isPlayingRef.current = true;
    setIsPlaying(true);

    const updateLoop = () => {
      if (!audioCtxRef.current || !isPlayingRef.current) return;
      const elapsed = audioCtxRef.current.currentTime - startTimeRef.current;
      
      if (isViralLoopRef.current && elapsed >= viralEndSec) {
        // Loop viral hook snippet
        playAudio(viralStartSec);
        return;
      }

      if (elapsed >= (audioBuffer?.duration || durationSec)) {
        isPlayingRef.current = false;
        setIsPlaying(false);
        setCurrentTime(0);
        pauseOffsetRef.current = 0;
        return;
      }

      setCurrentTime(elapsed);
      onTimeUpdate?.(elapsed);
      animFrameRef.current = requestAnimationFrame(updateLoop);
    };

    animFrameRef.current = requestAnimationFrame(updateLoop);
  };

  const togglePlay = () => {
    if (isPlaying) {
      isPlayingRef.current = false;
      pauseOffsetRef.current = currentTime;
      stopAudio();
      setIsPlaying(false);
    } else {
      playAudio(pauseOffsetRef.current);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickPos = (e.clientX - rect.left) / rect.width;
    const targetTime = clickPos * (audioBuffer?.duration || durationSec);
    setCurrentTime(targetTime);
    pauseOffsetRef.current = targetTime;
    if (isPlaying) {
      playAudio(targetTime);
    }
  };

  // External seek trigger (e.g. from timeline)
  useEffect(() => {
    if (seekTime !== undefined && seekTime !== null) {
      setCurrentTime(seekTime);
      pauseOffsetRef.current = seekTime;
      playAudio(seekTime);
    }
  }, [seekTime]);

  // Volume change
  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);

  const totalDuration = audioBuffer?.duration || durationSec || 120;
  const progressPercent = (currentTime / totalDuration) * 100;
  const viralStartPercent = (viralStartSec / totalDuration) * 100;
  const viralWidthPercent = ((viralEndSec - viralStartSec) / totalDuration) * 100;

  return (
    <div className="sticky bottom-0 z-40 w-full border-t-2 border-slate-300 bg-white/95 px-4 py-3 shadow-lg backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-col gap-2.5 sm:gap-3">
        
        {/* Top Waveform / Scrub Bar */}
        <div className="flex items-center gap-3">
          <span className="w-10 font-mono text-xs font-bold text-slate-700 text-right">
            {formatTime(currentTime)}
          </span>

          <div
            onClick={handleSeek}
            className="group relative flex-1 h-7 cursor-pointer items-center flex rounded-lg bg-slate-900 px-1 border border-slate-700 overflow-hidden shadow-inner"
            title="Haz clic para avanzar o retroceder en la pista"
          >
            {/* Highlighted Viral Hook Region */}
            <div
              className="absolute h-full bg-sky-500/30 border-x-2 border-sky-400 z-10 pointer-events-none"
              style={{
                left: `${viralStartPercent}%`,
                width: `${viralWidthPercent}%`,
              }}
              title="Segmento Viral TikTok"
            >
              <span className="absolute top-0.5 left-1 text-[8px] font-mono font-black text-sky-300 uppercase tracking-wider">
                HOOK ZONE
              </span>
            </div>

            {/* Linear Waveform Bars calculated from real audioBuffer RMS */}
            <div className="flex h-full w-full items-center justify-between gap-[2px]">
              {waveformBars.map((barHeight, i) => {
                const isPassed = (i / 70) * 100 <= progressPercent;
                return (
                  <div
                    key={i}
                    className={`w-full rounded-xs transition-colors ${
                      isPassed ? 'bg-sky-400' : 'bg-slate-700 group-hover:bg-slate-600'
                    }`}
                    style={{ height: `${barHeight}%` }}
                  />
                );
              })}
            </div>

            {/* Progress Playhead Line */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-white shadow-xs z-20 pointer-events-none"
              style={{ left: `${progressPercent}%` }}
            />
          </div>

          <span className="w-10 font-mono text-xs font-bold text-slate-500">
            {formatTime(totalDuration)}
          </span>
        </div>

        {/* Bottom Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          
          {/* Left: Track Name & Play Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlay}
              className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-slate-700 bg-slate-900 text-white shadow-sm transition-transform hover:bg-slate-800 active:scale-95 cursor-pointer"
              title={isPlaying ? 'Pausar' : 'Reproducir'}
            >
              {isPlaying ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current ml-0.5 text-sky-400" />}
            </button>

            <button
              onClick={() => playAudio(0)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors shadow-2xs cursor-pointer"
              title="Reiniciar desde el inicio"
            >
              <RotateCcw className="h-4 w-4" />
            </button>

            <div className="hidden sm:flex flex-col">
              <span className="font-mono font-bold text-xs text-slate-900 truncate max-w-[180px]">
                {trackName}
              </span>
              <span className="text-[10px] font-mono text-slate-500 font-bold uppercase tracking-widest">
                {isPlaying ? '● AUDIO REPRODUCIÉNDOSE' : 'STANDBY'}
              </span>
            </div>
          </div>

          {/* Center: Viral Snippet Loop Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const nextState = !isViralLoopActive;
                isViralLoopRef.current = nextState;
                setIsViralLoopActive(nextState);
                if (nextState) {
                  playAudio(viralStartSec);
                }
              }}
              className={`flex items-center gap-1.5 rounded-xl border-2 px-3.5 py-1.5 text-xs font-mono font-bold tracking-wider uppercase transition-all shadow-2xs cursor-pointer ${
                isViralLoopActive
                  ? 'border-slate-800 bg-slate-900 text-white shadow-sm'
                  : 'border-slate-300 bg-slate-100 text-slate-800 hover:bg-slate-200'
              }`}
              title="Reproduce en bucle solo el gancho viral de 12 segundos"
            >
              <Scissors className="h-3.5 w-3.5 text-sky-400" />
              <span>LOOP CORTE VIRAL ({formatTime(viralStartSec)} - {formatTime(viralEndSec)})</span>
            </button>
          </div>

          {/* Right: Speaker Simulator & Volume Slider */}
          <div className="flex items-center gap-3">
            {/* Listening Modes */}
            <div className="hidden md:flex items-center gap-1 rounded-xl bg-slate-100 p-1 border-2 border-slate-300">
              <button
                onClick={() => applyListeningMode('studio')}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider font-bold transition-colors cursor-pointer ${
                  listeningMode === 'studio' ? 'bg-white text-slate-900 shadow-2xs border border-slate-300' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Monitores de Estudio (Respuesta Plana)"
              >
                <Speaker className="h-3 w-3" />
                <span>Estudio</span>
              </button>

              <button
                onClick={() => applyListeningMode('phone')}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider font-bold transition-colors cursor-pointer ${
                  listeningMode === 'phone' ? 'bg-white text-slate-900 shadow-2xs border border-slate-300' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Simular Altavoz de Smartphone (iPhone / Android)"
              >
                <Smartphone className="h-3 w-3" />
                <span>Móvil</span>
              </button>

              <button
                onClick={() => applyListeningMode('airpods')}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider font-bold transition-colors cursor-pointer ${
                  listeningMode === 'airpods' ? 'bg-white text-slate-900 shadow-2xs border border-slate-300' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Simular AirPods / Auriculares"
              >
                <Headphones className="h-3 w-3" />
                <span>AirPods</span>
              </button>

              <button
                onClick={() => applyListeningMode('car')}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider font-bold transition-colors cursor-pointer ${
                  listeningMode === 'car' ? 'bg-white text-slate-900 shadow-2xs border border-slate-300' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Simular Sistema de Auto (Car Test)"
              >
                <Car className="h-3 w-3" />
                <span>Auto</span>
              </button>
            </div>

            {/* Volume control */}
            <div className="flex items-center gap-1.5 font-mono text-xs text-slate-700 font-semibold">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
              >
                {isMuted || volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  setVolume(parseFloat(e.target.value));
                  setIsMuted(false);
                }}
                className="w-16 h-1.5 bg-slate-300 rounded-full appearance-none cursor-pointer accent-slate-800"
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
