import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@envs/environments';
import { IBaseResponseDto } from '@interfaces/commons/base-response.interface';
import { Observable } from 'rxjs';


export interface IChannelCitizen {
  id: number;
  externalUserId?: string;
  name: string;
  fullName?: string | null;
  isExternal: boolean;
  phoneNumber?: string;
  documentNumber?: string | null;
  documentType?: 'DNI' | 'CE' | 'OTRO' | null;
  email?: string;
  avatarUrl?: string;
}
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

  getCitizenInformationByChannelRoomAssigned(channelRoomId: number): Observable<IBaseResponseDto<IChannelCitizen>> {
    try {
      return this.http.get<IBaseResponseDto<IChannelCitizen>>(
        `${this.url}/channel-room/${channelRoomId}`
      );
    } catch (error) {
      console.log(error);
      throw new Error('No se pudo enviar el mensaje');
    }
  }
}
