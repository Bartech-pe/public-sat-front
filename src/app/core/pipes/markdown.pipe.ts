import { Pipe, PipeTransform } from '@angular/core';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'markdown',
})
export class MarkdownPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {
    marked.setOptions({
      gfm: true,
      breaks: true,
    });
  }

  transform(value: string | null): SafeHtml {
    if (!value) return '';

    const normalized = value.trim().replace(/^\s+/gm, '');

    // 2. Convierte markdown a HTML
    const rawHtml = marked.parse(normalized) as string;

    // 3. Asegura que los links sean seguros y abran en otra pestaña
    const withSafeLinks = rawHtml.replace(
      /<a /g,
      '<a target="_blank" rel="noopener noreferrer" '
    );

    // 4. Limpia el HTML
    const cleanHtml = DOMPurify.sanitize(withSafeLinks, {
      FORBID_TAGS: ['script', 'style'],
    });

    return this.sanitizer.bypassSecurityTrustHtml(cleanHtml);
  }
}
