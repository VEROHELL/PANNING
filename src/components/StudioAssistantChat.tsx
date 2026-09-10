import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  X, 
  Sliders, 
  Check, 
  Copy, 
  ShieldCheck, 
  Activity, 
  Flame, 
  Music, 
  Volume2,
  Cpu,
  Clock,
  Wand2,
  Radio,
  Trash2,
  Download,
  AlertTriangle,
  Zap,
  Mic,
  Gauge,
  CheckCircle2
} from 'lucide-react';
import { AnalysisReport } from '../types';

export interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  source?: 'gemini' | 'smart-local-engine';
}

interface StudioAssistantChatProps {
  report: AnalysisReport;
  isOpen: boolean;
  onClose: () => void;
}

export const StudioAssistantChat: React.FC<StudioAssistantChatProps> = ({
  report,
  isOpen,
  onClose,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'extension' | 'prompts' | 'daws' | 'mixing' | 'viral'>('all');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [toastNotice, setToastNotice] = useState<{ title: string; subtitle: string } | null>(null);
  
  // Audio AI Prompt & Duration Extension Studio State
  const [isPromptStudioOpen, setIsPromptStudioOpen] = useState(false);
  const [selectedTargetTool, setSelectedTargetTool] = useState<'suno' | 'musiclm' | 'udio' | 'all'>('suno');
  const [selectedDuration, setSelectedDuration] = useState<'2:45' | '2:55' | '3:15' | '3:30'>('2:55');
  const [lockHarmonics, setLockHarmonics] = useState(true);
  const [lockGroove, setLockGroove] = useState(true);
  const [includeAESMasterChain, setIncludeAESMasterChain] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const durationSec = Math.round(report?.metadata?.duration || 120);
  const durationMin = Math.floor(durationSec / 60);
  const durationRemSec = durationSec % 60;
  const formattedDuration = `${durationMin}:${durationRemSec.toString().padStart(2, '0')}`;
  const isShort = durationSec < 135;

  // Trigger floating visual toast notification
  const showToast = useCallback((title: string, subtitle: string) => {
    setToastNotice({ title, subtitle });
    setTimeout(() => {
      setToastNotice((prev) => (prev?.title === title ? null : prev));
    }, 3200);
  }, []);

  // Safe track-specific storage key for conversation persistence
  const storageKey = useMemo(() => {
    const safeName = (report?.metadata?.fileName || 'default_track').replace(/[^a-zA-Z0-9_-]/g, '_');
    return `panning_studio_chat_${safeName}`;
  }, [report?.metadata?.fileName]);

  // Generates the initial dynamic technical welcome message based on the real report data
  const createWelcomeMessage = useCallback((): Message => {
    const topAlert = report?.frequencyAlerts?.[0];
    const topAlertStr = topAlert 
      ? `• **${topAlert.bandName}**: ${topAlert.detectedIssue} (${topAlert.gainAdjustment})` 
      : '• **Sub-Bass 32Hz**: Requiere corte quirúrgico de headroom.';

    const welcomeText = `¡Hola, hermano! Qué gusto saludarte. Soy tu **Productor Musical Ejecutivo & Ingeniero Acústico AES** para tu proyecto **"${report.metadata.fileName}"**.

He auditado todo el espectro acústico de tu canción en **${report.metadata.detectedGenre}** (${report.metadata.estimatedBpm} BPM, en tonalidad **${report.metadata.detectedKey}**). Tu track tiene una puntuación base de **${report.commercialScore}/100** con un potencial optimizado de **${report.potentialBoostedScore}/100**.

---

### 🎛️ Diagnóstico Rápido de tu Sesión:
1. ⏱️ **Duración & Estructura (${formattedDuration}):** ${
      isShort 
        ? '🚨 **Alerta de Streaming:** Tu audio dura ' + formattedDuration + ' (' + durationSec + 's). Es corto para playlists comerciales. Te ayudo a expandirlo a **2:55 min** con segundo verso y puente.' 
        : '✅ **Duración estándar** (' + formattedDuration + '), lista para master radial/club.'
    }
2. 🤖 **Prompt Google MusicLM / Suno:** Genera con 1-clic prompts de alta fidelidad con **Coherencia Armónica** bloqueada en ${report.metadata.detectedKey} y **Extensión de Duración**.
3. 🔊 **Frecuencia Prioritaria:** ${topAlertStr}
4. 🎚️ **Loudness Actual:** **${report.lufsIntegrated} LUFS** | **${report.truePeakDb} dBTP** (Objetivo: -9.0 LUFS / -1.0 dBTP).

¿Qué te gustaría resolver primero? Puedes usar los botones de acceso rápido aquí abajo o hacerme cualquier consulta técnica sobre tu DAW o mezcla.`;

    return {
      id: 'welcome-' + Date.now(),
      sender: 'assistant',
      text: welcomeText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  }, [report, formattedDuration, isShort, durationSec]);

  // Load persistent conversation from localStorage on track change or initial mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
          return;
        }
      }
      // If no stored chat exists for this track, initialize with the dynamic technical welcome message
      const initialWelcome = createWelcomeMessage();
      setMessages([initialWelcome]);
      localStorage.setItem(storageKey, JSON.stringify([initialWelcome]));
    } catch (e) {
      console.warn('Error loading chat history from localStorage:', e);
      const initialWelcome = createWelcomeMessage();
      setMessages([initialWelcome]);
    }
  }, [storageKey, createWelcomeMessage]);

  // Persist messages whenever state updates
  useEffect(() => {
    if (messages.length > 0) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(messages));
      } catch (e) {
        console.warn('Error saving chat history to localStorage:', e);
      }
    }
  }, [messages, storageKey]);

  // Auto-scroll when messages change or while typing
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isOpen]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
    }
  }, [isOpen]);

  const handleClearHistory = () => {
    const newWelcome = createWelcomeMessage();
    setMessages([newWelcome]);
    try {
      localStorage.setItem(storageKey, JSON.stringify([newWelcome]));
    } catch (e) {
      console.warn(e);
    }
    setShowClearConfirm(false);
  };

  const handleExportNotes = () => {
    const textContent = messages
      .map(m => `[${m.timestamp}] ${m.sender === 'assistant' ? 'PRODUCTOR IA' : 'ARTISTA'}:\n${m.text}\n`)
      .join('\n----------------------------------------\n\n');

    navigator.clipboard.writeText(textContent);
    showToast('¡Historial copiado!', 'Todas las notas técnicas fueron copiadas al portapapeles');
  };

  // Instant Copy Helper with UI Feedback and Toast
  const copyToClipboard = (text: string, id: string, customNotice?: { title: string; subtitle: string }) => {
    navigator.clipboard.writeText(text);
    setCopiedCodeId(id);
    showToast(
      customNotice?.title || '¡Copiado al portapapeles!',
      customNotice?.subtitle || 'Prompt técnico listo para pegar en tu IA de audio'
    );
    setTimeout(() => {
      setCopiedCodeId((prev) => (prev === id ? null : prev));
    }, 2500);
  };

  // Build the instant client-side Audio AI prompt from report data with duration extension & harmonic coherence
  const generatedAudioAIPrompts = useMemo(() => {
    const fileName = report.metadata.fileName || 'Pista de Estudio';
    const genre = report.metadata.detectedGenre || 'Latin Urban';
    const bpm = report.metadata.estimatedBpm || 98;
    const key = report.metadata.detectedKey || 'F Minor';

    const harmonicLockRule = lockHarmonics 
      ? `• Root Key Lock: Mantener estrictamente la escala y progresión armónica en ${key} (sin desviaciones tonales en Verso 2 ni en el Puente).` 
      : `• Tonalidad recomendada: ${key}.`;

    const grooveRule = lockGroove
      ? `• Grid Rítmico: Sincronización fija a ${bpm} BPM con groove de batería 4/4 y sidechain ducking de 4dB.`
      : `• Tempo: ${bpm} BPM.`;

    const masterSpecs = includeAESMasterChain
      ? `• Masterización AES: 24-bit 48kHz, High-Pass 32Hz (48dB/oct), Bolsillo vocal en 2.4kHz, Sub-Bass mono (<120Hz), SSL 4000G Bus Compressor, -9.0 LUFS integrado y True Peak -1.0 dBTP.`
      : `• Master: -9.0 LUFS, -1.0 dBTP.`;

    // 1. Google MusicLM / MusicFX Prompt
    const musicLMPrompt = `A high-fidelity studio recording of a ${genre} track titled "${fileName}". Tempo: ${bpm} BPM strictly locked in the harmonic key of ${key}. Produced in an acoustic mastering studio with SSL 4000G analog console warmth. Punchy transient drums, deep sub-bass strictly in mono below 120Hz, warm analog synthesizers, dynamic percussion, and upfront clear lead vocals with a 2.4kHz harmonic clarity pocket. Extended arrangement lasting ${selectedDuration} minutes maintaining absolute harmonic coherence in ${key}: atmospheric opening ambient pads with vinyl texture [0:00-0:12], steady melodic verse groove [0:12-0:36], intense pre-chorus snare build-up [0:36-0:48], massive anthemic chorus drop with wide stereo vocal stacks [0:48-1:15], followed by a dynamic second verse with hi-hat variation [1:15-1:40], an emotional melodic bridge with spatial reverb [1:40-2:18], and a powerful stadium chorus climax before a clean reverb tail outro [2:18-${selectedDuration}]. Mastered to AES commercial standards (-9.0 LUFS, -1.0 dBTP, pristine 24-bit audio without distortion).`;

    // 2. Suno v3.5 / v4 Style Prompt
    const sunoStylePrompt = `master studio quality, ${genre}, latin urban radio hit, ${bpm} bpm, key of ${key}, analog ssl warmth, clean 808 bass, crisp snare transients, upfront charismatic vocals, wide stereo chorus, punchy sidechain, harmonic coherence in ${key}, extended ${selectedDuration} radio mix, 24-bit 48khz, -9 lufs master, high-pass 32hz`;

    // 3. Suno Lyrics & Arrangement Structure with Harmonic Directives
    const sunoLyricsStructure = `[Meta: Tempo ${bpm} BPM, Key ${key}, High-Fidelity Studio Master, Duration ${selectedDuration}, Harmonic Coherence Locked]
[Instrumental: High-Pass 32Hz, Punchy Kick, Warm Analog Synth Chords in ${key}]

[Intro - 0:00 to 0:12]
(Atmospheric synth pad swells, filtered beat, distant vocal chop in ${key})
Sube la vibra... es el momento de romperla...

[Verse 1 - 0:12 to 0:36]
(Direct dry vocals in center, deep bass groove, rhythmic syncopated percussion)
Caminando en la ciudad bajo las luces de neón,
cada paso que tú das me cambia la dirección.
Tengo el ritmo en las venas y la mente encendida,
esta noche no hay excusas para darte la vida.

[Pre-Chorus - 0:36 to 0:48]
(Rising snare roll, synth filter opens up, vocal pitch climbs in ${key})
Siento la frecuencia que empieza a subir,
ya no queda tiempo para resistir.
(Un segundo de silencio pre-drop... 💥)

[Chorus Drop - 0:48 to 1:15 - MAIN HOOK]
(Full 808 bass drop, explosive drums, wide stereo vocal stack, anthemic energy)
¡Dime que sí, que la noche es de los dos!
Báilalo fuerte, que se escuche mi voz.
Fuego en el beat, la energía en el top,
este es el sonido que nunca hace stop.

[Verse 2 - 1:15 to 1:40 - EXTENSIÓN ARMÓNICA & VARIACIÓN RÍTMICA]
(Drum groove variation with hi-hat rolls, tighter bass rhythm in ${key}, energetic delivery)
La pista está que arde y el segundero no espera,
tú te pegas suave rompiendo la barrera.
Con ${bpm} BPM subiendo la temperatura,
esta química en el aire es una locura pura.

[Pre-Chorus 2 - 1:40 to 1:52]
(Tension builds higher, octave-up vocal harmonies, rising sub sweep)
La señal es clara, no mires atrás,
cuando suene el bombo tú te pegas más.

[Chorus 2 - 1:52 to 2:18 - MAXIMUM ENERGY]
(Explosive drop, full instrumental force, lead vocals + bright ad-libs)
¡Dime que sí, que la noche es de los dos!
Báilalo fuerte, que se escuche mi voz.
Fuego en el beat, la energía en el top,
este es el sonido que nunca hace stop.

[Bridge - 2:18 to 2:38 - PUENTE MELÓDICO & ESPACIAL]
(Drums drop out, lush reverberated piano chords in ${key}, emotional vocal line)
Si el tiempo se detiene cuando estás aquí...
todo este universo lo hice para ti.
(Drum build returns with rapid fills...)

[Chorus Climax - 2:38 to 2:50 - FINAL STADIUM FINISH]
(Full maximum impact, all layers active, soaring backing vocals, heavy 808)
¡Dime que sí, que la noche es de los dos!
Fuego en el beat... ¡este es nuestro hit!

[Outro - 2:50 to ${selectedDuration}]
(Clean decaying synth tail in ${key}, tight drum fill, reverb fade-out)
Armored Bass Studio Master.
[Fade Out]
[End]`;

    // 4. Udio v1.5 Prompt
    const udioPrompt = `[Genre: ${genre}], [Style: Latin Urban, Modern Pop, Club Radio Hit], [Tempo: ${bpm} BPM], [Key: ${key}], [Production: Studio Master, SSL 4000G Bus, Crisp 24-bit 48kHz, High-Pass 32Hz, Punchy Sidechain Kick-Bass, Wide Stereo Chorus Doubles, Zero Muddy Low-Mids, Air Shelf at 12kHz, Harmonic Coherence Lock in ${key}], [Arrangement: Extended ${selectedDuration} min, [Intro], [Verse 1], [Pre-Chorus], [Chorus Drop], [Verse 2], [Bridge], [Chorus Climax], [Outro]], [Vocal: Upfront lead vocals, charismatic delivery, pitch-perfect autotune formant, wide octave harmonies].`;

    // 5. Universal Multi-IA Master Prompt
    const universalPrompt = `[PROMPT MAESTRO BLINDADO // SUITE MULTI-IA]
PROYECTO: "${fileName}"
GÉNERO: ${genre}
TEMPO: ${bpm} BPM (Bloqueo de grilla rítmica)
TONALIDAD: ${key} (Bloqueo armónico estricto)
DURACIÓN OBJETIVO: ${selectedDuration} minutos (Extensión armónica desde ${formattedDuration})

--- REGLAS DE COHERENCIA ARMÓNICA & EXPANSIÓN ---
${harmonicLockRule}
${grooveRule}
${masterSpecs}

--- ESTRUCTURA EXTENDIDA (${selectedDuration} MIN) ---
1. [0:00 - 0:12] INTRO: Swells de sintetizador con atmósfera filtrada en ${key}.
2. [0:12 - 0:36] VERSO 1: Bombo y voz principal seca al centro con bajo sutil.
3. [0:36 - 0:48] PRE-CORO: Subida de tensión con redoble de snares y corte pre-drop.
4. [0:48 - 1:15] CORO DROP: Clímax con 808 potente, voces estéreo y gancho melódico.
5. [1:15 - 1:40] VERSO 2: Variación rítmica con hi-hats rápidos manteniendo la armonía en ${key}.
6. [1:40 - 1:52] PRE-CORO 2: Tensión en octava alta.
7. [1:52 - 2:18] CORO 2: Energía máxima con ad-libs vocales.
8. [2:18 - 2:38] PUENTE EMOCIONAL: Batería fuera, acordes de piano espaciales en ${key}.
9. [2:38 - 2:50] CLÍMAX FINAL: Todos los instrumentos activos.
10. [2:50 - ${selectedDuration}] OUTRO: Decaimiento de reverb limpio y acorde final.`;

    return {
      musicLMPrompt,
      sunoStylePrompt,
      sunoLyricsStructure,
      udioPrompt,
      universalPrompt,
    };
  }, [report, selectedDuration, lockHarmonics, lockGroove, includeAESMasterChain, formattedDuration]);

  const handleSendCustomPromptToChat = async () => {
    setIsPromptStudioOpen(false);
    const toolName = selectedTargetTool === 'musiclm' ? 'Google MusicLM / MusicFX' : selectedTargetTool === 'suno' ? 'Suno AI (v3.5 / v4)' : selectedTargetTool === 'udio' ? 'Udio v1.5' : 'Suite Multi-IA Universal';

    const customPromptRequest = `Genera y asesórame sobre el prompt técnico profesional para ${toolName} para mi pista "${report.metadata.fileName}" (${report.metadata.estimatedBpm} BPM en ${report.metadata.detectedKey}). Requiero una versión extendida de ${selectedDuration} minutos con preservación armónica estricta y calidad de estudio (-9 LUFS / High-Pass 32Hz).`;

    await handleSend(customPromptRequest);
  };

  const quickActionPrompts = [
    {
      category: 'prompts',
      icon: Wand2,
      title: 'Prompt Google MusicLM / MusicFX',
      prompt: `Por favor genera el Prompt Maestro detallado para Google MusicLM (y MusicFX) para recrear mi canción "${report.metadata.fileName}" analizando su tonalidad ${report.metadata.detectedKey}, tempo de ${report.metadata.estimatedBpm} BPM y género ${report.metadata.detectedGenre}, especificando una versión más larga (2:55 min) y de alta fidelidad orientada a estudio profesional.`,
      color: 'text-sky-800 bg-sky-50 border-sky-300 hover:bg-sky-100',
    },
    {
      category: 'prompts',
      icon: Music,
      title: 'Prompt Suno AI (Custom Mode & Letra)',
      prompt: `Genera el prompt profesional para Suno AI v3.5/v4 en Custom Mode para "${report.metadata.fileName}" (${report.metadata.estimatedBpm} BPM en ${report.metadata.detectedKey}). Incluye el Style Prompt y la estructura lírica completa de 2:55 minutos con etiquetas [Verse 1], [Pre-Chorus], [Chorus Drop], [Verse 2], [Bridge] y [Outro] con especificaciones acústicas de estudio.`,
      color: 'text-amber-800 bg-amber-50 border-amber-300 hover:bg-amber-100',
    },
    {
      category: 'prompts',
      icon: Radio,
      title: 'Prompt Udio v1.5 (High-Fidelity)',
      prompt: `Genera el prompt de estudio de alta fidelidad para Udio v1.5 basado en "${report.metadata.fileName}" a ${report.metadata.estimatedBpm} BPM en ${report.metadata.detectedKey} con especificaciones de masterización analógica y duración extendida.`,
      color: 'text-purple-800 bg-purple-50 border-purple-300 hover:bg-purple-100',
    },
    {
      category: 'extension',
      icon: Clock,
      title: '¿Necesita ser más larga? (Duración)',
      prompt: `Analiza la duración de mi canción "${report.metadata.fileName}" (${formattedDuration}). ¿Necesita ser más larga para Spotify y radio? Dime exactamente cuántos segundos o minutos le faltan y qué partes agregar (segundo verso, puente, coro extendido).`,
      color: 'text-emerald-800 bg-emerald-50 border-emerald-300 hover:bg-emerald-100',
    },
    {
      category: 'prompts',
      icon: ShieldCheck,
      title: 'Prompt Universal Multi-IA Blindado',
      prompt: `Por favor genera el Prompt Maestro Blindado y Ultra-Detallado para dárselo a otra IA (Suno / Udio / MusicLM / RipX) con todas las correcciones acústicas de mi canción "${report.metadata.fileName}" sin que deforme la melodía, letra ni BPM original.`,
      color: 'text-blue-800 bg-blue-50 border-blue-300 hover:bg-blue-100',
    },
    {
      category: 'daws',
      icon: Sliders,
      title: 'Paso a Paso en FL Studio',
      prompt: `Explícame con paciencia y paso a paso cómo arreglar cada falla acústica de mi canción en FL Studio (corte a 32Hz en Parametric EQ 2, gancho vocal en 2.4kHz, sidechain kick-bajo y limitador True Peak a -9 LUFS).`,
      color: 'text-orange-800 bg-orange-50 border-orange-300 hover:bg-orange-100',
    },
    {
      category: 'daws',
      icon: Radio,
      title: 'Paso a Paso en Ableton Live',
      prompt: `Explícame con paciencia y detalle cómo aplicar todas las mejoras de mi análisis en Ableton Live (EQ Eight, Glue Compressor, Utility mono sub y limitador).`,
      color: 'text-teal-800 bg-teal-50 border-teal-300 hover:bg-teal-100',
    },
    {
      category: 'daws',
      icon: Radio,
      title: 'Paso a Paso en Logic Pro X',
      prompt: `Explícame con paciencia y paso a paso cómo aplicar las correcciones de "${report.metadata.fileName}" en Logic Pro X usando Channel EQ, Direction Mixer para mono sub, Vintage VCA Compressor para sidechain y Adaptive Limiter.`,
      color: 'text-indigo-800 bg-indigo-50 border-indigo-300 hover:bg-indigo-100',
    },
    {
      category: 'mixing',
      icon: Activity,
      title: '¿Por qué cortar a 32Hz?',
      prompt: `¿Por qué y para qué debo cortar por debajo de 32Hz en mi mezcla? Explícame el beneficio acústico y cómo hacerlo.`,
      color: 'text-slate-800 bg-slate-100 border-slate-300 hover:bg-slate-200',
    },
    {
      category: 'mixing',
      icon: Volume2,
      title: '¿Cómo llegar a -9 LUFS y -1.0 dBTP?',
      prompt: `¿Cómo alcanzo -9.0 LUFS integrados y -1.0 dBTP en mi master final sin que la batería pierda pegada ni distorsione en Spotify?`,
      color: 'text-violet-800 bg-violet-50 border-violet-300 hover:bg-violet-100',
    },
    {
      category: 'mixing',
      icon: Mic,
      title: 'Voz al frente & Corte en 2.4kHz',
      prompt: `Explícame cómo aplicar el truco de producción vocal en 2.4kHz y el de-essing para que mi voz suene al frente de la mezcla con claridad comercial.`,
      color: 'text-pink-800 bg-pink-50 border-pink-300 hover:bg-pink-100',
    },
    {
      category: 'viral',
      icon: Flame,
      title: 'Estrategia Viral TikTok & Reels',
      prompt: `Dame el paquete completo de éxito viral para "${report.metadata.fileName}": 1. Guión exacto para el video de TikTok en el segundo ${report.audience.bestTikTokCut.formattedRange}, 2. SEO y hashtags para Spotify/YouTube, 3. Opciones de títulos comerciales, y 4. Consejo de gancho melódico.`,
      color: 'text-rose-800 bg-rose-50 border-rose-300 hover:bg-rose-100',
    },
    {
      category: 'viral',
      icon: Gauge,
      title: `Subir de ${report.commercialScore} a ${report.potentialBoostedScore} pts`,
      prompt: `Dame la hoja de ruta priorizada para elevar la puntuación comercial de mi canción de ${report.commercialScore}/100 a ${report.potentialBoostedScore}/100 puntos.`,
      color: 'text-emerald-800 bg-emerald-50 border-emerald-300 hover:bg-emerald-100',
    },
  ];

  const filteredPrompts = selectedCategory === 'all' 
    ? quickActionPrompts 
    : quickActionPrompts.filter(p => p.category === selectedCategory);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputValue;
    if (!text.trim() || isTyping) return;

    const userMsg: Message = {
      id: 'user-' + Date.now().toString(),
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    if (!textToSend) setInputValue('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text.trim(),
          history: newHistory.map((m) => ({ sender: m.sender, text: m.text })),
          report,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error en el servidor: ${response.status}`);
      }

      const data = await response.json();
      const replyText = data.reply || 'No se pudo obtener la respuesta del asistente acústico.';

      const assistantMsg: Message = {
        id: 'assistant-' + Date.now().toString(),
        sender: 'assistant',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: data.source,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.warn('Fallback to local intelligent response:', err);
      
      const lower = text.toLowerCase();
      let fallbackText = '';

      if (lower.includes('larga') || lower.includes('duracion') || lower.includes('duración') || lower.includes('tiempo')) {
        fallbackText = `¡Hola hermano! Con respecto a la duración de **"${report.metadata.fileName}"** (${formattedDuration}):\n\n${durationSec < 135 ? `🚨 **SÍ, TU ROLA NECESITA SER MÁS LARGA.** Con ${formattedDuration} (${durationSec}s), los algoritmos de Spotify la catalogan como un snippet/demo. Te recomiendo extenderla a **2:45 - 3:05 minutos** agregando un Verso 2, un Puente instrumental y un Coro Final explosivo.` : `✅ **TU DURACIÓN ESTÁ EN RANGO ÓPTIMO** (${formattedDuration}), perfecta para streaming comercial.`}\n\nSi quieres recrearla idéntica pero en versión de 3 minutos con coherencia armónica, abre el botón **"Generador Prompts IA"** arriba a la derecha.`;
      } else if (lower.includes('google') || lower.includes('flow') || lower.includes('recrear') || lower.includes('suno') || lower.includes('musiclm')) {
        fallbackText = `¡Totalmente, hermano! Como Google MusicLM o Suno no pueden editar un audio externo sin dañarlo, aquí tienes el **Prompt de Recreación Total y Extensión de Estudio** con **Coherencia Armónica** garantizada:\n\n\`\`\`prompt\n[GENRE & STYLE]: Master Studio ${report.metadata.detectedGenre}, Latin Urban Hit, Analog Warmth\n[TEMPO & KEY]: ${report.metadata.estimatedBpm} BPM, Key of ${report.metadata.detectedKey}, 4/4 Time Signature\n[HARMONIC COHERENCE]: Root key strictly locked in ${report.metadata.detectedKey}, no chromatic drifting\n[ACOUSTIC SPECS]: 24-bit 48kHz, High-Pass 32Hz, Sidechain Kick-Bass, Wide Stereo Chorus, Master Loudness -9.0 LUFS, True Peak -1.0 dBTP\n[DURATION]: Full Extended 2:55 arrangement\n[STRUCTURE]: [Intro 0:00-0:12] -> [Verse 1 0:12-0:36] -> [Pre-Chorus 0:36-0:48] -> [Chorus Drop 0:48-1:12] -> [Verse 2 1:12-1:36] -> [Bridge 1:36-2:10] -> [Final Chorus 2:10-2:45] -> [Outro 2:45-2:55]\n\`\`\`\n\n¡Copia este bloque con el botón de 1-clic y pégalo directamente en la IA para obtener la rola completa y en máxima calidad!`;
      } else {
        fallbackText = `¡Hola hermano! Qué alegría saludarte. Te comprendo perfectamente y aquí estoy para apoyarte paso a paso con tu tema **"${report.metadata.fileName}"** (${formattedDuration}, ${report.metadata.estimatedBpm} BPM en ${report.metadata.detectedKey}).\n\n1. **Corte a 32Hz (High-Pass 24dB/oct):** Elimina el rumble inaudible en el Master para ganar +3dB de pegada limpia.\n2. **Separación Vocal (2.4 kHz):** Reduce -2.0 dB en los sintetizadores/guitarras para que tu voz brille al frente.\n3. **Sidechain Kick-Bajo:** Ducking de 4dB con 60ms de release para evitar choques de fase en el coro.\n4. **Mastering Final:** -9.0 LUFS integrados con True Peak fijado en -1.0 dBTP.\n\n¿Quieres que analicemos la duración o que te pase el prompt para recrearla en Google MusicLM o Suno?`;
      }

      const fallbackMsg: Message = {
        id: 'assistant-fallback-' + Date.now().toString(),
        sender: 'assistant',
        text: fallbackText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: 'smart-local-engine',
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  // Helper to parse markdown blocks including code snippets with 1-click copy button
  const renderMessageContent = (text: string, msgId: string) => {
    const parts = text.split(/(```[\s\S]*?```)/g);

    return parts.map((part, index) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const lines = part.slice(3, -3).trim().split('\n');
        const firstLine = lines[0].trim();
        const isLanguage = ['text', 'prompt', 'bash', 'json', 'yaml', 'flstudio', 'ableton', 'logic'].includes(firstLine.toLowerCase());
        const codeContent = isLanguage ? lines.slice(1).join('\n') : lines.join('\n');
        const codeBlockId = `${msgId}-code-${index}`;
        const isCopied = copiedCodeId === codeBlockId;

        return (
          <div key={index} className="my-3 rounded-xl border-2 border-slate-700 bg-slate-950 overflow-hidden shadow-xl font-mono text-xs">
            <div className="flex items-center justify-between bg-slate-900 px-3.5 py-2.5 border-b border-slate-800 text-slate-300">
              <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[11px] text-sky-400">
                <Cpu className="h-3.5 w-3.5" />
                PROMPT TÉCNICO // 1-CLIC PARA PEGAR
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard(codeContent, codeBlockId, {
                  title: '¡Prompt copiado al portapapeles!',
                  subtitle: 'Listo para pegar en Suno, MusicLM o Udio'
                })}
                className={`flex items-center gap-1.5 rounded-lg border px-3 py-1 text-[11px] font-bold transition-all shadow-xs cursor-pointer ${
                  isCopied
                    ? 'border-emerald-400 bg-emerald-950/90 text-emerald-300 ring-2 ring-emerald-500/40'
                    : 'border-slate-700 bg-slate-800 text-white hover:bg-slate-700 hover:border-sky-400'
                }`}
              >
                {isCopied ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
                    <span className="text-emerald-300">¡Copiado al Portapapeles!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 text-sky-300" />
                    <span>Copiar Prompt Completo</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-4 text-sky-100 overflow-x-auto whitespace-pre-wrap leading-relaxed select-all">
              {codeContent}
            </pre>
          </div>
        );
      }

      // Format standard paragraphs and bold text
      return (
        <div key={index} className="space-y-2">
          {part.split('\n\n').map((paragraph, pIdx) => {
            if (paragraph.startsWith('### ')) {
              return (
                <h4 key={pIdx} className="font-bold text-sm sm:text-base text-slate-900 font-display border-b border-slate-200 pb-1 mt-3">
                  {paragraph.replace('### ', '')}
                </h4>
              );
            }
            if (paragraph.startsWith('## ')) {
              return (
                <h3 key={pIdx} className="font-extrabold text-base text-slate-950 font-display border-b-2 border-slate-300 pb-1 mt-4">
                  {paragraph.replace('## ', '')}
                </h3>
              );
            }
            if (paragraph.trim() === '---') {
              return <hr key={pIdx} className="border-slate-200 my-2" />;
            }
            return (
              <p key={pIdx} className="leading-relaxed">
                {paragraph.split('**').map((chunk, cIdx) =>
                  cIdx % 2 === 1 ? (
                    <strong key={cIdx} className="font-bold text-slate-900">
                      {chunk}
                    </strong>
                  ) : (
                    chunk
                  )
                )}
              </p>
            );
          })}
        </div>
      );
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-2 sm:p-4 backdrop-blur-md animate-fade-in">
      {/* Floating Copy Toast Indicator */}
      {toastNotice && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 rounded-xl bg-slate-900/95 border-2 border-emerald-400/80 px-4 py-2.5 text-white shadow-2xl animate-fade-in backdrop-blur-md">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 animate-pulse shrink-0" />
          <div className="text-left">
            <div className="text-xs font-bold text-emerald-300 font-display">{toastNotice.title}</div>
            <div className="text-[11px] text-slate-300 font-mono">{toastNotice.subtitle}</div>
          </div>
        </div>
      )}

      <div className="relative flex h-full max-h-[92vh] w-full max-w-4xl flex-col rounded-2xl border-2 border-slate-800 bg-white shadow-2xl overflow-hidden">
        
        {/* Chat Window Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950 px-4 py-3 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-md">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base font-display text-sky-300">
                  Productor Ejecutivo & Asistente Acústico IA
                </h3>
                <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                  ONLINE AES
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5 truncate max-w-xs sm:max-w-md">
                <span>Pista: <strong>{report.metadata.fileName}</strong></span>
                <span>•</span>
                <span>{report.metadata.estimatedBpm} BPM ({report.metadata.detectedKey})</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Prompt Studio & Duration Extender Toggle Button */}
            <button
              type="button"
              onClick={() => setIsPromptStudioOpen(!isPromptStudioOpen)}
              className={`flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs font-bold transition-all shadow-sm cursor-pointer ${
                isPromptStudioOpen
                  ? 'border-sky-400 bg-sky-500/30 text-sky-200 ring-2 ring-sky-400/50'
                  : 'border-sky-500/60 bg-gradient-to-r from-sky-950 via-blue-950 to-indigo-950 text-sky-300 hover:border-sky-400 hover:text-white'
              }`}
              title="Abrir la herramienta interactiva de Generación de Prompts y Extensión de Duración"
            >
              <Wand2 className="h-3.5 w-3.5 text-sky-400 animate-pulse" />
              <span className="hidden sm:inline">Generador Prompts IA</span>
              <span className="sm:hidden">Prompts IA</span>
            </button>

            {/* Clear History Button */}
            <button
              type="button"
              onClick={() => setShowClearConfirm(true)}
              className="flex h-8 items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-2.5 text-xs text-slate-300 hover:bg-slate-700 hover:text-rose-300 transition-colors cursor-pointer"
              title="Reiniciar conversación y diagnóstico"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Reiniciar</span>
            </button>

            {/* Export Summary Button */}
            <button
              type="button"
              onClick={handleExportNotes}
              className="flex h-8 items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-2.5 text-xs text-slate-300 hover:bg-slate-700 hover:text-white transition-colors cursor-pointer"
              title="Copiar historial completo al portapapeles"
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Exportar</span>
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors cursor-pointer"
              title="Cerrar Asistente (La conversación queda guardada)"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Audio AI Prompt & Duration Extender Studio Interactive Tool Panel */}
        {isPromptStudioOpen && (
          <div className="border-b-2 border-sky-500/40 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 sm:p-5 text-white animate-fade-in shadow-2xl overflow-y-auto max-h-[70vh]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/40">
                  <Wand2 className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm sm:text-base text-sky-200 font-display flex items-center gap-2">
                    Herramienta de Prompts Técnicos & Extensión de Duración
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-mono">
                      1-CLIC READY
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Calcula prompts de estudio para Suno, MusicLM y Udio basados en el espectro real de <strong className="text-sky-300">"{report.metadata.fileName}"</strong>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPromptStudioOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Configurator Controls Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mb-4">
              
              {/* 1. Target AI Tool */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono font-bold text-sky-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Cpu className="h-3.5 w-3.5 text-sky-400" />
                  1. Herramienta IA Destino:
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { id: 'suno', label: 'Suno AI (v3.5/v4)', desc: 'Custom & Letra' },
                    { id: 'musiclm', label: 'Google MusicLM', desc: 'Audio continuo' },
                    { id: 'udio', label: 'Udio v1.5', desc: 'Studio Tags' },
                    { id: 'all', label: 'Suite Multi-IA', desc: 'Formato Universal' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setSelectedTargetTool(t.id as any)}
                      className={`px-2.5 py-1.5 rounded-lg text-left text-xs border transition-all cursor-pointer ${
                        selectedTargetTool === t.id
                          ? 'border-sky-400 bg-sky-950/90 text-sky-200 font-bold shadow-sm ring-1 ring-sky-400/50'
                          : 'border-slate-800 bg-slate-900/80 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <div className="font-semibold">{t.label}</div>
                      <div className="text-[9px] text-slate-400 font-mono">{t.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Target Duration & Expansion Option */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-emerald-400" />
                  2. Extensión ({formattedDuration} ➔ {selectedDuration}):
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { id: '2:45', label: '2:45 min', desc: 'Radio Spotify' },
                    { id: '2:55', label: '2:55 min', desc: 'Estructura Hit' },
                    { id: '3:15', label: '3:15 min', desc: 'Club Extended' },
                    { id: '3:30', label: '3:30 min', desc: 'Master Épico' },
                  ].map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setSelectedDuration(d.id as any)}
                      className={`px-2.5 py-1.5 rounded-lg text-left text-xs border transition-all cursor-pointer ${
                        selectedDuration === d.id
                          ? 'border-emerald-400 bg-emerald-950/90 text-emerald-200 font-bold shadow-sm ring-1 ring-emerald-400/50'
                          : 'border-slate-800 bg-slate-900/80 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <div className="font-semibold">{d.label}</div>
                      <div className="text-[9px] text-slate-400 font-mono">{d.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Harmonic Coherence & Acoustic Signature Directives */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-2.5 text-xs font-mono space-y-2">
                <div className="text-[10px] font-bold text-amber-300 uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Activity className="h-3.5 w-3.5 text-amber-400" />
                    COHERENCIA ARMÓNICA & ESTUDIO:
                  </span>
                  <span className="text-[9px] text-sky-300 font-bold">{report.metadata.detectedKey}</span>
                </div>
                <div className="space-y-1.5 text-[11px]">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
                    <input
                      type="checkbox"
                      checked={lockHarmonics}
                      onChange={(e) => setLockHarmonics(e.target.checked)}
                      className="rounded border-slate-700 bg-slate-800 text-sky-500 focus:ring-sky-400"
                    />
                    <span>Bloqueo armónico en <strong>{report.metadata.detectedKey}</strong></span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
                    <input
                      type="checkbox"
                      checked={lockGroove}
                      onChange={(e) => setLockGroove(e.target.checked)}
                      className="rounded border-slate-700 bg-slate-800 text-sky-500 focus:ring-sky-400"
                    />
                    <span>Grid de tempo a <strong>{report.metadata.estimatedBpm} BPM</strong></span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
                    <input
                      type="checkbox"
                      checked={includeAESMasterChain}
                      onChange={(e) => setIncludeAESMasterChain(e.target.checked)}
                      className="rounded border-slate-700 bg-slate-800 text-sky-500 focus:ring-sky-400"
                    />
                    <span>Cadena AES: Corte 32Hz, 2.4kHz y -9 LUFS</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Live Generated Prompt Preview Box with Instant 1-Click Copy */}
            <div className="rounded-xl border-2 border-slate-700 bg-slate-950 overflow-hidden shadow-2xl mb-3.5">
              <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-900/90 px-3.5 py-2.5 border-b border-slate-800">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-amber-400 animate-pulse" />
                  <span className="font-bold text-xs uppercase tracking-wider text-sky-300 font-mono">
                    PROMPT GENERADO // {selectedTargetTool.toUpperCase()} // EXTENSIÓN A {selectedDuration} MIN
                  </span>
                </div>

                {/* Instant 1-Click Copy Buttons */}
                <div className="flex items-center gap-2">
                  {selectedTargetTool === 'suno' && (
                    <button
                      type="button"
                      onClick={() => copyToClipboard(generatedAudioAIPrompts.sunoStylePrompt, 'studio-suno-style', {
                        title: '¡Style Prompt copiado!',
                        subtitle: 'Pégalo en la caja de Style de Suno AI'
                      })}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold border transition-all cursor-pointer ${
                        copiedCodeId === 'studio-suno-style'
                          ? 'border-emerald-400 bg-emerald-950 text-emerald-300'
                          : 'border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white'
                      }`}
                    >
                      {copiedCodeId === 'studio-suno-style' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                      <span>Copiar Style</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      const promptText = selectedTargetTool === 'suno' 
                        ? `${generatedAudioAIPrompts.sunoStylePrompt}\n\n${generatedAudioAIPrompts.sunoLyricsStructure}`
                        : selectedTargetTool === 'musiclm'
                        ? generatedAudioAIPrompts.musicLMPrompt
                        : selectedTargetTool === 'udio'
                        ? generatedAudioAIPrompts.udioPrompt
                        : generatedAudioAIPrompts.universalPrompt;

                      copyToClipboard(promptText, 'studio-master-full', {
                        title: '¡Prompt de Estudio copiado con 1-clic!',
                        subtitle: `Listo para pegar en ${selectedTargetTool.toUpperCase()}`
                      });
                    }}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-extrabold shadow-md transition-all cursor-pointer ${
                      copiedCodeId === 'studio-master-full'
                        ? 'border-2 border-emerald-400 bg-emerald-600 text-white animate-bounce'
                        : 'border border-sky-400 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white'
                    }`}
                  >
                    {copiedCodeId === 'studio-master-full' ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-white" />
                        <span>✓ ¡Copiado al Portapapeles!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 text-sky-100" />
                        <span>Copiar Prompt Completo (1-Clic)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Code Pre Container */}
              <div className="p-3.5 max-h-48 overflow-y-auto font-mono text-[11px] text-sky-100 whitespace-pre-wrap leading-relaxed select-all bg-slate-950/90 border-t border-slate-800">
                {selectedTargetTool === 'suno' ? (
                  <div>
                    <div className="text-amber-400 font-bold mb-1">[STYLE PROMPT / CAJA DE ESTILO]:</div>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800 mb-2.5 text-sky-200">
                      {generatedAudioAIPrompts.sunoStylePrompt}
                    </div>
                    <div className="text-emerald-400 font-bold mb-1">[ESTRUCTURA LÍRICA EXTENDIDA CON COHERENCIA ARMÓNICA]:</div>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800 text-slate-300">
                      {generatedAudioAIPrompts.sunoLyricsStructure}
                    </div>
                  </div>
                ) : selectedTargetTool === 'musiclm' ? (
                  <div>{generatedAudioAIPrompts.musicLMPrompt}</div>
                ) : selectedTargetTool === 'udio' ? (
                  <div>{generatedAudioAIPrompts.udioPrompt}</div>
                ) : (
                  <div>{generatedAudioAIPrompts.universalPrompt}</div>
                )}
              </div>
            </div>

            {/* Bottom Actions Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-800/80 pt-3">
              <span className="text-[11px] text-slate-400 font-mono">
                Manteniendo tonalidad en <strong className="text-sky-300">{report.metadata.detectedKey}</strong> y groove a <strong className="text-sky-300">{report.metadata.estimatedBpm} BPM</strong>.
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPromptStudioOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-xs text-slate-300 hover:bg-slate-700 cursor-pointer"
                >
                  Cerrar
                </button>
                <button
                  type="button"
                  onClick={handleSendCustomPromptToChat}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-sky-400/60 text-sky-200 font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  <Bot className="h-3.5 w-3.5 text-sky-400" />
                  Consultar al Asistente en Chat ➔
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Clear Confirmation Modal / Bar */}
        {showClearConfirm && (
          <div className="bg-rose-900/95 text-white text-xs px-4 py-2.5 flex items-center justify-between border-b border-rose-700 animate-fade-in">
            <span className="flex items-center gap-2 font-medium">
              <AlertTriangle className="h-4 w-4 text-amber-300" />
              ¿Deseas reiniciar y limpiar el historial de este tema?
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleClearHistory}
                className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-3 py-1 rounded-md transition-colors cursor-pointer"
              >
                Sí, reiniciar
              </button>
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1 rounded-md transition-colors cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Live Interactive Audit Stats Ribbon */}
        <div className="border-b border-slate-200 bg-slate-900 px-3 sm:px-4 py-2 flex items-center gap-2 overflow-x-auto no-scrollbar text-xs">
          <span className="text-[10px] font-mono font-bold text-sky-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Zap className="h-3.5 w-3.5 text-amber-400" />
            DATOS DE AUDITORÍA:
          </span>

          <button
            type="button"
            onClick={() => handleSend(`Explícame a detalle por qué mi puntuación comercial es de ${report.commercialScore}/100 y cuál es el plan para llegar a ${report.potentialBoostedScore}/100.`)}
            className="shrink-0 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700 px-2.5 py-1 text-[11px] font-mono text-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Clic para consultar sobre el puntaje"
          >
            <span className="text-slate-400">Score:</span>
            <span className="font-bold text-amber-400">{report.commercialScore}/100</span>
            <span className="text-emerald-400 font-bold">➔ {report.potentialBoostedScore}</span>
          </button>

          <button
            type="button"
            onClick={() => handleSend(`Analiza el tempo de ${report.metadata.estimatedBpm} BPM y tonalidad ${report.metadata.detectedKey} de mi canción "${report.metadata.fileName}". ¿Cómo estructuro el coro para ese groove?`)}
            className="shrink-0 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700 px-2.5 py-1 text-[11px] font-mono text-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span className="text-slate-400">Tempo/Key:</span>
            <span className="font-bold text-sky-300">{report.metadata.estimatedBpm} BPM · {report.metadata.detectedKey}</span>
          </button>

          <button
            type="button"
            onClick={() => handleSend(`Mi track dura ${formattedDuration} (${durationSec}s). ¿Está muy corto para streaming y cómo lo extiendo a 2:55 min con coherencia armónica?`)}
            className={`shrink-0 rounded-md border px-2.5 py-1 text-[11px] font-mono transition-colors flex items-center gap-1.5 cursor-pointer ${
              isShort 
                ? 'bg-amber-950/60 border-amber-500/50 text-amber-300 hover:bg-amber-900/80' 
                : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
            }`}
          >
            <span className="text-slate-400">Duración:</span>
            <span className="font-bold">{formattedDuration}</span>
            {isShort && <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1 rounded font-bold">CORTA</span>}
          </button>

          <button
            type="button"
            onClick={() => handleSend(`Mi sonoridad es de ${report.lufsIntegrated} LUFS con True Peak de ${report.truePeakDb} dBTP. ¿Cómo lo llevo a -9.0 LUFS y -1.0 dBTP sin saturar?`)}
            className="shrink-0 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700 px-2.5 py-1 text-[11px] font-mono text-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span className="text-slate-400">Master:</span>
            <span className="font-bold text-purple-300">{report.lufsIntegrated} LUFS · {report.truePeakDb} dBTP</span>
          </button>

          <button
            type="button"
            onClick={() => handleSend(`¿Por qué la ventana ${report.audience.bestTikTokCut.formattedRange} es mi gancho viral para TikTok/Reels y qué video debo grabar?`)}
            className="shrink-0 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700 px-2.5 py-1 text-[11px] font-mono text-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span className="text-slate-400">TikTok:</span>
            <span className="font-bold text-rose-300">{report.audience.bestTikTokCut.formattedRange}</span>
          </button>
        </div>

        {/* Category Filters Bar */}
        <div className="border-b border-slate-200 bg-slate-100/90 px-3 py-1.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
          <span className="text-[10px] font-mono font-extrabold text-slate-500 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-sky-600" />
            CATEGORÍAS:
          </span>
          {[
            { id: 'all', label: 'Todos' },
            { id: 'extension', label: '⏱️ Duración & Extensión' },
            { id: 'prompts', label: '🤖 Prompts IAs Musicales' },
            { id: 'daws', label: '🎛️ DAWs (FL/Ableton/Logic)' },
            { id: 'mixing', label: '🔊 Ecualización & LUFS' },
            { id: 'viral', label: '🚀 Viral TikTok & Score' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id as any)}
              className={`shrink-0 rounded-md px-2.5 py-1 text-[11px] font-bold transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Quick Action Badges Ribbon */}
        <div className="border-b border-slate-200 bg-slate-50 px-3 sm:px-4 py-2 overflow-x-auto no-scrollbar flex items-center gap-2">
          {filteredPrompts.map((action, idx) => {
            const Icon = action.icon;
            return (
              <button
                key={idx}
                type="button"
                disabled={isTyping}
                onClick={() => handleSend(action.prompt)}
                className={`shrink-0 rounded-lg border px-3 py-1.5 text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 ${action.color} disabled:opacity-50 cursor-pointer`}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span>{action.title}</span>
              </button>
            );
          })}
        </div>

        {/* Chat Message Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-[#F8FAFC]">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'assistant' && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-700 bg-slate-900 text-sky-400 shadow-xs">
                  <Bot className="h-4 w-4" />
                </div>
              )}

              <div className="max-w-[94%] sm:max-w-[85%] space-y-1.5">
                {/* Text Bubble */}
                <div
                  className={`rounded-xl p-4 text-xs sm:text-sm leading-relaxed shadow-sm ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-b from-slate-800 to-slate-900 text-white font-medium rounded-tr-none border border-slate-700'
                      : 'border-2 border-slate-200 bg-white text-slate-800 rounded-tl-none'
                  }`}
                >
                  {renderMessageContent(msg.text, msg.id)}
                </div>

                <div className={`text-[10px] font-mono text-slate-400 px-1 flex items-center gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <span>{msg.timestamp}</span>
                  {msg.source && (
                    <span className="text-[9px] bg-slate-200 text-slate-600 px-1.5 py-0.2 rounded font-mono">
                      {msg.source === 'gemini' ? 'AI Cloud' : 'AES Engine'}
                    </span>
                  )}
                </div>
              </div>

              {msg.sender === 'user' && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-white shadow-xs">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2.5 text-xs font-mono text-slate-700 bg-white p-3.5 rounded-xl border-2 border-slate-200 w-fit shadow-sm animate-pulse">
              <span className="flex h-2.5 w-2.5 rounded-full bg-sky-500 animate-bounce" />
              <span className="flex h-2.5 w-2.5 rounded-full bg-sky-500 animate-bounce [animation-delay:0.2s]" />
              <span className="flex h-2.5 w-2.5 rounded-full bg-sky-500 animate-bounce [animation-delay:0.4s]" />
              <span className="font-semibold text-slate-800">
                El Productor Musical & Asistente Acústico está redactando las instrucciones detalladas...
              </span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="border-t-2 border-slate-200 bg-white p-3 sm:p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Pregunta lo que necesites (ej: ¿cómo arreglo la banda de 2.4kHz?, o dame el prompt para Suno/MusicLM)..."
              className="flex-1 rounded-xl border-2 border-slate-300 bg-slate-50 px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-700 focus:bg-white focus:outline-none transition-colors"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isTyping}
              className="flex items-center justify-center gap-1.5 rounded-xl border-2 border-slate-800 bg-slate-900 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 shrink-0 cursor-pointer"
            >
              <Send className="h-4 w-4" />
              <span className="hidden sm:inline">Enviar</span>
            </button>
          </form>
          <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500 font-mono">
            <span className="flex items-center gap-1">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
              PROMPTS BLINDADOS CON 1-CLIC COPY
            </span>
            <span>COHERENCIA ARMÓNICA · PRESERVACIÓN DE BPM</span>
          </div>
        </div>

      </div>
    </div>
  );
};
