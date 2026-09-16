export function measureLufs(buf: AudioBuffer, stepSec = 0.1): { integrated: number; lra: number; max: number } {
  const sr = buf.sampleRate;
  const nch = Math.min(2, buf.numberOfChannels);
  const len = buf.length;
  const designHighShelf = (f0: number, gainDb: number, Q: number) => {
    const K = Math.tan(Math.PI * f0 / sr);
    const Vh = Math.pow(10, gainDb / 20);
    const Vb = Math.pow(Vh, 0.499666774155);
    const a0 = 1 + K / Q + K * K;
    return { b0: (Vh + Vb * K / Q + K * K) / a0, b1: 2 * (K * K - Vh) / a0, b2: (Vh - Vb * K / Q + K * K) / a0, a1: 2 * (K * K - 1) / a0, a2: (1 - K / Q + K * K) / a0 };
  };
  const designHighPass = (f0: number, Q: number) => {
    const K = Math.tan(Math.PI * f0 / sr);
    const a0 = 1 + K / Q + K * K;
    return { b0: 1 / a0, b1: -2 / a0, b2: 1 / a0, a1: 2 * (K * K - 1) / a0, a2: (1 - K / Q + K * K) / a0 };
  };
  const biquadRun = (x: Float64Array, c: any) => {
    const y = new Float64Array(x.length);
    let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
    for (let i = 0; i < x.length; i++) {
      const x0 = x[i];
      const y0 = c.b0 * x0 + c.b1 * x1 + c.b2 * x2 - c.a1 * y1 - c.a2 * y2;
      y[i] = y0; x2 = x1; x1 = x0; y2 = y1; y1 = y0;
    }
    return y;
  };
  const shelf = designHighShelf(1681.974450955533, 3.999843853973347, 0.7071752369554196);
  const hp = designHighPass(38.13547087602444, 0.5003270373238773);
  const filtered: Float64Array[] = [];
  for (let c = 0; c < nch; c++) {
    let x = Float64Array.from(buf.getChannelData(c));
    x = biquadRun(x, shelf);
    x = biquadRun(x, hp);
    filtered.push(x);
  }
  const B = Math.floor(0.4 * sr);
  const step = Math.max(1, Math.floor(stepSec * sr));
  const blockEnergies: number[] = [];
  for (let st = 0; st + B <= len; st += step) {
    let sum = 0;
    for (let c = 0; c < nch; c++) {
      const x = filtered[c];
      for (let i = st; i < st + B; i++) sum += x[i] * x[i];
    }
    blockEnergies.push(sum / B);
  }
  if (blockEnergies.length === 0) {
    let sum = 0;
    for (let c = 0; c < nch; c++) {
      const x = filtered[c];
      for (let i = 0; i < len; i++) sum += x[i] * x[i];
    }
    blockEnergies.push(sum / len);
  }
  const toLufs = (e: number) => -0.691 + 10 * Math.log10(e + 1e-12);
  const absEnergies = blockEnergies.filter(e => toLufs(e) > -70);
  const meanAbsE = absEnergies.length ? absEnergies.reduce((a,b)=>a+b,0)/absEnergies.length : 1e-12;
  const threshold = toLufs(meanAbsE) - 10;
  const relEnergies = absEnergies.filter(e => toLufs(e) > threshold);
  const integratedE = relEnergies.length ? relEnergies.reduce((a,b)=>a+b,0)/relEnergies.length : meanAbsE;
  const integrated = toLufs(integratedE);
  const sortedLufs = blockEnergies.map(toLufs).sort((a,b)=>a-b);
  const q = (f: number) => sortedLufs[Math.max(0, Math.min(sortedLufs.length - 1, Math.round(f * (sortedLufs.length - 1))))];
  const lra = Math.max(0, q(0.95) - q(0.10));
  return { integrated, lra, max: q(1) };
}

