import * as XLSX from 'xlsx';
import type { ValoracionForm } from '../types';

interface FieldDef {
  key: string;
  label: string;
}

const staticFields: FieldDef[] = [
  { key: 'fechaVisita', label: 'Fecha de visita' },
  { key: 'asesor', label: 'Asesor' },
  { key: 'direccion', label: 'Dirección' },
  { key: 'propietarios', label: 'Propietarios' },
  { key: 'oficina', label: 'Oficina' },
  { key: 'zona', label: 'Zona' },
  { key: 'telefonos', label: 'Teléfonos' },
  { key: 'razonVenta', label: 'Razón de venta' },
  { key: 'necesitaComprar', label: '¿Necesita comprar?' },
  { key: 'caracteristicasProximaCompra', label: 'Características próxima compra' },

  { key: 'anoConstruccion', label: 'Año de construcción' },
  { key: 'tipo', label: 'Tipo' },
  { key: 'plantas', label: 'Plantas' },
  { key: 'fachada', label: 'Fachada' },
  { key: 'calefaccion', label: 'Calefacción' },
  { key: 'ascensor', label: 'Ascensor' },
  { key: 'porteria', label: 'Portería' },
  { key: 'interfono', label: 'Interfono' },
  { key: 'piscina', label: 'Piscina' },
  { key: 'jardinComunitario', label: 'Jardín comunitario' },

  { key: 'planta', label: 'Planta' },
  { key: 'dormitorios', label: 'Dormitorios' },
  { key: 'banos', label: 'Baños' },
  { key: 'estado', label: 'Estado' },
  { key: 'gastosComunes', label: 'Gastos comunes' },
  { key: 'terrazaBalcon', label: 'Terraza / Balcón' },
  { key: 'jardinPatio', label: 'Jardín / Patio' },
  { key: 'garaje', label: 'Garaje' },
  { key: 'exterior', label: 'Exterior' },
  { key: 'interior', label: 'Interior' },
  { key: 'notas', label: 'Notas' },

  { key: 'expectativaCliente', label: 'Expectativa cliente' },
  { key: 'fechaAdquisicion', label: 'Fecha de adquisición' },
  { key: 'hipoteca', label: 'Hipoteca' },
  { key: 'banco', label: 'Banco' },
  { key: 'compra', label: 'Compra' },
  { key: 'herencia', label: 'Herencia' },
  { key: 'divorcio', label: 'Divorcio' },
  { key: 'valoracion', label: 'Valoración' },

  { key: 'recibidor', label: 'Recibidor' },
  { key: 'comedor', label: 'Comedor' },
  { key: 'cocina', label: 'Cocina' },
];

const afterDynamicFields: FieldDef[] = [
  { key: 'aseo', label: 'Aseo' },
  { key: 'terrazaAbierta', label: 'Terraza abierta' },
  { key: 'terrazaCerrada', label: 'Terraza cerrada' },
  { key: 'patio', label: 'Patio' },
  { key: 'pasilloDist', label: 'Pasillo dist.' },
  { key: 'galeria', label: 'Galería' },
  { key: 'totalesUtiles', label: 'Totales útiles' },
  { key: 'totalesConst', label: 'Totales const.' },
];

export function exportToExcel(data: ValoracionForm): void {
  const rows: Array<{ Campo: string; Valor: string }> = [];

  for (const { key, label } of staticFields) {
    const value = data[key as keyof ValoracionForm];
    const displayValue = typeof value === 'boolean' ? (value ? 'Sí' : 'No') : String(value ?? '');
    rows.push({ Campo: label, Valor: displayValue });
  }

  for (let i = 0; i < data.dormMedidas.length; i++) {
    rows.push({ Campo: `Dorm. ${i + 1} (m²)`, Valor: data.dormMedidas[i] });
  }

  for (let i = 0; i < data.banoMedidas.length; i++) {
    rows.push({ Campo: `Baño ${i + 1} (m²)`, Valor: data.banoMedidas[i] });
  }

  for (const { key, label } of afterDynamicFields) {
    const value = data[key as keyof ValoracionForm];
    const displayValue = typeof value === 'boolean' ? (value ? 'Sí' : 'No') : String(value ?? '');
    rows.push({ Campo: label, Valor: displayValue });
  }

  const ws = XLSX.utils.json_to_sheet(rows);
  ws['!cols'] = [{ wch: 35 }, { wch: 50 }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Valoración');

  const filename = `valoracion-${(data.direccion || 'inmueble').replace(/\s+/g, '_').substring(0, 30)}.xlsx`;
  XLSX.writeFile(wb, filename);
}

export function exportToExcelBlob(data: ValoracionForm): Blob {
  const rows: Array<{ Campo: string; Valor: string }> = [];

  for (const { key, label } of staticFields) {
    const value = data[key as keyof ValoracionForm];
    const displayValue = typeof value === 'boolean' ? (value ? 'Sí' : 'No') : String(value ?? '');
    rows.push({ Campo: label, Valor: displayValue });
  }

  for (let i = 0; i < data.dormMedidas.length; i++) {
    rows.push({ Campo: `Dorm. ${i + 1} (m²)`, Valor: data.dormMedidas[i] });
  }

  for (let i = 0; i < data.banoMedidas.length; i++) {
    rows.push({ Campo: `Baño ${i + 1} (m²)`, Valor: data.banoMedidas[i] });
  }

  for (const { key, label } of afterDynamicFields) {
    const value = data[key as keyof ValoracionForm];
    const displayValue = typeof value === 'boolean' ? (value ? 'Sí' : 'No') : String(value ?? '');
    rows.push({ Campo: label, Valor: displayValue });
  }

  const ws = XLSX.utils.json_to_sheet(rows);
  ws['!cols'] = [{ wch: 35 }, { wch: 50 }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Valoración');

  const arrayBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  return new Blob([arrayBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}
