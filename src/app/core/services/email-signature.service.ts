import { Injectable } from '@angular/core';
import { GenericCrudService } from '@services/generic/generic-crud.service';
import { HttpClient } from '@angular/common/http';
import { EmailSignature } from '@models/email-signature.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EmailSignatureService extends GenericCrudService<EmailSignature> {
  constructor(http: HttpClient) {
    super(http, 'email-signatures');
  }

  findOneByTokenUserId(): Observable<EmailSignature> {
    return this.http.get<EmailSignature>(`${this.url}/byTokenUserId`);
  }
}
