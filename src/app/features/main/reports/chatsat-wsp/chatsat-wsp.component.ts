import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MetabaseReportsService } from '@services/metabase-reports.service';

@Component({
  selector: 'app-chatsat-wsp',
  imports: [
    CommonModule,
  ],
  templateUrl: './chatsat-wsp.component.html',
})
export class ChatsatWspComponent {

  iframeUrl!: SafeResourceUrl;
  private dashboardId = '42';

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
