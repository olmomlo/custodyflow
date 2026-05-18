import jsPDF from 'jspdf';
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  format,
  isSameMonth,
  getDay,
} from 'date-fns';
import { es } from 'date-fns/locale';

// =====================================================================
// Configuración del layout (A4 landscape, en milímetros)
// =====================================================================
const PAGE = { w: 297, h: 210 };
const M = 8; // margen exterior
const HEADER_H = 14;
const FOOTER_H = 26;
const GAP = 3;

const COLOR = {
  padre: [209, 250, 229], // #d1fae5
  madre: [237, 233, 254], // #ede9fe
  padreAccent: [16, 185, 129], // #10b981
  madreAccent: [139, 92, 246], // #8b5cf6
  festivo: [220, 38, 38], // #dc2626
  noLectivo: [217, 119, 6], // amber-600
  text: [28, 25, 23], // stone-900
  textMuted: [87, 83, 78], // stone-600
  border: [231, 229, 228], // stone-200
  weekend: [168, 162, 158], // stone-400
};

// =====================================================================
// Dibuja una estrella rellena de 5 puntas centrada en (cx, cy)
// =====================================================================
function drawStar(doc, cx, cy, r, color) {
  const outer = r;
  const inner = r * 0.382;
  const pts = [];
  for (let i = 0; i < 10; i++) {
    const angle = -Math.PI / 2 + (i * Math.PI) / 5;
    const rad = i % 2 === 0 ? outer : inner;
    pts.push([cx + Math.cos(angle) * rad, cy + Math.sin(angle) * rad]);
  }
  doc.setFillColor(...color);
  // Usamos lines() con cierre relativo
  const lines = [];
  for (let i = 1; i < pts.length; i++) {
    lines.push([pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]]);
  }
  doc.lines(lines, pts[0][0], pts[0][1], [1, 1], 'F', true);
}

// =====================================================================
// Dibuja un mes mini en la posición (x, y) con ancho w y alto h
// =====================================================================
function drawMonth(doc, x, y, w, h, year, monthIdx, dias) {
  const monthDate = new Date(year, monthIdx, 1);
  const titleH = 5.5;
  const wdH = 3.2;
  const gridH = h - titleH - wdH;

  // Título del mes
  const title = format(monthDate, 'MMMM', { locale: es });
  const titleCap = title.charAt(0).toUpperCase() + title.slice(1);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...COLOR.text);
  doc.text(titleCap, x, y + titleH - 1.5);

  // Cabecera de días de la semana
  const wds = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
  const colW = w / 7;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(5.5);
  wds.forEach((wd, i) => {
    doc.setTextColor(...(i >= 5 ? COLOR.weekend : COLOR.textMuted));
    doc.text(wd, x + colW * i + colW / 2, y + titleH + wdH - 1, {
      align: 'center',
    });
  });

  // Calculamos las semanas del mes
  const monthStart = startOfMonth(monthDate);
  const monthEnd = endOfMonth(monthDate);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  // 6 filas como máximo
  const rows = Math.ceil(days.length / 7);
  const rowH = gridH / rows;

  days.forEach((d, idx) => {
    const col = idx % 7;
    const row = Math.floor(idx / 7);
    const cellX = x + col * colW;
    const cellY = y + titleH + wdH + row * rowH;
    const inMonth = isSameMonth(d, monthDate);
    if (!inMonth) return; // Solo dibujamos días del mes

    const key = format(d, 'yyyy-MM-dd');
    const data = dias[key];
    const padding = 0.3;

    // Fondo de custodia
    if (data?.custodia === 'padre') {
      doc.setFillColor(...COLOR.padre);
      doc.roundedRect(
        cellX + padding,
        cellY + padding,
        colW - padding * 2,
        rowH - padding * 2,
        0.6,
        0.6,
        'F'
      );
    } else if (data?.custodia === 'madre') {
      doc.setFillColor(...COLOR.madre);
      doc.roundedRect(
        cellX + padding,
        cellY + padding,
        colW - padding * 2,
        rowH - padding * 2,
        0.6,
        0.6,
        'F'
      );
    }

    // Estrella no lectivo (esquina superior derecha)
    if (data?.no_lectivo) {
      drawStar(doc, cellX + colW - 1.3, cellY + 1.3, 0.9, COLOR.noLectivo);
    }

    // Número del día
    const isFestivo = data?.festivo;
    if (isFestivo) {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...COLOR.festivo);
    } else {
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...COLOR.text);
    }
    doc.setFontSize(6.5);
    doc.text(String(d.getDate()), cellX + colW / 2, cellY + rowH / 2 + 1.2, {
      align: 'center',
    });
  });
}

