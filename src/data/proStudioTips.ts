export interface ProStudioTip {
  id: string;
  category: 'Mezcla' | 'Mastering' | 'Viralidad' | 'Armonía' | 'Psicoacústica';
  categoryColor: string;
  title: string;
  advice: string;
  actionableStep: string;
  empatheticClosing: string;
  authorTag: string;
}

export const PRO_STUDIO_TIPS: ProStudioTip[] = [
  {
    id: 'tip-sub-cleanup',
    category: 'Mezcla',
    categoryColor: 'text-amber-700 bg-amber-100 border-amber-300',
    title: 'Recupera hasta +3 dB de Headroom cortando a 30-32 Hz',
    advice: 'Las frecuencias por debajo de 30 Hz no son percibidas como tono musical por el oído humano, pero consumen más del 40% de la energía de tu limitador y fuerzan los conos de los altavoces innecesariamente.',
    actionableStep: 'Inserta un High-Pass Filter (24 dB/oct) en 32 Hz en tu bus Master o en el canal de bajo/kick. Notarás tu mezcla instantáneamente más limpia, abierta y con pegada definida.',
    empatheticClosing: 'No le temas a limpiar los graves: tu música no perderá peso, sino que ganará contundencia y claridad.',
    authorTag: 'AES Certified Mixing Tip',
  },
  {
    id: 'tip-fletcher-munson',
    category: 'Psicoacústica',
    categoryColor: 'text-sky-700 bg-sky-100 border-sky-300',
    title: 'El Secreto de la Curva Fletcher-Munson (2.5 kHz a 4.5 kHz)',
    advice: 'El oído humano evolucionó para ser ultra-sensible a las frecuencias del llanto y la voz humana (entre 2.5 kHz y 4.5 kHz). Esta es la "zona de gancho" que determina si una melodía se queda en la cabeza del oyente.',
    actionableStep: 'Abre un ecualizador dinámico en los acordes/sintetizadores y haz un corte suave de -1.5 a -2.5 dB en 3.2 kHz para que la voz principal respire y brille sin tener que subirle volumen.',
    empatheticClosing: 'Hacer espacio a tu voz es el acto de amor más grande que puedes hacer por la emoción de tu canción.',
    authorTag: 'Vocal Presence Protocol',
  },
  {
    id: 'tip-streaming-lufs',
    category: 'Mastering',
    categoryColor: 'text-emerald-700 bg-emerald-100 border-emerald-300',
    title: 'Evita la distorsión inter-sample con True Peak en -1.0 dBTP',
    advice: 'Cuando las plataformas de streaming (Spotify, Apple Music, YouTube) comprimen tu audio a códecs con pérdida (AAC/Ogg), los picos inter-muestras superan el 0 dBFS y generan distorsión áspera en AirPods y teléfonos.',
    actionableStep: 'Ajusta siempre el Ceiling de tu limitador final en -1.0 dBTP (o -0.8 dBTP) con sobremuestreo 4x (Oversampling) activado, apuntando a una sonoridad competitiva de -9.0 a -11.0 LUFS integrados.',
    empatheticClosing: 'Tu máster sonará con la misma potencia e impacto que los grandes artistas mundiales, sin importar dónde lo escuchen.',
    authorTag: 'EBU R128 & Spotify Standards',
  },
  {
    id: 'tip-tiktok-hook-drop',
    category: 'Viralidad',
    categoryColor: 'text-rose-700 bg-rose-100 border-rose-300',
    title: 'El "Drop de 3 Segundos" para Retención Algorítmica en TikTok',
    advice: 'El algoritmo de TikTok mide la retención en los primeros 2.8 segundos. Si el oyente no escucha un elemento distintivo (frase icónica, choque de batería o cambio de acorde inesperado), el 68% desliza hacia el siguiente video.',
    actionableStep: 'Inicia tu clip de TikTok justo 1 segundo antes del coro o del drop más potente, asegurando que la primera línea de la letra tenga una métrica corta y fácil de repetir mentalmente.',
    empatheticClosing: 'Cada segundo cuenta para conectar con alguien nuevo. Confía en el impacto de tu primer compás.',
    authorTag: 'Viral Retention Science',
  },
  {
    id: 'tip-mono-bass',
    category: 'Mezcla',
    categoryColor: 'text-amber-700 bg-amber-100 border-amber-300',
    title: 'Mono Bass por debajo de 120 Hz para evitar cancelaciones',
    advice: 'La información estéreo en frecuencias graves genera cancelaciones de fase severas en sistemas de club, altavoces portátiles y autos, haciendo que el bombo desaparezca cuando se reproduce en mono.',
    actionableStep: 'Usa una utilidad de imagen estéreo (Utility de Ableton, Mono Maker en Brainworx o Fruity Stereo Shaper) y convierte a mono estricto todo lo que esté por debajo de 100-120 Hz.',
    empatheticClosing: 'Un bajo sólido en el centro es el cimiento indestructible sobre el cual florecen tus melodías estéreo.',
    authorTag: 'Phase Coherence Rule',
  },
  {
    id: 'tip-harmonic-chorus-lift',
    category: 'Armonía',
    categoryColor: 'text-indigo-700 bg-indigo-100 border-indigo-300',
    title: 'El "Salto Melódico de 3ra" para elevar la energía del Coro',
    advice: 'Para que el coro se sienta como una explosión emocional y no como una repetición del verso, la melodía vocal debe iniciar con una nota más alta que la nota promedio del verso (intervalo de 3ra o 5ta ascendente).',
    actionableStep: 'Si tu verso se mueve alrededor de la tónica (ej. Do), arranca la primera frase del coro en la 3ra (Mi) o la 5ta (Sol). Notarás una sensación instantánea de despegue y triunfo.',
    empatheticClosing: 'La música es tensión y liberación. Dale a tu público la satisfacción de ese clímax melódico.',
    authorTag: 'Commercial Hook Architecture',
  },
  {
    id: 'tip-sidechain-ducking',
    category: 'Mezcla',
    categoryColor: 'text-amber-700 bg-amber-100 border-amber-300',
    title: 'Sidechain Rápido: El secreto para que el Bombo corte la mezcla',
    advice: 'Cuando el Kick y el 808/Bajo tocan en el mismo instante, compiten por el mismo espacio espectral. La compresión sidechain automatiza el volumen del bajo en milisegundos exactos.',
    actionableStep: 'Configura un ataque ultra-rápido (0.5 a 2 ms) y una relajación (Release) sincronizada con el tempo (entre 45 y 75 ms), logrando entre 3 y 4 dB de atenuación solo en el golpe inicial.',
    empatheticClosing: 'Con este ajuste, cada golpe de batería se sentirá en el pecho con máxima contundencia.',
    authorTag: 'Punch & Impact Formula',
  },
  {
    id: 'tip-pre-drop-silence',
    category: 'Viralidad',
    categoryColor: 'text-rose-700 bg-rose-100 border-rose-300',
    title: 'El Micro-Silencio Pre-Coro: La Dopamina del Contraste',
    advice: 'El cerebro humano reacciona con euforia cuando la música pasa súbitamente de la tensión al silencio y luego a una explosión de sonido. Un silencio de 1/4 de compás justo antes del coro multiplica el impacto emocional.',
    actionableStep: 'Mutea todos los instrumentos (incluyendo reverberaciones) durante 1 tiempo justo antes de que caiga el primer golpe del coro. Deja solo un suspiro, una palabra aislada o silencio absoluto.',
    empatheticClosing: 'El silencio bien colocado es tan poderoso como el acorde más grande del mundo.',
    authorTag: 'Neuro-Musicology Hook Secret',
  },
];
