import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MetabaseReportsService } from '@services/metabase-reports.service';

@Component({
  selector: 'app-attention-hour',
  imports: [
    CommonModule,
  ],
  templateUrl: './attention-hour.component.html',
})
export class AttentionHourComponent {

  iframeUrl!: SafeResourceUrl;
  private dashboardId = '39'; // ← aquí defines el ID que quieres para este componente

  constructor(
    private metabaseReportsService: MetabaseReportsService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
     this.metabaseReportsService.getDashboardAlosat(this.dashboardId).subscribe(res => {
      const rawUrl = res?.url;
     if (rawUrl?.startsWith('http')) {
    this.iframeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(rawUrl);
    } else {
      console.warn('URL insegura o malformada:', rawUrl);
    }

    });
  }


}
