import { Workbook } from 'exceljs';
import { saveAs } from 'file-saver';

function exportExcelFile(headers: string[], fileName: string) {
  const workbook = new Workbook();
  const worksheet = workbook.addWorksheet('Plantilla');

  // Agregar fila de encabezados
  worksheet.addRow(headers);

  // Ajustar ancho automático
  headers.forEach((h, i) => {
    worksheet.getColumn(i + 1).width = h.length + 5;
  });

  // Generar archivo
  workbook.xlsx.writeBuffer().then((buffer) => {
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    saveAs(blob, fileName);
  });
}

/* ======================================
   PLANTILLA 1
====================================== */

export function descargarPlantillaExcel() {
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

  exportExcelFile(headers, 'plantilla-carga.xlsx');
}

/* ======================================
   PLANTILLA 2
====================================== */

export function downloadEmailExcel() {
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

  exportExcelFile(headers, 'plantilla-campaña-correo.xlsx');
}

/* ======================================
   PLANTILLA 3 (AUDIO)
====================================== */

export function descargarPlantillaExcelAudio() {
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

  exportExcelFile(headers, 'plantilla-campaña_audio.xlsx');
}
