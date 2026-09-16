export interface CommercialScoreComponent {
  id: string;
  name: string;
  score: number;
  weight?: number;
  description?: string;
}

export interface CommercialReadiness {
  total: number;
  components: CommercialScoreComponent[];
  summary?: string;
}

export function computeCommercialReadiness(
  lufs: number = -10,
  truePeak: number = -1.0,
  dynamicRange: number = 8
): CommercialReadiness {
  const lufsScore = Math.max(0, Math.min(100, 100 - Math.abs(lufs - (-9)) * 10));
  const tpScore = truePeak <= -0.5 ? 95 : 70;
  const drScore = dynamicRange >= 6 && dynamicRange <= 12 ? 90 : 75;

  const components: CommercialScoreComponent[] = [
    { id: 'lufs', name: 'Nivel LUFS', score: Math.round(lufsScore) },
    { id: 'truePeak', name: 'True Peak Ceiling', score: Math.round(tpScore) },
    { id: 'dynamics', name: 'Rango Dinámico / LRA', score: Math.round(drScore) },
  ];

  const total = Math.round(components.reduce((acc, c) => acc + c.score, 0) / components.length);

  return {
    total,
    components,
    summary: total >= 80 ? 'Mezcla competitiva para distribución' : 'Requiere balance comercial',
  };
}
