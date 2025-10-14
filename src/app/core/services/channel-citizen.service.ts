import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@envs/environments';
import { IBaseResponseDto } from '@interfaces/commons/base-response.interface';
import { Observable } from 'rxjs';

export interface IGetAttentionsOfCitizen {
  startDate: Date;
  endDate?: Date | null;
  type: string;
  category: string;
  channel?: string;
  advisorIntervention?: boolean;
  user?: string;
  email?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ChannelCitizenService {
  private readonly url = `${environment.apiUrl}v1/channel-citizen`;

  constructor(private http: HttpClient) {}

 getAssistancesByDocumentNumber(dni?: string): Observable<IBaseResponseDto<IGetAttentionsOfCitizen[]>> {
    try {
      return this.http.get<IBaseResponseDto<IGetAttentionsOfCitizen[]>>(
        `${this.url}/${dni}/attentions`
      );6
    } catch (error) {
      console.log(error);
      throw new Error('No se pudo enviar el mensaje');
    }
  }
}