export function measureTruePeak(buf: AudioBuffer): { peak: number; db: number } {
  const nch = Math.min(2, buf.numberOfChannels);
  let peak = 0;
  for (let c = 0; c < nch; c++) {
    const d = buf.getChannelData(c);
    const n = d.length;
    for (let i = 0; i < n; i++) {
      const a0 = Math.abs(d[i]);
      if (a0 > peak) peak = a0;
      if (i < 1 || i >= n - 2) continue;
      if (a0 < 0.5) continue;
      const y0 = d[i - 1], y1 = d[i], y2 = d[i + 1], y3 = d[i < n - 2 ? i + 2 : n - 1];
      const a = -0.5 * y0 + 1.5 * y1 - 1.5 * y2 + 0.5 * y3;
      const b = y0 - 2.5 * y1 + 2 * y2 - 0.5 * y3;
      const cc = -0.5 * y0 + 0.5 * y2;
      for (let k = 1; k < 4; k++) {
        const t = k * 0.25, t2 = t * t;
        let v = a * t2 * t + b * t2 + cc * t + y1;
        if (v < 0) v = -v;
        if (v > peak) peak = v;
      }
    }
  }
  return { peak, db: 20 * Math.log10(peak + 1e-12) };
}

export function detectBPM(buf: AudioBuffer): number {
  const sr = buf.sampleRate;
  const nch = Math.min(2, buf.numberOfChannels);
  const len = buf.length;
  const mono = new Float32Array(len);
  for (let c = 0; c < nch; c++) {
    const ch = buf.getChannelData(c);
    for (let i = 0; i < len; i++) mono[i] += ch[i] / nch;
  }
  const hop = Math.floor(sr * 0.01);
  const numBins = Math.min(Math.floor(len / hop), 3000);
  if (numBins < 200) return 120;
  const energy = new Float32Array(numBins);
  for (let i = 0; i < numBins; i++) {
    const start = i * hop;
    let sum = 0;
    for (let j = 0; j < hop; j += 2) { const v = mono[start + j]; sum += v * v; }
    energy[i] = Math.sqrt(sum / (hop / 2));
  }
  const onsets = new Float32Array(numBins - 1);
  for (let i = 1; i < numBins; i++) { const d = energy[i] - energy[i - 1]; onsets[i - 1] = d > 0 ? d : 0; }
  const minLag = 33, maxLag = 100;
  let bestLag = 50, maxCorr = -1;
  for (let lag = minLag; lag <= maxLag; lag++) {
    let corr = 0;
    const count = onsets.length - lag;
    for (let i = 0; i < count; i++) corr += onsets[i] * onsets[i + lag];
    if (corr > maxCorr) { maxCorr = corr; bestLag = lag; }
  }
  let bpm = Math.round((60 * 100) / bestLag);
  if (bpm < 68) bpm *= 2;
  if (bpm > 175) bpm = Math.round(bpm / 2);
  return bpm;
}

export function detectKey(buf: AudioBuffer): string {
  const sr = buf.sampleRate;
  const nch = Math.min(2, buf.numberOfChannels);
  const len = buf.length;
  const mono = new Float32Array(len);
  for (let c = 0; c < nch; c++) {
    const ch = buf.getChannelData(c);
    for (let i = 0; i < len; i++) mono[i] += ch[i] / nch;
  }
  const fftSize = 4096, hop = fftSize / 2;
  const chroma = new Float64Array(12);
  const win = new Float64Array(fftSize);
  for (let i = 0; i < fftSize; i++) win[i] = 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (fftSize - 1));
  const maxFrames = Math.min(200, Math.floor((len - fftSize) / hop));
  if (maxFrames < 5) return 'No detectada';
  for (let f = 0; f < maxFrames; f++) {
    const off = f * hop;
    const re = new Float64Array(fftSize);
    const im = new Float64Array(fftSize);
    for (let i = 0; i < fftSize; i++) re[i] = mono[off + i] * win[i];
    for (let s = 1; s < fftSize; s *= 2) {
      const half = s, step = fftSize / (2 * s);
      for (let k = 0; k < fftSize; k += 2 * s) {
        for (let j = 0; j < half; j++) {
          const t = j * step;
          const cos = Math.cos(-2 * Math.PI * t / fftSize);
          const sin = Math.sin(-2 * Math.PI * t / fftSize);
          const idx = k + j + half;
          const tre = re[idx] * cos - im[idx] * sin;
          const tim = re[idx] * sin + im[idx] * cos;
          re[idx] = re[k + j] - tre; im[idx] = im[k + j] - tim;
          re[k + j] += tre; im[k + j] += tim;
        }
      }
    }
    for (let k = 1; k < fftSize / 2; k++) {
      const freq = (k * sr) / fftSize;
      if (freq < 65 || freq > 2000) continue;
      const mag = Math.sqrt(re[k] * re[k] + im[k] * im[k]);
      const midi = 69 + 12 * Math.log2(freq / 440);
      const pc = ((Math.round(midi) % 12) + 12) % 12;
      chroma[pc] += mag;
    }
  }
  const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const major = [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88];
  const minor = [6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17];
  let bestScore = -Infinity, bestKey = 'C';
  for (let shift = 0; shift < 12; shift++) {
    let sMaj = 0, sMin = 0;
    for (let i = 0; i < 12; i++) {
      const c = chroma[(i + shift) % 12];
      sMaj += c * major[i]; sMin += c * minor[i];
    }
    if (sMaj > bestScore) { bestScore = sMaj; bestKey = NOTE_NAMES[shift] + ' Mayor'; }
    if (sMin > bestScore) { bestScore = sMin; bestKey = NOTE_NAMES[shift] + ' Menor'; }
  }
  return bestKey;
}

