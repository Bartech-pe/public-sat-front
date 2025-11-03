import { Pipe, PipeTransform } from '@angular/core';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

@Pipe({
  name: 'timeAgo',
  pure: false,
})
export class TimeAgoPipe implements PipeTransform {
  transform(value: Date | string): string {
    if (!value) return '';

    const date = new Date(value);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);

    // Si es menos de 60 segundos, mostrar los segundos exactos
    if (diffSeconds < 60) {
      return `Hace ${diffSeconds} segundo${diffSeconds !== 1 ? 's' : ''}`;
    }

    // Para 1 minuto o más, usar date-fns normalmente
    return `Hace 
      ${formatDistanceToNow(date, { locale: es, addSuffix: false })}`.replace(
      'alrededor de ',
      ''
    );
  }
}
