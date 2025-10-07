import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@envs/environments';

@Injectable({
  providedIn: 'root',
})
export class SaldomaticoService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}v1/saldomatico`;

  impuestoPredialInfo(piValPar1: 1 | 2 | 5, pvValPar2: string) {
    return this.http.get<any[]>(
      `${this.url}/impuestoPredial/${piValPar1}/${pvValPar2}`
    );
  }

  papeletaInfo(piValPar1: 1 | 2, pvValPar2: number) {
    return this.http.get<any[]>(
      `${this.url}/papeletaInfo/${piValPar1}/${pvValPar2}`
    );
  }

  /**
   * @param psiTipConsulta 1 RUC, 2 DNI, 5 COD. CONTRIBUYENTE
   * @param pvValor número de documento
   */
  deudasInfo(psiTipConsulta: 1 | 2 | 5, pvValor: string) {
    return this.http.get<any[]>(
      `${this.url}/deudasInfo/${psiTipConsulta}/${pvValor}`
    );
  }
}
