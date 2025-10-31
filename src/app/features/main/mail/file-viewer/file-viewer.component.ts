import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { environment } from '@envs/environments';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-file-viewer',
  imports: [CommonModule],
  templateUrl: './file-viewer.component.html',
  styles: ``,
})
export class FileViewerComponent implements OnInit {
  mediaUrl: string = environment.apiUrl;

  public readonly ref = inject(DynamicDialogRef);

  public readonly config = inject(DynamicDialogConfig);

  private readonly sanitizer = inject(DomSanitizer);

  typeGroup?: 'image' | 'video' | 'audio' | 'pdf' | 'text' | 'other';

  safeUrl?: SafeResourceUrl;

  isAttach: boolean = false;

  filename?: string;

  ngOnInit(): void {
    const { attach } = this.config.data;

    this.isAttach = !!attach;

    if (attach) {
      this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
        `${this.mediaUrl.replace(/\/$/, '')}/${attach.publicUrl.replace(
          /^\//,
          ''
        )}`
      );
      this.filename = attach.filename;
      this.detectType(attach.mimeType);
    }
  }

  private detectType(mime: string) {
    if (mime.startsWith('image/')) this.typeGroup = 'image';
    else if (mime.startsWith('video/')) this.typeGroup = 'video';
    else if (mime.startsWith('audio/')) this.typeGroup = 'audio';
    else if (mime === 'application/pdf') this.typeGroup = 'pdf';
    else if (mime.startsWith('text/')) this.typeGroup = 'text';
    else this.typeGroup = 'other';
  }
}
