export const fileIcons: Record<string, string> = {
  // Documentos
  'application/pdf': 'mdi:file-pdf-box',
  'application/msword': 'mdi:file-word',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
    'mdi:file-word',
  'application/vnd.ms-excel': 'mdi:file-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
    'mdi:file-excel',
  'text/plain': 'mdi:file-document-outline',

  // Imágenes
  'image/jpeg': 'mdi:file-image',
  'image/png': 'mdi:file-image',
  'image/gif': 'mdi:file-image',
  'image/svg+xml': 'mdi:file-image',

  // Videos
  'video/mp4': 'mdi:file-video',
  'video/mpeg': 'mdi:file-video',

  // Audio
  'audio/mpeg': 'mdi:file-music',
  'audio/wav': 'mdi:file-music',

  // Comprimidos
  'application/zip': 'mdi:folder-zip',
  'application/x-rar-compressed': 'mdi:folder-zip',
  'application/x-7z-compressed': 'mdi:folder-zip',

  // Código
  'application/json': 'mdi:code-json',
  'text/html': 'mdi:language-html5',
  'text/css': 'mdi:language-css3',
  'application/javascript': 'mdi:language-javascript',
  'application/typescript': 'mdi:language-typescript',
  'application/octet-stream': 'flowbite:file-code-solid',
};

export const escapeRegex = (s: string): string => {
    // Escapa caracteres especiales para construir RegExp dinámico
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }