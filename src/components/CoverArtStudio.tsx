import React, { useState, useEffect } from 'react';
import { 
  Palette, 
  Sparkles, 
  Copy, 
  Check, 
  Layers, 
  Type, 
  Sliders, 
  Image as ImageIcon, 
  RefreshCw, 
  FileText, 
  ShieldCheck, 
  Disc, 
  ExternalLink,
  Music,
  Maximize2,
  Share2,
  Tv,
  ArrowRight,
  Flame
} from 'lucide-react';
import { AnalysisReport, CoverArtPromptData, CoverColorSwatch } from '../types';

interface CoverArtStudioProps {
  report?: AnalysisReport | null;
  onNavigateToAudit?: () => void;
}

// Preset Art Styles
const ART_STYLES = [
  { id: 'cyberpunk', name: 'Cyberpunk & Neón Brutalista', mood: 'Futurista, nocturno, luces LED cian y magenta, estética distópica' },
  { id: 'vintage-analog', name: 'Analógico 35mm & Grano Retro', mood: 'Nostálgico, textura cálida de cinta, estética vinilo años 80/90' },
  { id: 'dark-urban', name: 'Dark Urbano & Streetwear', mood: 'Gótico contemporáneo, texturas metálicas, humo denso, contrastes negros' },
  { id: '3d-chrome', name: '3D Liquid Chrome & Y2K', mood: 'Cromo líquido reflectante, tipografía metálica inflada, brillos prismáticos' },
  { id: 'minimal-cinematic', name: 'Minimalismo Cinematográfico', mood: 'Espacio negativo amplio, fotografía editorial de alto contraste, tipografía suiza' },
  { id: 'brutalist-graphic', name: 'Brutalismo Editorial & Noise', mood: 'Collage vanguardista, tipografías condensadas gigantes, códigos de barras' },
];

