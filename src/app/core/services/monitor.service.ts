import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@envs/environments';
import { AttentionDate } from '@models/attention-date.model';
import { AttentionDetail } from '@models/attention-detail.model';
import { ChannelCount } from '@models/channel-count.model';
import { ChatAdvisor } from '@models/chat-advisor.model';
import { ChatWspAdvisor } from '@models/chat-wsp-advisor.model';
import { MailCount } from '@models/count-mail';
import { MailAdvisor } from '@models/mail-advisor.model';
import { StateDetailsByAdvisor } from '@models/state-detail-by-advisor.model';
import { VicidialCount } from '@models/vicidial-count-box.model';
import { VicidialReport } from '@models/vicidial-report.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MonitorService {

  private baseUrl = `${environment.apiUrl}v1/monitor`;

  private readonly http = inject(HttpClient);

  //falta contador de Aló sat pro falta de data.

  /**
  * Cantidad de chats
  */
  getCountChat(): Observable<ChannelCount> {
    return this.http.get<any>(`${this.baseUrl}/countChat`);
  }

  /**
   * Cantidad de WhatsApp
   */
  getCountWSP(): Observable<ChannelCount> {
    return this.http.get<any>(`${this.baseUrl}/countWSP`);
  }

  /**
   * Cantidad de correos
   */
  getCountMail(): Observable<MailCount> {
    return this.http.get<any>(`${this.baseUrl}/countMail`);
  }





  /**
   * Reporte Vicidial - Conteo
   */
  getMonitorVicidialCount(): Observable<VicidialCount> {
    return this.http.get<any>(`${this.baseUrl}/monitorVicidialCount`);
  }





  /**
   * Correos abiertos por asesor
   */
  getMonitorAdvisorsMail(): Observable<MailAdvisor[]> {
    return this.http.get<MailAdvisor[]>(`${this.baseUrl}/monitorAdvisorsMail`);
  }
  /**
   * Chats abiertos por asesor
   */
  getMonitorAdvisorsChat(): Observable<ChatAdvisor[]> {
    return this.http.get<ChatAdvisor[]>(`${this.baseUrl}/monitorAdvisorsChat`);
  }

  /**
   * Chats WSP abiertos por asesor
   */
  getMonitorAdvisorsChatWsp(): Observable<ChatWspAdvisor[]> {
    return this.http.get<ChatWspAdvisor[]>(`${this.baseUrl}/monitorAdvisorsChatWsp`);
  }




  /**
   * Reporte Vicidial - Tabla
   */
  getMonitorVicidialReport(): Observable<VicidialReport[]> {
    return this.http.get<VicidialReport[]>(`${this.baseUrl}/monitorVicidialReport`);
  }




   /**
   * 🧾 Detalles de estados por asesor
   * @param agent ID del agente
   * @param start Fecha inicio (YYYY-MM-DD)
   * @param finish Fecha fin (YYYY-MM-DD)
   */
  getStateDetailsByAdvisor(
    agent: number,
    start: string,
    finish: string
  ): Observable<StateDetailsByAdvisor[]> {
    return this.http.get<StateDetailsByAdvisor[]>(
      `${this.baseUrl}/stateDetailsByAdvisor/${agent}/${start}/${finish}`
    );
  }

  /**
   * 📊 Conteo para dashboard Vicidial
   */
  getMonitorVicidialCountDashBoard(): Observable<VicidialCount> {
    return this.http.get<VicidialCount>(
      `${this.baseUrl}/monitorVicidialCountDashBoard`
    );
  }

  /**
   * 👤 Detalle de atención por usuario
   * @param userId ID del usuario
   */
  getAttentionDetail(userId: number): Observable<AttentionDetail> {
    return this.http.get<AttentionDetail>(
      `${this.baseUrl}/attentionDetail/${userId}`
    );
  }

  /**
   * 📅 Detalle de atención por fecha
   * @param date Fecha en formato YYYY-MM-DD
   */
  getAttentionDate(date: string): Observable<AttentionDate> {
    return this.http.get<AttentionDate>(
      `${this.baseUrl}/attentionDate/${date}`
    );
  }

}
