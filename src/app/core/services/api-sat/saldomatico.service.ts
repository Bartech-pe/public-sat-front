import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@envs/enviroments';

@Injectable({
  providedIn: 'root',
})
export class SaldomaticoService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/saldomatico`;

  impuestoPredialInfo(piValPar1: 1 | 2, pvValPar2: number) {
    return this.http.get<any[]>(
      `${this.url}/impuestoPredial/${piValPar1}/${pvValPar2}`
    );
  }

  papeletaInfo(piValPar1: 1 | 2, pvValPar2: number) {
    return this.http.get<any[]>(
      `${this.url}/papeletaInfo/${piValPar1}/${pvValPar2}`
    );
  }
}
