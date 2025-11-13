import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@envs/enviroments';

@Injectable({
  providedIn: 'root',
})
export class OmnicanalidadService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/omnicanalidad`;

  getInfoContactoCelular(
    psiTipConsulta: number,
    piValPar1: number,
    pvValPar2: string
  ) {
    return this.http.get<any[]>(
      `${this.url}/contacto/listado/${psiTipConsulta}/${piValPar1}/${pvValPar2}`
    );
  }

  infoContactoCelular(
    psiTipConsulta: number,
    piValPar1: number,
    pvValPar2: string
  ) {
    return this.http.get<any[]>(
      `${this.url}/contacto/listado/${psiTipConsulta}/${piValPar1}/${pvValPar2}`
    );
  }

  consultarTramite(psiTipDId: number, numDoc: number) {
    return this.http.get<any[]>(
      `${this.url}/solicitud/consultarTramite/${psiTipDId}/${numDoc}`
    );
  }

  consultarPapeleta(psiTipDId: number, numDoc: number) {
    return this.http.get<any[]>(
      `${this.url}/deuda/consultarPapeleta/${psiTipDId}/${numDoc}`
    );
  }

  consultarMultaAdm(psiTipDId: 1 | 2, numDoc: number) {
    return this.http.get<any[]>(
      `${this.url}/deuda/consultarMultaAdm/${psiTipDId}/${numDoc}`
    );
  }
}
