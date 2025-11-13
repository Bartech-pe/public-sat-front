import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GenericCrudService } from '@services/generic/generic-crud.service';
import { ChannelAssistance } from '@models/channel-assistance.model';
import { Observable } from 'rxjs';
import { IAttentionRecord } from '@interfaces/features/main/unified-query-system/attentionRecord.interface';

@Injectable({
  providedIn: 'root',
})
export class ChannelAssistanceService extends GenericCrudService<ChannelAssistance> {
  constructor(http: HttpClient) {
    super(http, 'channel-assistances');
  }

  findByDocIde(docIde: string): Observable<ChannelAssistance[]> {
    return this.http.get<ChannelAssistance[]>(
      `${this.url}/findByDocIde/${docIde}`
    );
  }

  findByDocIdentityTyped(docIde: string): Observable<IAttentionRecord[]> {
    return this.http.get<IAttentionRecord[]>(
      `${this.url}/findByDocIde/${docIde}`
    );
  }
}
