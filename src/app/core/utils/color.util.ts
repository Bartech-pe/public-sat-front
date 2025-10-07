export function getContrastColor(hex: string): string {
  // Eliminar el "#"
  const color = hex.replace('#', '');

  // Convertir a RGB
  const r = parseInt(color.substring(0, 2), 16);
  const g = parseInt(color.substring(2, 4), 16);
  const b = parseInt(color.substring(4, 6), 16);

  // Calcular luminancia relativa (fórmula W3C)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Devolver blanco o negro según contraste
  return luminance > 0.75 ? '#000000' : '#FFFFFF';
}