export function applyBassMono(buf: AudioBuffer, freq: number = 90): AudioBuffer {
  const nch = buf.numberOfChannels;
  const len = buf.length;
  const sr = buf.sampleRate;
  if (nch < 2) return buf;

  const left = buf.getChannelData(0);
  const right = buf.getChannelData(1);

  const K = Math.tan((Math.PI * freq) / sr);
  const a0 = 1 + Math.SQRT2 * K + K * K;
  const b0 = 1 / a0;
  const b1 = -2 / a0;
  const b2 = 1 / a0;
  const a1 = (2 * (K * K - 1)) / a0;
  const a2 = (1 - Math.SQRT2 * K + K * K) / a0;

  const oc = new OfflineAudioContext(2, 1, sr);
  const out = oc.createBuffer(2, len, sr);
  const outL = out.getChannelData(0);
  const outR = out.getChannelData(1);

  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;

  for (let i = 0; i < len; i++) {
    const m = (left[i] + right[i]) * 0.5;
    const s = (left[i] - right[i]) * 0.5;

    const sFilt = b0 * s + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2;
    x2 = x1;
    x1 = s;
    y2 = y1;
    y1 = sFilt;

    outL[i] = m + sFilt;
    outR[i] = m - sFilt;
  }
  return out;
}

export function limitBuffer(
  buf: AudioBuffer,
  ceilingDb: number = -1.0,
  gain: number = 1.0
): { buffer: AudioBuffer; grAvg: number; grMax: number } {
  const nch = buf.numberOfChannels;
  const len = buf.length;
  const sr = buf.sampleRate;
  const ceiling = Math.pow(10, ceilingDb / 20);

  const oc = new OfflineAudioContext(nch, 1, sr);
  const out = oc.createBuffer(nch, len, sr);

  const inChannels: Float32Array[] = [];
  const outChannels: Float32Array[] = [];
  for (let c = 0; c < nch; c++) {
    inChannels.push(buf.getChannelData(c));
    outChannels.push(out.getChannelData(c));
  }

  const lookaheadSamples = Math.floor(0.003 * sr);
  const releaseCoeff = Math.exp(-1 / (0.05 * sr));
  let env = 0;
  let grSum = 0;
  let grMax = 0;

  const gReduction = new Float32Array(len);
  for (let i = 0; i < len; i++) {
    let maxAbs = 0;
    for (let c = 0; c < nch; c++) {
      const v = Math.abs(inChannels[c][i] * gain);
      if (v > maxAbs) maxAbs = v;
    }
    if (maxAbs > env) {
      env = maxAbs;
    } else {
      env = maxAbs + (env - maxAbs) * releaseCoeff;
    }

    const g = env > ceiling ? ceiling / env : 1.0;
    gReduction[i] = g;
    const grDb = g < 1.0 ? -20 * Math.log10(g) : 0;
    grSum += grDb;
    if (grDb > grMax) grMax = grDb;
  }

  for (let i = 0; i < len; i++) {
    const targetIdx = Math.min(len - 1, i + lookaheadSamples);
    const g = Math.min(gReduction[i], gReduction[targetIdx]);

    for (let c = 0; c < nch; c++) {
      let v = inChannels[c][i] * gain * g;
      if (v > ceiling) v = ceiling;
      else if (v < -ceiling) v = -ceiling;
      outChannels[c][i] = v;
    }
  }

  return {
    buffer: out,
    grAvg: Math.round((grSum / Math.max(1, len)) * 10) / 10,
    grMax: Math.round(grMax * 10) / 10,
  };
}

