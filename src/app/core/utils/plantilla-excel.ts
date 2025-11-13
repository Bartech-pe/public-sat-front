import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
export function descargarPlantillaExcel() {
  //'PAGO',
  const headers = [
    'SECTORISTA',
    'SEGMENTO',
    'PERFIL',
    'CONTRIBUYENTE',
    'TIPO DE CONTRIBUYENTE',
    'TIPO DOC. IDE.',
    'N° DOC. IDE.',
    'CODIGO DE CONTRIBUYENTE',
    'DEUDA',
    'TELEFONO 1',
    'TELEFONO 2',
    'TELEFONO 3',
    'TELEFONO 4',
    'WHATSAPP',
    'EMAIL',
  ];

  const worksheet = XLSX.utils.aoa_to_sheet([headers]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Plantilla');

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
  saveAs(blob, 'plantilla-carga.xlsx');
}


export function downloadEmailExcel() {
  //'PAGO',
  const headers = [
    'CORREO',
    'NOMBRE',
    'CELULAR',
    'PLACA',
    'ANIO',
    'PERIODO',
    'DEUDA',
    'CTA_CTE',
    'CODIGO',
    'SECTORISTA',
    'WHATSAPP',
  ];

  const worksheet = XLSX.utils.aoa_to_sheet([headers]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Plantilla');

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
  saveAs(blob, 'plantilla-campaña-correo.xlsx');
}

export function descargarPlantillaExcelAudio() {
  //'PAGO',
  const headers = [
    'TIPO',
    'DOCUMENTO',
    'OBLIGADO',
    'TELEFONO',
    'PAPELETA',
    'PLACA',
    'IMPORTE',
    'DESCUENTO',
    'TOTAL',
    'ESTADO',
  ];

  const worksheet = XLSX.utils.aoa_to_sheet([headers]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Plantilla');

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
  saveAs(blob, 'plantilla-campaña_audio.xlsx');
}