export const CoverArtStudio: React.FC<CoverArtStudioProps> = ({ report, onNavigateToAudit }) => {
  // Form State
  const [trackTitle, setTrackTitle] = useState(report?.metadata?.fileName?.replace(/\.[^/.]+$/, '') || 'ANIMA TECH');
  const [artistName, setArtistName] = useState('Armored Bass');
  const [genre, setGenre] = useState(report?.metadata?.detectedGenre || 'Tech House / Urban');
  const [bpm, setBpm] = useState(report?.metadata?.estimatedBpm?.toString() || '126');
  const [key, setKey] = useState(report?.metadata?.detectedKey || 'F# Menor');
  const [selectedStyle, setSelectedStyle] = useState(ART_STYLES[0].id);
  const [customMood, setCustomMood] = useState('Enérgico, nocturno, con atmósfera de club underground y alta retención');
  const [customInstructions, setCustomInstructions] = useState('');
  
  // Loading & Generation State
  const [isGenerating, setIsGenerating] = useState(false);
  const [coverData, setCoverData] = useState<CoverArtPromptData | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activePromptTab, setActivePromptTab] = useState<'midjourney' | 'dalle3' | 'ideogram' | 'leonardo'>('midjourney');
  const [mockupColorIndex, setMockupColorIndex] = useState(0);

  // Sync with report if available
  useEffect(() => {
    if (report?.metadata) {
      setTrackTitle(report.metadata.fileName.replace(/\.[^/.]+$/, ''));
      setGenre(report.metadata.detectedGenre);
      setBpm(report.metadata.estimatedBpm.toString());
      setKey(report.metadata.detectedKey);
    }
  }, [report]);

  // Initial prompt generation on mount or track change
  useEffect(() => {
    generatePrompt();
  }, []);

  // Generate Cover Art Prompt with AI / Local Engine
  const generatePrompt = async () => {
    setIsGenerating(true);
    const styleObj = ART_STYLES.find(s => s.id === selectedStyle) || ART_STYLES[0];

    try {
      const res = await fetch('/api/generate-cover-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trackTitle,
          artistName,
          genre,
          bpm: Number(bpm) || 126,
          key,
          artStyle: styleObj.name,
          mood: customMood,
          customInstructions,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.specs && data.prompts) {
          setCoverData(data);
          setIsGenerating(false);
          return;
        }
      }
    } catch (e) {
      console.warn('Using local cover generator engine:', e);
    }

    // Fallback Smart Local Engine
    const fallbackData: CoverArtPromptData = {
      conceptTitle: `${trackTitle.toUpperCase()} // Visual Identity & Cover Art`,
      conceptDescription: `Una obra visual de alto impacto que encapsula la energía de ${genre} a ${bpm} BPM en ${key}. Combina una atmósfera cinematográfica con composición geométrica equilibrada y tipografía de alto contraste.`,
      specs: {
        dimensions: '3000 x 3000 px (Relación 1:1 Cuadrada)',
        resolution: '300 DPI (Estándar Master Spotify / Apple Music / Vinilo)',
        colorSpace: 'sRGB / 24-bit (No utilizar CMYK para streaming)',
        safeZone: '15% de margen interno (450px) libre de textos críticos',
        fileFormat: 'PNG 24-bit sin pérdida o JPEG a máxima calidad (< 10 MB)',
      },
      colorPalette: [
        { name: 'Fondo / Base Primaria', hex: '#0B0D13', role: 'Fondo oscuro con gradiente de ruido analógico' },
        { name: 'Acento Neón Principal', hex: '#00F0FF', role: 'Iluminación volumétrica y foco del punto focal' },
        { name: 'Armónico Secundario', hex: '#8B5CF6', role: 'Sombra suave y contraste estético' },
        { name: 'Tipografía & Letras', hex: '#F8FAFC', role: 'Contraste blanco puro 12:1 para legibilidad móvil' },
      ],
      typography: {
        titleFont: 'Neue Haas Grotesk Black / Monument Extended / Syne Heavy',
        artistFont: 'Space Mono Bold / Helvetica Neue Medium (Tracking +250)',
        titleSizePercent: '20% a 24% de la altura total del lienzo',
        artistSizePercent: '6% a 8% con espaciado amplio entre caracteres',
        letterSpacing: 'Título: -0.02em (compacto) | Artista: +0.25em (expandido)',
        placement: 'Título centrado en tercio superior o base inferior con margen seguro',
        advisoryPlacement: 'Insignia oficial Parental Advisory en esquina inferior derecha (alto 240px)',
      },
      prompts: {
        midjourney: `Album cover art for "${trackTitle}" by ${artistName}, ${genre} music at ${bpm} BPM in ${key}. ${styleObj.mood}. Hyper-detailed cinematic art direction, 3000x3000px square composition, dramatic volumetric studio lighting, rich metallic textures, high-contrast palette (#0B0D13, #00F0FF, #8B5CF6), album cover aesthetic, masterpiece quality, award-winning graphic design --ar 1:1 --v 6.1 --style raw --q 2`,
        dalle3: `An official square album cover art for the song "${trackTitle}" by artist "${artistName}". Genre: ${genre}, tempo ${bpm} BPM. Visual concept: ${styleObj.mood}. The design features premium studio lighting with a glowing holographic accent in electric cyan and deep violet over an ultra-dark background. Clean centered focal element, balanced negative space, professional 300 DPI album sleeve aesthetic for Spotify and vinyl.`,
        ideogram: `Album cover artwork with typography: "${trackTitle.toUpperCase()}" in bold ultra-modern grotesque font at the top, and "${artistName.toUpperCase()}" in elegant tracked-out monospace font below. Visual style: ${styleObj.mood}, cinematic dark lighting, neon cyan glow, 8k resolution, graphic design layout, 1:1 aspect ratio.`,
        leonardo: `Album cover masterpiece, "${trackTitle}" by ${artistName}, ${genre}, ${styleObj.mood}, 3000x3000px, 300 DPI, perfect square framing, dynamic volumetric lighting, octane render, unreal engine 5 aesthetic, photorealistic texture --negative lowres, blurry, bad anatomy, watermarks, distorted text`,
      },
      spotifyCanvasTip: `Para el Spotify Canvas (1080x1920 9:16), anima el elemento central con un bucle continuo de 6 a 8 segundos sin cortes abruptos, sincronizado con el tempo de ${bpm} BPM.`,
    };

    setCoverData(fallbackData);
    setIsGenerating(false);
  };

  const copyToClipboard = (text: string, keyName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const currentPrompt = coverData?.prompts[activePromptTab] || '';

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="mb-8 rounded-3xl border-2 border-slate-300 bg-white/95 p-6 sm:p-8 shadow-sm marble-card">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 font-mono text-xs font-extrabold tracking-[0.25em] text-slate-500 uppercase">
              <span>VISUAL IDENTITY STUDIO // PROMPT ARCHITECT</span>
              <span className="rounded bg-sky-100 text-sky-800 border border-sky-300 px-2 py-0.5 text-[10px]">
                3000 × 3000 PX · 300 DPI
              </span>
            </div>
            <h1 className="mt-2 text-2xl sm:text-3xl font-black text-slate-900 font-display neon-title-glow">
              ESTUDIO DE PORTADAS & PROMPT MAESTRO
            </h1>
            <p className="mt-2 text-sm text-slate-600 max-w-3xl font-sans">
              Genera la dirección de arte oficial, especificaciones técnicas de distribución para Spotify/Apple Music (medidas, paleta de colores HEX, tipografías y márgenes) y los prompts blindados para Midjourney, DALL-E 3 e Ideogram.
            </p>
          </div>

          {report && onNavigateToAudit && (
            <button
              onClick={onNavigateToAudit}
              className="inline-flex items-center gap-2 rounded-xl border-2 border-slate-300 bg-slate-50 px-4 py-2.5 text-xs font-mono font-bold text-slate-800 hover:bg-slate-100 transition-all shadow-xs shrink-0"
            >
              <span>Ver Auditoría de Audio</span>
              <ArrowRight className="h-4 w-4 text-slate-600" />
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Left Controls & Right Output */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        
        {/* Left Column: Creator Customizer Form (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-2xl border-2 border-slate-300 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-4 text-xs font-mono font-extrabold tracking-wider text-slate-900 uppercase">
              <Sliders className="h-4 w-4 text-sky-500" />
              <span>PARÁMETROS DEL LANZAMIENTO</span>
            </div>

            <div className="mt-5 space-y-4 text-left">
              {/* Track Title & Artist */}
              <div>
                <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Título de la Canción:
                </label>
                <input
                  type="text"
                  value={trackTitle}
                  onChange={(e) => setTrackTitle(e.target.value)}
                  className="w-full rounded-xl border-2 border-slate-300 bg-slate-50 px-3.5 py-2 text-sm font-bold text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-hidden transition-all"
                  placeholder="Nombre de la pista"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Artista / Productor:
                </label>
                <input
                  type="text"
                  value={artistName}
                  onChange={(e) => setArtistName(e.target.value)}
                  className="w-full rounded-xl border-2 border-slate-300 bg-slate-50 px-3.5 py-2 text-sm font-bold text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-hidden transition-all"
                  placeholder="Tu nombre artístico"
                />
              </div>

              {/* Genre, BPM, Key in 3 columns */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider mb-1 truncate">
                    Género
                  </label>
                  <input
                    type="text"
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-slate-50 px-2 py-1.5 text-xs font-semibold text-slate-800 focus:border-sky-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider mb-1">
                    BPM
                  </label>
                  <input
                    type="text"
                    value={bpm}
                    onChange={(e) => setBpm(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-slate-50 px-2 py-1.5 text-xs font-mono font-bold text-slate-900 focus:border-sky-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Tono
                  </label>
                  <input
                    type="text"
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-slate-50 px-2 py-1.5 text-xs font-mono font-bold text-slate-900 focus:border-sky-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Art Style Selector */}
              <div>
                <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Estilo Visual & Dirección de Arte:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {ART_STYLES.map((style) => (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => setSelectedStyle(style.id)}
                      className={`flex flex-col text-left rounded-xl p-2.5 border-2 transition-all text-xs ${
                        selectedStyle === style.id
                          ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-400'
                      }`}
                    >
                      <span className="font-bold">{style.name}</span>
                      <span className={`text-[10px] line-clamp-1 mt-0.5 ${selectedStyle === style.id ? 'text-slate-300' : 'text-slate-500'}`}>
                        {style.mood}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Instructions */}
              <div>
                <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Detalles / Elementos Específicos a Incluir:
                </label>
                <textarea
                  rows={2}
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                  placeholder="Ej. Incluir un sintetizador vintage flotando en el espacio, reflejos de lluvia, textura de cinta analógica..."
                  className="w-full rounded-xl border-2 border-slate-300 bg-slate-50 p-2.5 text-xs text-slate-800 focus:border-sky-500 focus:bg-white focus:outline-hidden transition-all"
                />
              </div>

              {/* Submit Button */}
              <button
                onClick={generatePrompt}
                disabled={isGenerating}
                className="w-full studio-btn-metallic !py-3 flex items-center justify-center gap-2 text-sm font-bold shadow-md cursor-pointer disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin text-sky-400" />
                    <span>Diseñando Concepto con IA...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 text-sky-400" />
                    <span>Generar Dirección de Arte & Prompts</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Technical Checklist Card */}
          <div className="rounded-2xl border-2 border-slate-300 bg-slate-50 p-5 text-left">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-900 uppercase tracking-wider mb-3">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>REQUISITOS OFICIALES SPOTIFY & APPLE MUSIC</span>
            </div>
            <ul className="space-y-2 text-xs text-slate-700 font-sans">
              <li className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <span><strong>Proporción 1:1 Estricta:</strong> Mínimo 3000 × 3000 píxeles a 300 DPI.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <span><strong>Espacio de Color sRGB:</strong> Evita perfiles CMYK que desaturan colores en pantallas móviles.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <span><strong>Sin Elementos Prohibidos:</strong> No incluir URLs web, precios, logos de redes sociales o menciones a formatos físicos ("CD / Digital").</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Right Column: Interactive Results, Technical Sheet & Prompts (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {coverData ? (
            <>
              {/* Top Banner: Concept Summary & Live Mockup */}
              <div className="rounded-2xl border-2 border-slate-300 bg-white p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
                  <div>
                    <span className="font-mono text-[10px] font-extrabold text-sky-700 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded uppercase">
                      CONCEPTO VISUAL DIRECTIVO
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 font-display mt-1">
                      {coverData.conceptTitle}
                    </h3>
                  </div>

                  <button
                    onClick={() => copyToClipboard(JSON.stringify(coverData, null, 2), 'full-json')}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-slate-100 px-3 py-1.5 text-xs font-mono font-bold text-slate-700 hover:bg-slate-200 transition-colors shadow-2xs shrink-0"
                  >
                    {copiedKey === 'full-json' ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                        <span>Brief Copiado</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Copiar Todo el Brief</span>
                      </>
                    )}
                  </button>
                </div>

                <p className="mt-4 text-xs sm:text-sm text-slate-700 leading-relaxed italic font-sans border-l-3 border-sky-500 pl-3">
                  "{coverData.conceptDescription}"
                </p>

                {/* Interactive Streaming Player Mockup */}
                <div className="mt-6 rounded-2xl border-2 border-slate-800 bg-slate-950 p-5 text-white shadow-lg relative overflow-hidden">
                  <div className="absolute -right-12 -bottom-12 h-44 w-44 rounded-full bg-sky-500/10 blur-2xl" />
                  
                  <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-2">
                    <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase flex items-center gap-1.5">
                      <Disc className="h-3.5 w-3.5 text-sky-400 animate-spin" />
                      SIMULADOR DE REPRODUCCIÓN (SPOTIFY / APPLE MUSIC)
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded">
                      SAFE ZONE 100% OK
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-5">
                    {/* Simulated 1:1 Album Canvas */}
                    <div className="relative h-44 w-44 shrink-0 rounded-xl border-2 border-slate-700 bg-slate-900 shadow-xl overflow-hidden flex flex-col justify-between p-3.5 group">
                      {/* Dynamic Background Preview based on Palette */}
                      <div 
                        className="absolute inset-0 opacity-80"
                        style={{
                          background: `radial-gradient(circle at 30% 20%, ${coverData.colorPalette[1]?.hex || '#00F0FF'} 0%, ${coverData.colorPalette[0]?.hex || '#0B0D13'} 75%)`
                        }}
                      />

                      {/* Noise Texture Overlay */}
                      <div className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:8px_8px] opacity-10" />

                      {/* Safe Margin Guide Lines (Visual) */}
                      <div className="absolute inset-2 rounded-lg border border-white/15 pointer-events-none" />

                      {/* Top Canvas Text: Artist */}
                      <div className="relative z-10">
                        <span className="text-[9px] font-mono font-extrabold uppercase tracking-[0.25em] text-white/90 drop-shadow-md">
                          {artistName}
                        </span>
                      </div>

                      {/* Center Graphic Glow */}
                      <div className="relative z-10 flex items-center justify-center my-auto">
                        <div 
                          className="h-14 w-14 rounded-full border-2 border-white/30 flex items-center justify-center shadow-lg"
                          style={{ borderColor: coverData.colorPalette[1]?.hex || '#00F0FF' }}
                        >
                          <Music className="h-6 w-6 text-white drop-shadow-md" />
                        </div>
                      </div>

                      {/* Bottom Canvas Text: Title & Specs */}
                      <div className="relative z-10 flex items-end justify-between">
                        <div>
                          <h4 className="text-xs font-black tracking-tight text-white uppercase font-display drop-shadow-lg max-w-[100px] truncate">
                            {trackTitle}
                          </h4>
                          <span className="text-[8px] font-mono text-slate-300">
                            {bpm} BPM · {key}
                          </span>
                        </div>
                        <span className="rounded bg-black/60 border border-white/20 px-1 py-0.5 text-[7px] font-mono font-bold text-white uppercase">
                          PARENTAL
                        </span>
                      </div>
                    </div>

                    {/* Meta & Mockup Playback Details */}
                    <div className="flex-1 w-full text-left space-y-2.5">
                      <div>
                        <span className="text-[10px] font-mono uppercase text-sky-400 tracking-wider">
                          {genre}
                        </span>
                        <h3 className="text-lg font-black tracking-tight text-white font-display">
                          {trackTitle}
                        </h3>
                        <p className="text-xs text-slate-300 font-medium">
                          {artistName}
                        </p>
                      </div>

                      {/* Mock Progress Bar */}
                      <div className="space-y-1">
                        <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                          <div className="h-full w-2/5 rounded-full bg-sky-500" />
                        </div>
                        <div className="flex justify-between text-[10px] font-mono text-slate-400">
                          <span>0:42</span>
                          <span>3:15</span>
                        </div>
                      </div>

                      {/* Safe Zone Assessment */}
                      <div className="rounded-lg bg-slate-900 border border-slate-800 p-2.5 text-[11px] text-slate-300 font-mono flex items-center justify-between">
                        <span>Margen de Seguridad:</span>
                        <span className="text-emerald-400 font-bold">{coverData.specs.safeZone}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Technical Specifications Sheet (Medidas, Colores, Tipografías) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* 1. Medidas & Formato */}
                <div className="rounded-2xl border-2 border-slate-300 bg-white p-5 shadow-sm text-left">
                  <div className="flex items-center gap-2 border-b border-slate-200 pb-3 text-xs font-mono font-extrabold text-slate-900 uppercase">
                    <Maximize2 className="h-4 w-4 text-sky-600" />
                    <span>MEDIDAS & FORMATO TÉCNICO</span>
                  </div>
                  <div className="mt-3 space-y-2 text-xs font-mono">
                    <div className="flex justify-between border-b border-slate-100 pb-1.5">
                      <span className="text-slate-500">Dimensiones:</span>
                      <strong className="text-slate-900">{coverData.specs.dimensions}</strong>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-1.5">
                      <span className="text-slate-500">Resolución:</span>
                      <strong className="text-slate-900">{coverData.specs.resolution}</strong>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-1.5">
                      <span className="text-slate-500">Espacio de Color:</span>
                      <strong className="text-slate-900">{coverData.specs.colorSpace}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Formato de Salida:</span>
                      <strong className="text-slate-900">{coverData.specs.fileFormat}</strong>
                    </div>
                  </div>
                </div>

                {/* 2. Tipografía & Jerarquía Visual */}
                <div className="rounded-2xl border-2 border-slate-300 bg-white p-5 shadow-sm text-left">
                  <div className="flex items-center gap-2 border-b border-slate-200 pb-3 text-xs font-mono font-extrabold text-slate-900 uppercase">
                    <Type className="h-4 w-4 text-indigo-600" />
                    <span>TIPOGRAFÍA & JERARQUÍA</span>
                  </div>
                  <div className="mt-3 space-y-2 text-xs font-mono">
                    <div className="flex flex-col border-b border-slate-100 pb-1.5">
                      <span className="text-slate-500 text-[10px] uppercase">Fuente Recomendada Titular:</span>
                      <strong className="text-slate-900 truncate">{coverData.typography.titleFont}</strong>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-1.5">
                      <span className="text-slate-500">Tamaño del Título:</span>
                      <strong className="text-slate-900">{coverData.typography.titleSizePercent}</strong>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-1.5">
                      <span className="text-slate-500">Espaciado (Tracking):</span>
                      <strong className="text-slate-900">{coverData.typography.letterSpacing}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Ubicación:</span>
                      <strong className="text-slate-900 truncate">{coverData.typography.placement}</strong>
                    </div>
                  </div>
                </div>

              </div>

              {/* Paleta de Colores con Códigos HEX */}
              <div className="rounded-2xl border-2 border-slate-300 bg-white p-5 shadow-sm text-left">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div className="flex items-center gap-2 text-xs font-mono font-extrabold text-slate-900 uppercase">
                    <Palette className="h-4 w-4 text-amber-500" />
                    <span>PALETA DE COLOR OFICIAL (CÓDIGOS HEX)</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">Click en cualquier color para copiar HEX</span>
                </div>

                <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {coverData.colorPalette.map((color, idx) => (
                    <button
                      key={idx}
                      onClick={() => copyToClipboard(color.hex, `hex-${idx}`)}
                      className="group flex flex-col items-start rounded-xl border border-slate-200 bg-slate-50 p-3 hover:border-slate-400 transition-all text-left relative"
                    >
                      <div className="flex items-center justify-between w-full mb-2">
                        <div 
                          className="h-7 w-7 rounded-lg border border-slate-300 shadow-xs" 
                          style={{ backgroundColor: color.hex }}
                        />
                        {copiedKey === `hex-${idx}` ? (
                          <Check className="h-3.5 w-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-700" />
                        )}
                      </div>
                      <span className="font-mono text-xs font-extrabold text-slate-900">{color.hex}</span>
                      <span className="text-[10px] text-slate-600 font-medium leading-tight mt-0.5 line-clamp-1">{color.name}</span>
                      <span className="text-[9px] text-slate-400 mt-1 line-clamp-1">{color.role}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Master AI Prompts Tabs (Midjourney, DALL-E 3, Ideogram, Leonardo) */}
              <div className="rounded-2xl border-2 border-slate-800 bg-slate-900 p-6 text-white shadow-md text-left">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-sky-400" />
                    <div>
                      <h4 className="font-bold text-base font-display text-white">
                        PROMPT MAESTRO PARA GENERADORES DE IA
                      </h4>
                      <p className="text-xs text-slate-400 font-mono">
                        Copia y pega directamente en Midjourney, DALL-E o Ideogram
                      </p>
                    </div>
                  </div>

                  {/* Copy Active Prompt Button */}
                  <button
                    onClick={() => copyToClipboard(currentPrompt, 'active-prompt')}
                    className="studio-btn-metallic !py-2 !px-4 text-xs font-bold flex items-center gap-2 shrink-0 cursor-pointer"
                  >
                    {copiedKey === 'active-prompt' ? (
                      <>
                        <Check className="h-4 w-4 text-emerald-400" />
                        <span>¡Prompt Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 text-sky-400" />
                        <span>Copiar Prompt</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Generator Tabs */}
                <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
                  {[
                    { id: 'midjourney', label: 'Midjourney v6.1', badge: 'Recomendado' },
                    { id: 'dalle3', label: 'DALL-E 3 (ChatGPT)', badge: 'Detallado' },
                    { id: 'ideogram', label: 'Ideogram v2', badge: 'Con Tipografía' },
                    { id: 'leonardo', label: 'Leonardo / SDXL', badge: 'Fotorrealismo' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActivePromptTab(tab.id as any)}
                      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-mono font-bold transition-all shrink-0 ${
                        activePromptTab === tab.id
                          ? 'bg-sky-500 text-slate-950 shadow-xs'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      <span>{tab.label}</span>
                      <span className={`text-[9px] px-1 rounded ${activePromptTab === tab.id ? 'bg-sky-600 text-white' : 'bg-slate-900 text-slate-400'}`}>
                        {tab.badge}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Prompt Output Code Box */}
                <div className="mt-4 relative rounded-xl border border-slate-700 bg-slate-950 p-4 font-mono text-xs text-sky-200 leading-relaxed select-all overflow-x-auto">
                  {currentPrompt}
                </div>

                {/* Spotify Canvas Tip */}
                {coverData.spotifyCanvasTip && (
                  <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 flex items-start gap-3 text-xs text-slate-300">
                    <Tv className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-mono text-emerald-400 uppercase text-[10px] block mb-0.5">
                        TIP PARA SPOTIFY CANVAS (9:16 VERTICAL 1080×1920):
                      </strong>
                      <p className="font-sans text-slate-300">{coverData.spotifyCanvasTip}</p>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="rounded-2xl border-2 border-dashed border-slate-300 p-12 text-center text-slate-500">
              <Sparkles className="mx-auto h-8 w-8 text-slate-400 animate-spin mb-3" />
              <p className="font-mono text-sm font-bold">Generando dirección de arte...</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
