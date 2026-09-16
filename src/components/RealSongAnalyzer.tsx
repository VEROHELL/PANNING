import React, { useState, useRef, useEffect } from 'react';
import { 
  Headphones, 
  Upload, 
  Play, 
  Pause, 
  Sparkles, 
  Flame, 
  Palette, 
  Video, 
  TrendingUp, 
  Music, 
  ShieldCheck, 
  ExternalLink,
  Volume2,
  Clock,
  Activity,
  Layers
} from 'lucide-react';

export interface RealAnalysisData {
  duration: number;
  bpm: number;
  meanCentroid: number;
  meanRms: number;
  dynamicRange: number;
  hookStartSec: number;
  hookSeconds: number;
  sampleRate: number;
  filename: string;
}

interface RealSongAnalyzerProps {
  loadedAudioBuffer?: AudioBuffer | null;
  loadedFileName?: string;
  onAuditInDropCheck?: (file: File) => void;
}

// ---------- Real iterative FFT (Cooley-Tukey, radix-2) ----------
function fft(re: Float32Array, im: Float32Array) {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) {
      const tr = re[i]; re[i] = re[j]; re[j] = tr;
      const ti = im[i]; im[i] = im[j]; im[j] = ti;
    }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const ang = (-2 * Math.PI) / len;
    const wr = Math.cos(ang);
    const wi = Math.sin(ang);
    for (let i = 0; i < n; i += len) {
      let curWr = 1;
      let curWi = 0;
      const half = len >> 1;
      for (let j = 0; j < half; j++) {
        const ur = re[i + j];
        const ui = im[i + j];
        const vr = re[i + j + half] * curWr - im[i + j + half] * curWi;
        const vi = re[i + j + half] * curWi + im[i + j + half] * curWr;
        re[i + j] = ur + vr;
        im[i + j] = ui + vi;
        re[i + j + half] = ur - vr;
        im[i + j + half] = ui - vi;
        const nWr = curWr * wr - curWi * wi;
        const nWi = curWr * wi + curWi * wr;
        curWr = nWr;
        curWi = nWi;
      }
    }
  }
}

// ---------- Real audio analysis on the decoded PCM ----------
function analyzeAudio(audioBuffer: AudioBuffer, onProgress?: (p: number) => void): Omit<RealAnalysisData, 'filename'> {
  const sampleRate = audioBuffer.sampleRate;
  const duration = audioBuffer.duration;
  const numCh = audioBuffer.numberOfChannels;
  const length = audioBuffer.length;

  const mono = new Float32Array(length);
  for (let ch = 0; ch < numCh; ch++) {
    const data = audioBuffer.getChannelData(ch);
    for (let i = 0; i < length; i++) mono[i] += data[i] / numCh;
  }

  const windowSize = 2048;
  const hop = 2048;
  const numFrames = Math.max(1, Math.floor((length - windowSize) / hop) + 1);
  const rms = new Float32Array(numFrames);
  const centroid = new Float32Array(numFrames);

  const hann = new Float32Array(windowSize);
  for (let i = 0; i < windowSize; i++) hann[i] = 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (windowSize - 1));

  const re = new Float32Array(windowSize);
  const im = new Float32Array(windowSize);
  const half = windowSize / 2;

  for (let f = 0; f < numFrames; f++) {
    const start = f * hop;
    let sumSq = 0;
    for (let i = 0; i < windowSize; i++) {
      const s = (mono[start + i] || 0) * hann[i];
      re[i] = s;
      im[i] = 0;
      sumSq += s * s;
    }
    rms[f] = Math.sqrt(sumSq / windowSize);
    fft(re, im);
    let num = 0;
    let den = 0;
    for (let k = 1; k < half; k++) {
      const mag = Math.sqrt(re[k] * re[k] + im[k] * im[k]);
      const freq = (k * sampleRate) / windowSize;
      num += freq * mag;
      den += mag;
    }
    centroid[f] = den > 0 ? num / den : 0;
    if (onProgress && f % 200 === 0) onProgress(f / numFrames);
  }

  // Onset envelope (positive energy rises) for tempo detection
  const onset = new Float32Array(numFrames);
  for (let f = 1; f < numFrames; f++) {
    const d = rms[f] - rms[f - 1];
    onset[f] = d > 0 ? d : 0;
  }
  const frameRate = sampleRate / hop;
  const minBPM = 60;
  const maxBPM = 200;
  const minLag = Math.max(1, Math.floor((60 * frameRate) / maxBPM));
  const maxLag = Math.max(minLag + 1, Math.ceil((60 * frameRate) / minBPM));
  let bestLag = minLag;
  let bestVal = -Infinity;
  for (let lag = minLag; lag <= maxLag && lag < numFrames; lag++) {
    let sum = 0;
    for (let f = 0; f < numFrames - lag; f++) sum += onset[f] * onset[f + lag];
    if (sum > bestVal) {
      bestVal = sum;
      bestLag = lag;
    }
  }
  const bpm = Math.round((60 * frameRate) / bestLag);

  let meanRms = 0;
  let meanCentroid = 0;
  let maxRms = 0;
  for (let f = 0; f < numFrames; f++) {
    meanRms += rms[f];
    meanCentroid += centroid[f];
    if (rms[f] > maxRms) maxRms = rms[f];
  }
  meanRms /= numFrames;
  meanCentroid /= numFrames;
  const dynamicRange = meanRms > 0 ? maxRms / meanRms : 0;

  // Best 15s "hook" window: highest sustained energy segment (candidate for Short/Reel/TikTok clip)
  const hookSeconds = Math.min(15, duration * 0.9);
  const framesInHook = Math.max(1, Math.round(hookSeconds * frameRate));
  let windowSum = 0;
  for (let f = 0; f < Math.min(framesInHook, numFrames); f++) windowSum += rms[f];
  let bestHookSum = windowSum;
  let bestHookStart = 0;
  for (let f = framesInHook; f < numFrames; f++) {
    windowSum += rms[f] - rms[f - framesInHook];
    if (windowSum > bestHookSum) {
      bestHookSum = windowSum;
      bestHookStart = f - framesInHook + 1;
    }
  }
  const hookStartSec = (bestHookStart * hop) / sampleRate;

  return { duration, bpm, meanCentroid, meanRms, dynamicRange, hookStartSec, hookSeconds, sampleRate };
}

function fmtTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.round(s % 60).toString().padStart(2, '0');
  return `${m}:${sec}`;
}

export const RealSongAnalyzer: React.FC<RealSongAnalyzerProps> = ({
  loadedAudioBuffer,
  loadedFileName,
  onAuditInDropCheck,
}) => {
  const [analysis, setAnalysis] = useState<RealAnalysisData | null>(null);
  const [statusText, setStatusText] = useState<string>('');
  const [progress, setProgress] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioPlayerRef = useRef<HTMLAudioElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // If a track is already loaded in the parent app and no analysis yet, auto-run analysis
  useEffect(() => {
    if (loadedAudioBuffer && !analysis && !isProcessing) {
      runBufferAnalysis(loadedAudioBuffer, loadedFileName || 'pista_cargada.wav');
    }
  }, [loadedAudioBuffer]);

  const runBufferAnalysis = async (buffer: AudioBuffer, name: string) => {
    setIsProcessing(true);
    setStatusText('Analizando espectro y energía (FFT real)...');
    setProgress(30);

    await new Promise((r) => setTimeout(r, 40));
    try {
      const result = analyzeAudio(buffer, (p) => {
        setProgress(30 + p * 60);
      });
      setProgress(95);
      setStatusText('Listo. Generando recomendaciones...');
      await new Promise((r) => setTimeout(r, 30));

      setAnalysis({
        ...result,
        filename: name,
      });
      setProgress(100);
      setStatusText('✅ Análisis completado sobre tu archivo real.');
    } catch (err: any) {
      setStatusText('⚠️ Error en análisis: ' + (err.message || 'Error desconocido'));
    } finally {
      setIsProcessing(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const handleFile = async (file: File) => {
    setSelectedFile(file);
    setAnalysis(null);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    const newUrl = URL.createObjectURL(file);
    setAudioUrl(newUrl);

    setStatusText(`Leyendo archivo (${file.name})...`);
    setIsProcessing(true);
    setProgress(5);

    try {
      let arrayBuffer: ArrayBuffer;
      if (typeof file.arrayBuffer === 'function') {
        arrayBuffer = await file.arrayBuffer();
      } else {
        arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as ArrayBuffer);
          reader.onerror = () => reject(new Error('No se pudo leer el archivo'));
          reader.readAsArrayBuffer(file);
        });
      }

      if (!arrayBuffer || arrayBuffer.byteLength === 0) {
        throw new Error('El archivo llegó vacío. Prueba a exportarlo de nuevo o usa otro formato (MP3/WAV).');
      }

      setStatusText('Decodificando audio...');
      setProgress(15);

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) throw new Error('Este navegador no soporta Web Audio API.');
      const audioCtx = new AudioCtx();
      if (audioCtx.state === 'suspended') {
        try {
          await audioCtx.resume();
        } catch (e) {}
      }

      let audioBuffer: AudioBuffer;
      try {
        audioBuffer = await audioCtx.decodeAudioData(arrayBuffer.slice(0));
      } catch (decodeErr) {
        throw new Error('No se pudo decodificar el audio (formato no soportado o archivo dañado). Prueba en MP3 o WAV.');
      }

      setStatusText('Analizando espectro y energía (FFT real)...');
      setProgress(30);
      await new Promise((r) => setTimeout(r, 30));

      const result = analyzeAudio(audioBuffer, (p) => {
        setProgress(30 + p * 60);
      });

      setProgress(95);
      setStatusText('Listo. Generando recomendaciones...');
      await new Promise((r) => setTimeout(r, 30));

      setAnalysis({
        ...result,
        filename: file.name,
      });

      setProgress(100);
      setStatusText('✅ Análisis completado sobre tu archivo real.');
    } catch (err: any) {
      setStatusText('⚠️ No se pudo procesar el audio: ' + err.message);
    } finally {
      setIsProcessing(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const seekToHook = () => {
    if (audioPlayerRef.current && analysis) {
      audioPlayerRef.current.currentTime = analysis.hookStartSec;
      audioPlayerRef.current.play();
      setIsPlaying(true);
    }
  };

  // Classify real measured values into usable buckets
  let energyLevel = 'Media';
  let brightness = 'Cálido / equilibrado';
  let punchy = 'Energía sostenida (pocos altibajos)';
  let pace = 'medio';
  let palette: string[] = ['#1E293B', '#334155', '#64748B', '#CBD5E1'];
  let artStyle = '';
  let hookLabel = '';
  let cutInterval = '1–2 s';

  if (analysis) {
    energyLevel = analysis.meanRms < 0.04 ? 'Baja' : analysis.meanRms < 0.1 ? 'Media' : 'Alta';
    brightness = analysis.meanCentroid < 1500 ? 'Oscuro / grave' : analysis.meanCentroid < 3200 ? 'Cálido / equilibrado' : 'Brillante / agudo';
    punchy = analysis.dynamicRange > 3.2 ? 'Con picos marcados (drops claros)' : 'Energía sostenida (pocos altibajos)';
    pace = analysis.bpm >= 130 ? 'rápido' : analysis.bpm >= 95 ? 'medio' : 'lento';

    if (brightness === 'Brillante / agudo' && energyLevel === 'Alta') {
      palette = ['#FF3B7A', '#FFD23F', '#00E5FF', '#191024'];
      artStyle = 'Colores saturados y alto contraste, composición con movimiento diagonal, tipografía gruesa. Este tipo de portada funciona porque el brillo espectral y la energía medidos en tu canción son altos: visualmente necesita "gritar" lo mismo que suena.';
    } else if (brightness === 'Brillante / agudo' && energyLevel !== 'Alta') {
      palette = ['#FFD6E8', '#FFF3B0', '#B8E0FF', '#2B2640'];
      artStyle = 'Paleta clara y pastel pero con un punto de color vivo, tipografía fina o manuscrita. Tu canción es brillante en frecuencias pero sin tanta energía sostenida, así que una portada "gritona" desentonaría con lo que se escucha.';
    } else if (brightness !== 'Brillante / agudo' && energyLevel === 'Alta') {
      palette = ['#B91C1C', '#111827', '#F59E0B', '#4B0082'];
      artStyle = 'Contraste fuerte entre tonos oscuros y un acento cálido (rojo, ámbar, morado), iluminación dramática, poco texto. Coincide con una canción de energía alta pero graves predominantes: portada intensa y oscura, no colorida.';
    } else {
      palette = ['#1E293B', '#334155', '#64748B', '#CBD5E1'];
      artStyle = 'Paleta corta de grises azulados o sepias, mucho espacio negativo, composición minimalista y una sola foto/ilustración central. Tu canción mide energía baja/media y tonos graves-cálidos: una portada recargada compite con lo que transmite el audio.';
    }

    hookLabel = `${fmtTime(analysis.hookStartSec)}–${fmtTime(analysis.hookStartSec + analysis.hookSeconds)}`;
    cutInterval = analysis.bpm >= 130 ? '0.5–1 s' : analysis.bpm >= 95 ? '1–2 s' : '2–4 s';
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      
      {/* Header Title & Intro */}
      <div className="rounded-2xl border-2 border-slate-300 bg-white/95 p-6 sm:p-8 shadow-sm marble-card">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-sky-400 border border-slate-700 shadow-xs">
            <Headphones className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono tracking-[0.2em] font-extrabold uppercase text-slate-500">
                DSP & FFT NATIVO
              </span>
              <span className="rounded bg-sky-100 px-2 py-0.5 text-[10px] font-mono font-bold text-sky-800">
                WEB AUDIO API
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 font-display neon-title-glow">
              🎧 Analizador real de tu canción
            </h1>
          </div>
        </div>

        <p className="mt-4 text-xs sm:text-sm leading-relaxed text-slate-600 font-sans">
          Sube el archivo de audio. La app decodifica la onda real con Web Audio API y calcula tempo (BPM), energía, brillo espectral y el fragmento más intenso — no son datos inventados, salen del análisis directo de tu archivo.
        </p>

        {/* Disclaimer Honestidad Primero */}
        <div className="mt-4 rounded-xl border-l-4 border-sky-500 border border-slate-300 bg-sky-50/70 p-4 text-xs leading-relaxed text-slate-700">
          <strong className="text-slate-900 font-bold">Honestidad primero:</strong> esto analiza el audio de verdad (FFT radix-2, energía RMS, autocorrelación de tempo), pero ningún software puede <em>garantizar</em> viralidad — eso depende también de ejecución, timing y audiencia. Lo que te doy son recomendaciones basadas en (1) las características reales medidas en tu canción y (2) cómo documentan hoy su funcionamiento los algoritmos de TikTok y YouTube Shorts (fuentes citadas abajo). Nada de esto es una fórmula mágica.
        </div>

        {/* Drop Zone */}
        <div
          ref={dropZoneRef}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="mt-6 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/90 py-8 px-4 text-center transition-all hover:border-sky-500 hover:bg-sky-50/40 group shadow-2xs"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*,.mp3,.wav,.m4a,.ogg"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white border border-slate-300 text-slate-800 shadow-2xs group-hover:scale-105 group-hover:border-sky-400 transition-transform">
            <Upload className="h-6 w-6 text-sky-600" />
          </div>
          <div className="mt-3 text-sm font-bold text-slate-900">
            📂 Toca para subir tu canción
          </div>
          <div className="mt-1 text-xs text-slate-500 font-mono">
            MP3, WAV, M4A, OGG... se procesa en tu navegador localmente, sin subirlo a servidores
          </div>

          {loadedAudioBuffer && !selectedFile && (
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1 text-[11px] font-mono font-bold text-slate-700 shadow-2xs">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Pista activa en DropCheck lista: {loadedFileName || 'archivo cargado'}</span>
            </div>
          )}
        </div>

        {/* Audio Player */}
        {audioUrl && (
          <div className="mt-5 rounded-xl border border-slate-300 bg-white p-3 shadow-2xs">
            <div className="flex items-center justify-between text-xs font-mono text-slate-500 mb-2 px-1">
              <span>Reproductor Local</span>
              <span>{selectedFile?.name}</span>
            </div>
            <audio
              ref={audioPlayerRef}
              src={audioUrl}
              controls
              className="w-full h-10 outline-none"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
          </div>
        )}

        {/* Status text & Progress Bar */}
        {statusText && (
          <div className="mt-4 flex items-center justify-between font-mono text-xs text-sky-700 font-semibold px-1">
            <span>{statusText}</span>
            {isProcessing && <span>{Math.round(progress)}%</span>}
          </div>
        )}

        {isProcessing && (
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full bg-sky-500 transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>

      {/* Results Section */}
      {analysis && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-slate-300 bg-white p-4 shadow-2xs">
              <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
                Duración
              </div>
              <div className="mt-1 text-lg sm:text-xl font-bold font-mono text-slate-900">
                {fmtTime(analysis.duration)}
              </div>
            </div>

            <div className="rounded-xl border border-slate-300 bg-white p-4 shadow-2xs">
              <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
                Tempo estimado
              </div>
              <div className="mt-1 text-lg sm:text-xl font-bold font-mono text-slate-900">
                {analysis.bpm} BPM
              </div>
            </div>

            <div className="rounded-xl border border-slate-300 bg-white p-4 shadow-2xs">
              <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
                Energía
              </div>
              <div className="mt-1 text-lg sm:text-xl font-bold font-mono text-slate-900">
                {energyLevel}
              </div>
            </div>

            <div className="rounded-xl border border-slate-300 bg-white p-4 shadow-2xs">
              <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
                Brillo espectral
              </div>
              <div className="mt-1 text-sm sm:text-base font-bold text-slate-900 leading-tight">
                {brightness}
              </div>
            </div>
          </div>

          {/* Hook Box: Fragmento más intenso */}
          <div className="rounded-2xl border-2 border-sky-400 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-sky-500/10 p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-rose-600 font-bold text-sm">
                  <Flame className="h-5 w-5 fill-rose-500" />
                  <span>Fragmento más intenso detectado (real, medido en tu audio):</span>
                </div>
                <div className="mt-1 font-mono text-xl sm:text-2xl font-extrabold text-slate-900">
                  {hookLabel}
                </div>
              </div>

              {audioUrl && (
                <button
                  onClick={seekToHook}
                  className="studio-btn-metallic text-xs !py-2 !px-4 self-start sm:self-auto cursor-pointer"
                >
                  <Play className="h-3.5 w-3.5 mr-1.5 fill-current text-sky-400" />
                  Reproducir Hook ({hookLabel})
                </button>
              )}
            </div>

            <p className="mt-3 text-xs leading-relaxed text-slate-700 font-sans">
              Es el rango de {Math.round(analysis.hookSeconds)}s con mayor energía sostenida de toda la canción — el candidato lógico para tu clip de Shorts/Reels/TikTok, porque es donde el propio audio "engancha" más fuerte.
            </p>
          </div>

          {/* Section: Portada */}
          <div className="rounded-2xl border-2 border-slate-300 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-base font-bold text-slate-900 font-display">
                <Palette className="h-5 w-5 text-indigo-600" />
                <span>🎨 Portada</span>
              </h2>

              <div className="flex flex-wrap gap-1.5">
                <span className="rounded-md bg-slate-100 border border-slate-200 px-2 py-0.5 text-[11px] font-mono text-slate-700 font-semibold">
                  Brillo: {brightness}
                </span>
                <span className="rounded-md bg-slate-100 border border-slate-200 px-2 py-0.5 text-[11px] font-mono text-slate-700 font-semibold">
                  Energía: {energyLevel}
                </span>
                <span className="rounded-md bg-slate-100 border border-slate-200 px-2 py-0.5 text-[11px] font-mono text-slate-700 font-semibold">
                  {punchy}
                </span>
              </div>
            </div>

            <p className="mt-4 text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">
              {artStyle}
            </p>

            <div className="mt-4">
              <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider mb-2 font-bold">
                Paleta orientativa según lo medido:
              </div>
              <div className="flex gap-2">
                {palette.map((color, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-1">
                    <div
                      className="h-10 w-10 rounded-xl border border-slate-300 shadow-2xs transition-transform hover:scale-110"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-[10px] font-mono text-slate-600 uppercase font-semibold">
                      {color}
                    </span>
                  </div>
                ))}
              </div>
              <p className="mt-2 text-[11px] text-slate-500 font-mono">
                Paleta orientativa según lo medido, no un mandato — úsala como punto de partida.
              </p>
            </div>

            <ul className="mt-4 space-y-2 border-t border-slate-200 pt-4 text-xs text-slate-700 list-disc pl-5 leading-relaxed font-sans">
              <li>
                <strong>Legibilidad miniatura:</strong> Deja que la portada se lea a tamaño miniatura (3x3 cm): es como la ve la mayoría en el feed.
              </li>
              <li>
                <strong>Foco claro:</strong> Un solo punto focal (rostro, objeto, tipografía) — no compitas con tu propio audio con demasiados elementos.
              </li>
              <li>
                <strong>Consistencia de marca:</strong> Coherencia visual entre portada del single y la miniatura del video: el cerebro reconoce el patrón y da más CTR.
              </li>
            </ul>
          </div>

          {/* Section: Video / Short / Reel */}
          <div className="rounded-2xl border-2 border-slate-300 bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-base font-bold text-slate-900 font-display">
              <Video className="h-5 w-5 text-rose-600" />
              <span>📱 Video / Short / Reel — a partir de tu {hookLabel}</span>
            </h2>

            <p className="mt-3 text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">
              Con {analysis.bpm} BPM (ritmo {pace}), corta la imagen cada <strong>{cutInterval}</strong> aproximadamente — el ojo no debe descansar más tiempo del que aguanta el ritmo de la canción.
            </p>

            <ul className="mt-4 space-y-2.5 text-xs text-slate-700 list-disc pl-5 leading-relaxed font-sans">
              <li>
                <strong>Primeros 2-3 segundos:</strong> el gancho decide si el algoritmo sigue mostrando el video o lo entierra. Empieza directo en el fragmento {hookLabel}, sin intro ni logo.
              </li>
              <li>
                <strong>Duración recomendada:</strong> apunta a que se vea completo. Un video de 20-30s con 70-80% de retención rinde mejor que uno de 60s con 40%.
              </li>
              <li>
                <strong>Subtítulos quemados en pantalla:</strong> gran parte de la audiencia ve sin sonido; sin subtítulo pierdes retención desde el segundo 1.
              </li>
              <li>
                <strong>Formato vertical 9:16:</strong> texto y sujeto centrados en el tercio central (se recorta en algunas superficies y márgenes de interfaz).
              </li>
              <li>
                <strong>Distribución cruzada:</strong> Publica el mismo corte del hook adaptado en TikTok, Reels y Shorts — maximizas descubrimiento cruzado con el mismo activo.
              </li>
            </ul>
          </div>

          {/* Section: Cómo priorizan hoy TikTok y YouTube Shorts */}
          <div className="rounded-2xl border-2 border-slate-300 bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-base font-bold text-slate-900 font-display">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
              <span>⚙️ Cómo priorizan hoy TikTok y YouTube Shorts (documentado, no inventado)</span>
            </h2>

            <ul className="mt-4 space-y-2.5 text-xs text-slate-700 list-disc pl-5 leading-relaxed font-sans">
              <li>
                <strong>TikTok 2026:</strong> el watch time (tiempo de visualización) y el porcentaje de repeticiones/compartidos pesan más que likes o seguidores; el 70% de las vistas salen del feed "Para Ti". La ventana de un sonido en tendencia dura 5-10 días antes de saturarse.
              </li>
              <li>
                <strong>YouTube Shorts 2026:</strong> ya no solo mide watch time bruto, sino "señales de satisfacción" (si lo ven completo, lo repiten, se quedan en el canal). El objetivo de retención de referencia es 70%+. CTR de miniatura + retención en los primeros 3-15s deciden si el sistema lo expande a más público.
              </li>
              <li>
                <strong>En ambas plataformas:</strong> un CTR alto con retención baja perjudica el alcance (penaliza el "clickbait"), así que la miniatura/portada debe prometer exactamente lo que el video entrega.
              </li>
              <li>
                <strong>Sonido oficial:</strong> Sube tu pista a la biblioteca de sonidos de TikTok antes de promocionar — el algoritmo premia el contenido que usa el audio "nativo" de la plataforma, no un link externo.
              </li>
            </ul>
          </div>

          {/* Footer Note with Sources */}
          <div className="rounded-xl border border-slate-300 bg-slate-100 p-4 text-[11px] leading-relaxed text-slate-600 font-mono">
            <strong>Fuentes consultadas (2026):</strong> estudio Metricool/IEBS sobre algoritmo de TikTok, guía de algoritmo TikTok de The King of Content, Chartlex (promoción musical en TikTok), Kolsquare y GoViral sobre algoritmo de YouTube/Shorts, y go-viral.app sobre señales de satisfacción en Shorts. Los valores de BPM/energía/brillo de arriba salen del análisis DSP real de "{analysis.filename}" hecho en tu navegador (FFT + autocorrelación), no de una base de datos externa.
          </div>

          {/* Action to audit in full DropCheck PRO */}
          {selectedFile && onAuditInDropCheck && (
            <div className="flex items-center justify-between rounded-xl border-2 border-slate-800 bg-slate-900 p-4 text-white shadow-sm">
              <div>
                <div className="text-xs font-mono font-bold text-sky-400 uppercase">
                  Auditoría Acústica Completa
                </div>
                <div className="text-sm font-bold">
                  ¿Quieres también el semáforo EBU R128 en LUFS, True Peak y masterización?
                </div>
              </div>
              <button
                onClick={() => onAuditInDropCheck(selectedFile)}
                className="studio-btn-metallic text-xs !py-2.5 !px-4 shrink-0 cursor-pointer"
              >
                Abrir en DropCheck PRO →
              </button>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
