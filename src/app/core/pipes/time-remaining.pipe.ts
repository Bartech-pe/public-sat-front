import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeRemaining',
  standalone: true,
})
export class TimeRemainingPipe implements PipeTransform {
  transform(value: number | undefined): string {
    if (!value || isNaN(value)) {
      return '';
    }

    const totalSeconds = Math.floor(value);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const parts: string[] = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);

    return parts.join(' ');
  }
}
