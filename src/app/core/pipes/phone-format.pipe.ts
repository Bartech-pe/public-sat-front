import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'phoneFormat'
})
export class PhoneFormatPipe implements PipeTransform {
  transform(value?: string): string | undefined {
    if (!value) return value;

    const digits = value.toString().replace(/\D/g, '');

    if (digits.startsWith('51') && digits.length === 11) {
      const part1 = digits.slice(2, 5);  // 951
      const part2 = digits.slice(5, 8);  // 277
      const part3 = digits.slice(8);     // 117
      return `(+51) ${part1} ${part2} ${part3}`;
    }

    return value.toString(); // fallback if not valid
  }
}