export async function masterBuffer(
  src: AudioBuffer,
  targetLufs: number,
  ceilingDb: number = -1.0
): Promise<{ buffer: AudioBuffer; srcLufs: number; outLufs: number; gainDb: number; grAvg: number; grMax: number }> {
  const sr = src.sampleRate;
  const len = src.length;
  const nch = Math.min(2, src.numberOfChannels);

  // Paso 1: EQ de seguridad (highpass 32 Hz + corte suave en 2.4 kHz)
  const oc = new OfflineAudioContext(2, len, sr);
  const b = oc.createBuffer(2, len, sr);
  b.getChannelData(0).set(src.getChannelData(0));
  b.getChannelData(1).set(nch > 1 ? src.getChannelData(1) : src.getChannelData(0));
  const nd = oc.createBufferSource();
  nd.buffer = b;
  const hp = oc.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.value = 32;
  hp.Q.value = 0.7071;
  const pk = oc.createBiquadFilter();
  pk.type = 'peaking';
  pk.frequency.value = 2400;
  pk.gain.value = -2.2;
  pk.Q.value = 1.8;
  nd.connect(hp);
  hp.connect(pk);
  pk.connect(oc.destination);
  nd.start(0);
  const eqBuffer = await oc.startRendering();

  // Paso 2: mono de graves
  const monoBuffer = applyBassMono(eqBuffer, 90);

  // Paso 3: medir LUFS actual
  const srcLufs = measureLufs(monoBuffer).integrated;

  // Paso 4: calcular ganancia para llegar al objetivo
  const gainDb = targetLufs - srcLufs;
  const gain = Math.pow(10, gainDb / 20);

  // Paso 5: limitar
  const limited = limitBuffer(monoBuffer, ceilingDb, gain);

  // Paso 6: medir resultado
  const outLufs = measureLufs(limited.buffer).integrated;

  return {
    buffer: limited.buffer,
    srcLufs,
    outLufs,
    gainDb,
    grAvg: limited.grAvg,
    grMax: limited.grMax,
  };
}

export function encodeWav16(buffer: AudioBuffer): Blob {
  const numCh = Math.min(2, buffer.numberOfChannels);
  const len = buffer.length;
  const sr = buffer.sampleRate;
  const bytesPerSample = 2;
  const dataSize = len * numCh * bytesPerSample;
  const headerSize = 44;
  const ab = new ArrayBuffer(headerSize + dataSize);
  const view = new DataView(ab);
  const writeStr = (off: number, s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(off + i, s.charCodeAt(i));
  };
  writeStr(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeStr(8, 'WAVE');
  writeStr(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numCh, true);
  view.setUint32(24, sr, true);
  view.setUint32(28, sr * numCh * bytesPerSample, true);
  view.setUint16(32, numCh * bytesPerSample, true);
  view.setUint16(34, 16, true);
  writeStr(36, 'data');
  view.setUint32(40, dataSize, true);
  const channels: Float32Array[] = [];
  for (let c = 0; c < numCh; c++) channels.push(buffer.getChannelData(c));
  let off = 44;
  for (let i = 0; i < len; i++) {
    for (let c = 0; c < numCh; c++) {
      let v = channels[c][i];
      v = Math.max(-1, Math.min(1, v));
      view.setInt16(off, v < 0 ? v * 0x8000 : v * 0x7FFF, true);
      off += 2;
    }
  }
  return new Blob([ab], { type: 'audio/wav' });
}
