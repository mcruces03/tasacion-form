import jsPDF from 'jspdf';
import 'jspdf-autotable';
import type { ValoracionForm } from '../types';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: Record<string, unknown>) => jsPDF;
  }
}

const OLIVA: [number, number, number] = [166, 175, 97];
const OLIVA_LIGHT: [number, number, number] = [242, 244, 196];
const GREY_BG: [number, number, number] = [248, 250, 252];
const GREY_BORDER: [number, number, number] = [226, 232, 240];
const GRAY: [number, number, number] = [107, 114, 128];
const DARK: [number, number, number] = [31, 41, 55];

const LOGO_HEIGHT_MM = 18;
const LOGO_LEFT_MM = 6;
const LOGO_TOP_MM = 5;

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(blob);
  });
}

async function loadLogoDataUrl(): Promise<string | null> {
  try {
    const meta = import.meta as { env?: { BASE_URL?: string } };
    const base = meta.env?.BASE_URL ?? '/';
    const res = await fetch(`${base}logo.png`);
    if (!res.ok) return null;
    const blob = await res.blob();
    return blobToDataUrl(blob);
  } catch {
    return null;
  }
}

function drawPageHeader(doc: jsPDF, logoDataUrl: string | null): void {
  const W = doc.internal.pageSize.getWidth();
  doc.setFillColor(...OLIVA);
  doc.rect(0, 0, W, 28, 'F');
  if (logoDataUrl) {
    try {
      doc.addImage(logoDataUrl, 'PNG', LOGO_LEFT_MM, LOGO_TOP_MM, 24, LOGO_HEIGHT_MM);
    } catch {
      // ignore if image fails
    }
  }
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text('VALORACIÓN DE INMUEBLE', logoDataUrl ? 38 : W / 2, 16, { align: logoDataUrl ? 'left' : 'center' });
}

function drawHeader(doc: jsPDF, y: number, text: string, useGrey = false): number {
  if (useGrey) {
    doc.setFillColor(...GREY_BORDER);
    doc.roundedRect(14, y, doc.internal.pageSize.getWidth() - 28, 10, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...DARK);
    doc.text(text, 18, y + 7);
  } else {
    doc.setFillColor(...OLIVA);
    doc.roundedRect(14, y, doc.internal.pageSize.getWidth() - 28, 10, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.text(text, doc.internal.pageSize.getWidth() / 2, y + 7, { align: 'center' });
  }
  return y + 16;
}

function drawField(
  doc: jsPDF,
  x: number,
  y: number,
  label: string,
  value: string,
  width: number
): void {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...GRAY);
  doc.text(label, x, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...DARK);

  const displayValue = value || '—';
  doc.text(displayValue, x, y + 5, { maxWidth: width - 4 });
}

function drawSectionBg(doc: jsPDF, y: number, height: number, useGrey = false): void {
  doc.setFillColor(...(useGrey ? GREY_BG : OLIVA_LIGHT));
  doc.roundedRect(14, y, doc.internal.pageSize.getWidth() - 28, height, 2, 2, 'F');
}

