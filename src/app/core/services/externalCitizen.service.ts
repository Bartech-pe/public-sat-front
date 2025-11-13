import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '@envs/environments';
export interface CitizenInfo {
  vcontacto: string;
  vnumTel: string;
  vtipDoc: string;
  vdocIde: string;
  email?: string;
}

export interface CitizenQueryPayload {
  psiTipConsulta: number;
  piValPar1: number;
  pvValPar2: string;
}

@Injectable({
  providedIn: 'root',
})
export class ExternalCitizenService {
  private readonly baseUrl = `${environment.apiUrl}v1/omnicanalidad/contacto/listado`;

  constructor(private http: HttpClient) {}

  getCitizenInformation(payload: CitizenQueryPayload): Observable<CitizenInfo[]> {
    const { psiTipConsulta, piValPar1, pvValPar2 } = payload;
    const url = `${this.baseUrl}/${psiTipConsulta}/${piValPar1}/${encodeURIComponent(pvValPar2)}`;

    return this.http.get<CitizenInfo[]>(url);
  }
}
