import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MetabaseReportsService } from '@services/metabase-reports.service';

@Component({
  selector: 'app-vicidial-reports',
  imports: [
    CommonModule
  ],
  templateUrl: './vicidial-reports.component.html',
})
export class VicidialReportsComponent {

  iframeUrl!: SafeResourceUrl;
  private dashboardId = '44';

  constructor(
    private metabaseReportsService: MetabaseReportsService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {

    this.metabaseReportsService.generateVicidialReportUrl().subscribe(res => {
      let rawUrl = res?.url?.trim();
      if (rawUrl?.startsWith('http')) {
        this.iframeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(rawUrl);
      } else {
        console.warn('URL insegura o malformada:', rawUrl);
      }
    });
  };

}
