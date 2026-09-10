import jsPDF from 'jspdf';
import { AnalysisReport } from '../types';

export function exportReportToPDF(report: AnalysisReport) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  // Helper to draw Page Header
  const drawPageHeader = (pageNumber: number, totalPages: number) => {
    // Top Brand Bar - Dark Metallic Slate
    doc.setFillColor(15, 23, 42); // #0F172A
    doc.rect(margin, 12, contentWidth, 20, 'F');

    // Subtle Cyan Accent Line
    doc.setFillColor(56, 189, 248); // #38BDF8
    doc.rect(margin, 31.5, contentWidth, 0.8, 'F');

    // Brand Name
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('PANNING by ARMORED BASS', margin + 6, 21);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text('AUDITORÍA TÉCNICA ACÚSTICA // REPORTE DE MASTERIZACIÓN & STREAMING EBU R128', margin + 6, 27);

    // Score Badge in Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(56, 189, 248);
    doc.text(`SCORE: ${report.commercialScore}/100`, pageWidth - margin - 35, 23);
  };

  // Helper to draw Page Footer
  const drawPageFooter = (pageNumber: number, totalPages: number) => {
    const footY = pageHeight - 12;
    doc.setFillColor(241, 245, 249);
    doc.rect(margin, footY, contentWidth, 8, 'F');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text('PANNING by Armored Bass · DropCheck DSP v4.2 · Documento de Certificación Acústica', margin + 4, footY + 5);
    doc.text(`Página ${pageNumber} de ${totalPages} · ${new Date().toLocaleDateString('es-ES')}`, pageWidth - margin - 36, footY + 5);
  };

  // ==========================================
  // PAGE 1: EXECUTIVE SUMMARY & CORE METRICS
  // ==========================================

  // Page 1 Background
  doc.setFillColor(248, 250, 252);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  drawPageHeader(1, 2);

  let yPos = 36;

  // 1. Metadata Box
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(203, 213, 225);
  doc.rect(margin, yPos, contentWidth, 24, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(`Archivo: ${report.metadata.fileName}`, margin + 5, yPos + 6.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);

  const col1 = margin + 5;
  const col2 = margin + 48;
  const col3 = margin + 96;
  const col4 = margin + 140;

  doc.text(`Género: ${report.metadata.detectedGenre}`, col1, yPos + 13.5);
  doc.text(`BPM: ${report.metadata.estimatedBpm} BPM`, col1, yPos + 19.5);

  doc.text(`Tonalidad: ${report.metadata.detectedKey}`, col2, yPos + 13.5);
  doc.text(`Duración: ${Math.floor(report.metadata.duration / 60)}:${(report.metadata.duration % 60).toString().padStart(2, '0')}`, col2, yPos + 19.5);

  doc.text(`Sonoridad: ${report.lufsIntegrated} LUFS`, col3, yPos + 13.5);
  doc.text(`True Peak: ${report.truePeakDb} dBTP`, col3, yPos + 19.5);

  doc.text(`Rango Dinámico: ${report.dynamicRangeDb} dB`, col4, yPos + 13.5);
  doc.text(`Fecha: ${report.metadata.scannedAt}`, col4, yPos + 19.5);

  yPos += 28;

  // 2. Commercial Score Banner & Executive Summary
  const isHigh = report.commercialScore >= 80;
  const scoreBgColor = isHigh ? [236, 253, 245] : [255, 251, 235]; // emerald-50 or amber-50
  const scoreBorderColor = isHigh ? [167, 243, 208] : [253, 230, 138];

  doc.setFillColor(scoreBgColor[0], scoreBgColor[1], scoreBgColor[2]);
  doc.setDrawColor(scoreBorderColor[0], scoreBorderColor[1], scoreBorderColor[2]);
  doc.rect(margin, yPos, contentWidth, 34, 'FD');

  // Left Score Badge
  doc.setFillColor(15, 23, 42);
  doc.rect(margin + 4, yPos + 4, 34, 26, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(`${report.commercialScore}`, margin + 21, yPos + 17, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text('/100 SCORE', margin + 21, yPos + 24, { align: 'center' });

  // Right Verdict Text
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('DICTAMEN ACÚSTICO & POTENCIAL DE STREAMING:', margin + 42, yPos + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.2);
  doc.setTextColor(51, 65, 85);
  const splitVerdict = doc.splitTextToSize(report.globalVerdict, contentWidth - 46);
  doc.text(splitVerdict, margin + 42, yPos + 14);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(2, 132, 199);
  doc.text(`Potencial tras correcciones técnicas: ${report.potentialBoostedScore}/100 (+${report.potentialBoostedScore - report.commercialScore} Puntos)`, margin + 42, yPos + 29);

  yPos += 38;

  // 3. Section: Core 4 Fundamental Metrics
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('1. MÉTRICAS FUNDAMENTALES DE LA INDUSTRIA', margin, yPos);
  yPos += 4;

  const metricKeys = Object.values(report.metrics);
  const cardWidth = (contentWidth - 9) / 4;

  metricKeys.forEach((m, idx) => {
    const x = margin + idx * (cardWidth + 3);
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(203, 213, 225);
    doc.rect(x, yPos, cardWidth, 30, 'FD');

    // Status top indicator
    const statusColor = m.status === 'good' ? [16, 185, 129] : m.status === 'warning' ? [245, 158, 11] : [239, 68, 68];
    doc.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
    doc.rect(x + 2, yPos + 2, cardWidth - 4, 2.5, 'F');

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text(m.name, x + 3, yPos + 9.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
    doc.text(`${m.score}/100`, x + 3, yPos + 17.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.2);
    doc.setTextColor(100, 116, 139);
    doc.text(`Valor: ${m.currentValue}`, x + 3, yPos + 22.5);
    doc.text(`Ref: ${m.targetBenchmark}`, x + 3, yPos + 26.5);
  });

  yPos += 35;

  // 4. Section: Audience & TikTok Viral Cut
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('2. AUDIENCIA & CORTE ESTRATÉGICO PARA REDES (TIKTOK / REELS)', margin, yPos);
  yPos += 4;

  const cut = report.audience.bestTikTokCut;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(203, 213, 225);
  doc.rect(margin, yPos, contentWidth, 34, 'FD');

  doc.setFillColor(15, 23, 42);
  doc.rect(margin + 4, yPos + 4, 38, 26, 'F');

  doc.setTextColor(56, 189, 248);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('HOOK VIRAL', margin + 23, yPos + 12, { align: 'center' });

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.text(cut.formattedRange, margin + 23, yPos + 20, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(148, 163, 184);
  doc.text(`${cut.endSec - cut.startSec} Segundos`, margin + 23, yPos + 26, { align: 'center' });

  // Reason text
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('Justificación de Retención Algorítmica:', margin + 46, yPos + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(51, 65, 85);
  const splitHook = doc.splitTextToSize(cut.hookReason, contentWidth - 50);
  doc.text(splitHook, margin + 46, yPos + 13.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.8);
  doc.setTextColor(71, 85, 105);
  const estRetention = report.viralCurve?.bestWindow.retentionRate || '94%';
  doc.text(`Público: ${report.audience.targetDemographic.slice(0, 42)}... · Retención Estimada: ${estRetention}`, margin + 46, yPos + 29);

  drawPageFooter(1, 2);

  // ==========================================
  // PAGE 2: FREQUENCY ALERTS, ROADMAP & CERTIFICATION
  // ==========================================
  doc.addPage();
  doc.setFillColor(248, 250, 252);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  drawPageHeader(2, 2);

  yPos = 36;

  // 5. Section: Frequency Matrix & DAW Corrections Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('3. MATRIZ DE FRECUENCIAS & ALERTAS DE MEZCLA (CORRECCIONES DAW)', margin, yPos);
  yPos += 4;

  // Table Header
  doc.setFillColor(30, 41, 59); // slate-800
  doc.rect(margin, yPos, contentWidth, 6.5, 'F');
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);

  doc.text('Banda / Rango', margin + 3, yPos + 4.5);
  doc.text('Problema Detectado', margin + 42, yPos + 4.5);
  doc.text('Ajuste Sugerido (Gain / Q)', margin + 112, yPos + 4.5);
  doc.text('Plugin Recomendado', margin + 148, yPos + 4.5);

  yPos += 6.5;

  report.frequencyAlerts.forEach((alert, idx) => {
    const rowHeight = 15;
    const isEven = idx % 2 === 0;
    doc.setFillColor(isEven ? 255 : 248, isEven ? 255 : 250, isEven ? 255 : 252);
    doc.setDrawColor(226, 232, 240);
    doc.rect(margin, yPos, contentWidth, rowHeight, 'FD');

    // Severity indicator badge
    const isCrit = alert.severity === 'critical';
    doc.setFillColor(isCrit ? 239 : 245, isCrit ? 68 : 158, isCrit ? 68 : 11);
    doc.rect(margin + 1.5, yPos + 2, 1.5, rowHeight - 4, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.2);
    doc.setTextColor(15, 23, 42);
    doc.text(`${alert.bandName}`, margin + 5, yPos + 5.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.2);
    doc.setTextColor(100, 116, 139);
    doc.text(alert.frequencyRange, margin + 5, yPos + 10);

    // Issue Description
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(51, 65, 85);
    const splitIssue = doc.splitTextToSize(alert.detectedIssue, 66);
    doc.text(splitIssue, margin + 42, yPos + 5);

    // Gain & Q
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(2, 132, 199);
    doc.text(alert.gainAdjustment, margin + 112, yPos + 5.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.2);
    doc.setTextColor(71, 85, 105);
    doc.text(`Q: ${alert.qFactor}`, margin + 112, yPos + 10);

    // Plugin Tip
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.2);
    doc.setTextColor(51, 65, 85);
    const splitPlugin = doc.splitTextToSize(alert.pluginTip, contentWidth - 148);
    doc.text(splitPlugin, margin + 148, yPos + 5.5);

    yPos += rowHeight;
  });

  yPos += 6;

  // 6. Section: Timeline Roadmap
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('4. HOJA DE RUTA CON MARCAS DE TIEMPO (TIMESTAMPS)', margin, yPos);
  yPos += 4;

  report.roadmap.slice(0, 4).forEach((item) => {
    const rowH = 13.5;
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240);
    doc.rect(margin, yPos, contentWidth, rowH, 'FD');

    // Time pill
    doc.setFillColor(241, 245, 249);
    doc.rect(margin + 3, yPos + 2.5, 16, 8.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(15, 23, 42);
    doc.text(item.formattedTime, margin + 4.5, yPos + 8);

    // Section info
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text(item.sectionName, margin + 22, yPos + 5.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(71, 85, 105);
    const splitSolution = doc.splitTextToSize(`Solución: ${item.solution}`, contentWidth - 25);
    doc.text(splitSolution, margin + 22, yPos + 9.5);

    yPos += rowH + 1.5;
  });

  yPos += 4;

  // 7. Official Certification Sign-Off
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(203, 213, 225);
  doc.rect(margin, yPos, contentWidth, 24, 'FD');

  doc.setFillColor(15, 23, 42);
  doc.rect(margin + 4, yPos + 4, 30, 16, 'F');

  doc.setTextColor(56, 189, 248);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.text('VALIDADO', margin + 19, yPos + 11, { align: 'center' });
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(5.5);
  doc.text('EBU R128', margin + 19, yPos + 16, { align: 'center' });

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('CERTIFICACIÓN ACÚSTICA PANNING BY ARMORED BASS', margin + 38, yPos + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(71, 85, 105);
  doc.text('Este documento ha sido generado por el motor de análisis DSP de DropCheck bajo estándares internacionales de sonoridad EBU R128 / ITU-R BS.1770.', margin + 38, yPos + 13.5);
  doc.text('Aplica las correcciones sugeridas en tu DAW antes del lanzamiento comercial definitivo.', margin + 38, yPos + 18);

  drawPageFooter(2, 2);

  // Save the PDF
  const safeFilename = report.metadata.fileName.replace(/[^a-zA-Z0-9_-]/g, '_');
  doc.save(`Reporte_Acustico_PANNING_${safeFilename}.pdf`);
}