// =====================================================================
// Calcula estadísticas para el footer
// =====================================================================
function calcStats(dias, year) {
  let padre = 0,
    madre = 0,
    festivos = 0,
    noLectivos = 0;
  for (const key in dias) {
    if (!key.startsWith(String(year))) continue;
    const d = dias[key];
    if (d.custodia === 'padre') padre++;
    if (d.custodia === 'madre') madre++;
    if (d.festivo) festivos++;
    if (d.no_lectivo) noLectivos++;
  }
  return { padre, madre, festivos, noLectivos };
}

// =====================================================================
// Función pública de exportación
// =====================================================================
export function exportarPDFAnual(year, dias) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  // ---- Cabecera ----
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(...COLOR.text);
  doc.text('Calendario de custodia compartida', M, M + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(...COLOR.textMuted);
  doc.text(String(year), PAGE.w - M, M + 6, { align: 'right' });

  // ---- Rejilla de 12 meses (4 cols x 3 filas) ----
  const gridY = M + HEADER_H;
  const gridW = PAGE.w - M * 2;
  const gridH = PAGE.h - HEADER_H - FOOTER_H - M * 2;
  const cellW = (gridW - GAP * 3) / 4;
  const cellH = (gridH - GAP * 2) / 3;

  for (let i = 0; i < 12; i++) {
    const col = i % 4;
    const row = Math.floor(i / 4);
    const x = M + col * (cellW + GAP);
    const y = gridY + row * (cellH + GAP);
    drawMonth(doc, x, y, cellW, cellH, year, i, dias);
  }

  // ---- Footer: leyenda + estadísticas ----
  const stats = calcStats(dias, year);
  const totalAsignados = stats.padre + stats.madre;
  const pctPadre = totalAsignados
    ? ((stats.padre / totalAsignados) * 100).toFixed(1).replace(/\.0$/, '')
    : '0';
  const pctMadre = totalAsignados
    ? ((stats.madre / totalAsignados) * 100).toFixed(1).replace(/\.0$/, '')
    : '0';

  const footerY = PAGE.h - M - FOOTER_H + 2;

  // Línea divisoria sutil
  doc.setDrawColor(...COLOR.border);
  doc.setLineWidth(0.2);
  doc.line(M, footerY, PAGE.w - M, footerY);

  // Leyenda
  const legendY = footerY + 6;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...COLOR.textMuted);
  doc.text('LEYENDA', M, legendY - 2);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  let lx = M;
  const drawSwatch = (color, label) => {
    doc.setFillColor(...color);
    doc.roundedRect(lx, legendY + 1.5, 3, 3, 0.5, 0.5, 'F');
    doc.setTextColor(...COLOR.text);
    doc.text(label, lx + 4.5, legendY + 4);
    lx += 4.5 + doc.getTextWidth(label) + 7;
  };
  drawSwatch(COLOR.padre, 'Padre');
  drawSwatch(COLOR.madre, 'Madre');

  // Festivo
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLOR.festivo);
  doc.text('15', lx + 1.5, legendY + 4);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLOR.text);
  doc.text('Festivo', lx + 5, legendY + 4);
  lx += 5 + doc.getTextWidth('Festivo') + 7;

  // No lectivo
  drawStar(doc, lx + 1.5, legendY + 3, 1.3, COLOR.noLectivo);
  doc.setTextColor(...COLOR.text);
  doc.text('No lectivo', lx + 4, legendY + 4);

  // Estadísticas
  const statsY = legendY + 9;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...COLOR.textMuted);
  doc.text('ESTADÍSTICAS DEL AÑO', M, statsY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...COLOR.text);

  const statsTxt = [
    { label: 'Padre', val: `${stats.padre} días (${pctPadre}%)`, color: COLOR.padreAccent },
    { label: 'Madre', val: `${stats.madre} días (${pctMadre}%)`, color: COLOR.madreAccent },
    { label: 'Festivos', val: `${stats.festivos} días`, color: COLOR.festivo },
    { label: 'No lectivos', val: `${stats.noLectivos} días`, color: COLOR.noLectivo },
  ];

  let sx = M;
  const sy = statsY + 5;
  statsTxt.forEach((s, i) => {
    doc.setFillColor(...s.color);
    doc.circle(sx + 1.5, sy - 1, 1, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLOR.textMuted);
    doc.setFontSize(8);
    doc.text(s.label + ':', sx + 4, sy);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLOR.text);
    doc.text(s.val, sx + 4 + doc.getTextWidth(s.label + ':') + 1.5, sy);
    sx += 4 + doc.getTextWidth(s.label + ': ' + s.val) + 12;
  });

  // Pie de página
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7);
  doc.setTextColor(...COLOR.weekend);
  doc.text(
    `Generado el ${format(new Date(), "d 'de' MMMM 'de' yyyy", { locale: es })}`,
    PAGE.w - M,
    PAGE.h - M,
    { align: 'right' }
  );

  doc.save(`custodia-${year}.pdf`);
}
