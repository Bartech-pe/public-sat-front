import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MetabaseReportsService } from '@services/metabase-reports.service';

@Component({
  selector: 'app-cons-consultas',
  imports: [
    CommonModule,
  ],
  templateUrl: './cons-consultas.component.html',
})
export class ConsConsultasComponent { 

  iframeUrl!: SafeResourceUrl;
  private dashboardId = '41';

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