async function buildPdfDocument(data: ValoracionForm): Promise<jsPDF> {
  const logoDataUrl = await loadLogoDataUrl();

  const doc = new jsPDF('p', 'mm', 'a4');
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const col1 = 18;
  const col2 = W / 2 + 4;
  const colW = (W - 36) / 2;

  // ===== PAGE 1 =====

  drawPageHeader(doc, logoDataUrl);

  let y = 36;
  drawSectionBg(doc, y - 4, 52);

  drawField(doc, col1, y, 'Fecha de visita', data.fechaVisita, colW);
  drawField(doc, col2, y, 'Asesor', data.asesor, colW);
  y += 12;
  drawField(doc, col1, y, 'Dirección', data.direccion, W - 36);
  y += 12;
  drawField(doc, col1, y, 'Propietarios', data.propietarios, colW);
  drawField(doc, col2, y, 'Oficina', data.oficina, colW);
  y += 12;
  drawField(doc, col1, y, 'Zona', data.zona, colW / 2);
  drawField(doc, col1 + colW / 2 + 4, y, 'Teléfonos', data.telefonos, colW / 2);
  drawField(doc, col2, y, 'Razón de venta', data.razonVenta, colW);

  y += 16;

  drawField(doc, col1, y, '¿Necesita comprar?', data.necesitaComprar, colW);
  drawField(doc, col2, y, 'Caract. próxima compra', data.caracteristicasProximaCompra, colW);

  y += 16;

  // EDIFICIO
  y = drawHeader(doc, y, 'EDIFICIO');

  drawSectionBg(doc, y - 4, 40, true);
  drawField(doc, col1, y, 'Año de construcción', data.anoConstruccion, colW / 2);
  drawField(doc, col1 + colW / 2 + 4, y, 'Tipo', data.tipo, colW / 2);
  drawField(doc, col2, y, 'Plantas', data.plantas, colW / 2);
  drawField(doc, col2 + colW / 2 + 4, y, 'Fachada', data.fachada, colW / 2);
  y += 12;
  drawField(doc, col1, y, 'Calefacción', data.calefaccion, colW / 2);
  drawField(doc, col1 + colW / 2 + 4, y, 'Ascensor', data.ascensor, colW / 2);
  drawField(doc, col2, y, 'Portería', data.porteria, colW / 2);
  drawField(doc, col2 + colW / 2 + 4, y, 'Interfono', data.interfono, colW / 2);
  y += 12;
  drawField(doc, col1, y, 'Piscina', data.piscina, colW / 2);
  drawField(doc, col1 + colW / 2 + 4, y, 'Jardín comunitario', data.jardinComunitario, colW / 2);

  y += 18;

  // DESCRIPCIÓN DEL INMUEBLE
  y = drawHeader(doc, y, 'DESCRIPCIÓN DEL INMUEBLE');

  drawSectionBg(doc, y - 4, 52, true);
  drawField(doc, col1, y, 'Planta', data.planta, colW / 3);
  drawField(doc, col1 + colW / 3 + 4, y, 'Dormitorios', data.dormitorios, colW / 3);
  drawField(doc, col1 + (colW / 3) * 2 + 8, y, 'Baños', data.banos, colW / 3);
  drawField(doc, col2, y, 'Estado', data.estado || '—', colW / 2);
  drawField(doc, col2 + colW / 2 + 4, y, 'Gastos comunes', data.gastosComunes, colW / 2);
  y += 12;
  drawField(doc, col1, y, 'Terraza / Balcón', data.terrazaBalcon, colW / 2);
  drawField(doc, col1 + colW / 2 + 4, y, 'Jardín / Patio', data.jardinPatio, colW / 2);
  drawField(doc, col2, y, 'Garaje', data.garaje, colW / 2);

  const orientacion = [
    data.exterior ? 'Exterior' : '',
    data.interior ? 'Interior' : '',
  ]
    .filter(Boolean)
    .join(' / ') || '—';
  drawField(doc, col2 + colW / 2 + 4, y, 'Orientación', orientacion, colW / 2);

  y += 12;
  drawField(doc, col1, y, 'Notas', data.notas, W - 36);

  // ===== PAGE 2 =====
  doc.addPage();

  drawPageHeader(doc, logoDataUrl);

  y = 36;

  // TITULACIÓN Y CARGAS
  y = drawHeader(doc, y, 'TITULACIÓN Y CARGAS', true);

  drawSectionBg(doc, y - 4, 40);
  drawField(doc, col1, y, 'Expectativa cliente', data.expectativaCliente, colW);
  drawField(doc, col2, y, 'Fecha de adquisición', data.fechaAdquisicion, colW);
  y += 12;
  drawField(doc, col1, y, 'Hipoteca', data.hipoteca, colW / 2);
  drawField(doc, col1 + colW / 2 + 4, y, 'Banco', data.banco, colW / 2);
  drawField(doc, col2, y, 'Valoración', data.valoracion, colW);
  y += 12;

  const origen = [
    data.compra ? 'Compra' : '',
    data.herencia ? 'Herencia' : '',
    data.divorcio ? 'Divorcio' : '',
  ]
    .filter(Boolean)
    .join(' / ') || '—';
  drawField(doc, col1, y, 'Origen', origen, colW);

  y += 18;

  // MEDIDAS
  y = drawHeader(doc, y, 'MEDIDAS', true);

  const col3 = col1 + (W - 36) / 3 + 4;
  const col4 = col1 + ((W - 36) / 3) * 2 + 8;
  const colW3 = (W - 36) / 3 - 4;

  const allMedidas: Array<[string, string]> = [
    ['Recibidor', data.recibidor],
    ['Comedor', data.comedor],
    ['Cocina', data.cocina],
  ];

  for (let i = 0; i < data.dormMedidas.length; i++) {
    allMedidas.push([`Dorm. ${i + 1}`, data.dormMedidas[i]]);
  }

  for (let i = 0; i < data.banoMedidas.length; i++) {
    allMedidas.push([`Baño ${i + 1}`, data.banoMedidas[i]]);
  }

  allMedidas.push(
    ['Aseo', data.aseo],
    ['Terraza abierta', data.terrazaAbierta],
    ['Terraza cerrada', data.terrazaCerrada],
    ['Patio', data.patio],
    ['Pasillo dist.', data.pasilloDist],
    ['Galería', data.galeria],
  );

  const cols = [col1, col3, col4];
  const rowCount = Math.ceil(allMedidas.length / 3);
  const bgHeight = rowCount * 12 + 4;

  drawSectionBg(doc, y - 4, bgHeight);

  for (let i = 0; i < allMedidas.length; i++) {
    const colIdx = i % 3;
    if (colIdx === 0 && i > 0) y += 12;

    if (y > H - 30) {
      doc.addPage();
      y = 20;
      drawSectionBg(doc, y - 4, (rowCount - Math.floor(i / 3)) * 12 + 4);
    }

    drawField(doc, cols[colIdx], y, allMedidas[i][0], allMedidas[i][1], colW3);
  }

  y += 16;

  if (y > H - 30) {
    doc.addPage();
    y = 20;
  }

  // Totals
  doc.setFillColor(...OLIVA);
  doc.roundedRect(14, y - 4, W - 28, 14, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text('Totales útiles:', col1, y + 3);
  doc.text(data.totalesUtiles || '—', col1 + 40, y + 3);
  doc.text('Totales const.:', col2, y + 3);
  doc.text(data.totalesConst || '—', col2 + 40, y + 3);

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...GRAY);
    doc.text(
      `Valoración de Inmueble — ${data.direccion || 'Sin dirección'} — Página ${i}/${pageCount}`,
      W / 2,
      doc.internal.pageSize.getHeight() - 8,
      { align: 'center' }
    );
  }

  return doc;
}

export async function exportToPdf(data: ValoracionForm): Promise<void> {
  const doc = await buildPdfDocument(data);
  const filename = `valoracion-${(data.direccion || 'inmueble').replace(/\s+/g, '_').substring(0, 30)}.pdf`;
  doc.save(filename);
}

export async function exportToPdfBlob(data: ValoracionForm): Promise<Blob> {
  const doc = await buildPdfDocument(data);
  return doc.output('blob') as Blob;
}
