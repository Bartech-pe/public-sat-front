import { Pipe, PipeTransform } from '@angular/core';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'markdown'
})
export class MarkdownPipe implements PipeTransform {

  constructor(private sanitizer: DomSanitizer) {
    marked.setOptions({
      gfm: true,
      breaks: true
    });
  }

  transform(value: string | null): SafeHtml {
    if (!value) return '';

    const rawHtml = marked.parse(value, { async: false }) as string;
    const cleanHtml = DOMPurify.sanitize(rawHtml);
    return this.sanitizer.bypassSecurityTrustHtml(cleanHtml);
  }
}
