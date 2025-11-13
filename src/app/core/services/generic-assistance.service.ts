import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GenericCrudService } from '@services/generic/generic-crud.service';
import { GenericAssistance } from '@models/generic-assistance.model';
import { Observable } from 'rxjs';
import { IAttentionRecord } from '@interfaces/features/main/unified-query-system/attentionRecord.interface';

@Injectable({
  providedIn: 'root',
})
export class GenericAssistanceService extends GenericCrudService<GenericAssistance> {
  constructor(http: HttpClient) {
    super(http, 'generic-assistances');
  }

  findByDocIde(docIde: string): Observable<GenericAssistance[]> {
    return this.http.get<GenericAssistance[]>(
      `${this.url}/findByDocIde/${docIde}`
    );
  }

  findByDocIdentityTyped(docIde: string): Observable<IAttentionRecord[]> {
    return this.http.get<IAttentionRecord[]>(
      `${this.url}/findByDocIde/${docIde}`
    );
  }
}
