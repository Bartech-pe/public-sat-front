import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@envs/environments';
import { PaginatedResponse } from '@interfaces/paginated-response.interface';
import { ForwardCenterMail } from '@models/mail-forward.model';
import { MailDto } from '@models/mail.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MailService {
  private baseUrl = `${environment.apiUrl}v1/mail-center`;

  private readonly http = inject(HttpClient);

  //GET

  // leer mensajes
  getMailTickets(
    limit?: number,
    offset?: number,
    q?: Record<string, any>
  ): Observable<PaginatedResponse<MailDto>> {
    const query = q ? `q=${encodeURIComponent(JSON.stringify(q))}` : '';
    const limitQ = limit ? `limit=${limit}&` : '';
    const offsetQ = limit ? `offset=${offset}&` : '';
    return this.http.get<PaginatedResponse<MailDto>>(
      `${this.baseUrl}/messagesAdvisor?${limitQ}${offsetQ}${query}`
    );
  }

  /**
   * Listar correos abiertos por asesor
   * @param query filtros opcionales
   */
  getMessagesAdvisorOpen(query?: any): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/messagesAdvisorOpen`, {
      params: query,
    });
  }

  /**
   * Listar correos cerrados por asesor
   * @param query filtros opcionales
   */
  getMessagesAdvisorClose(query?: any): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/messagesAdvisorClose`, {
      params: query,
    });
  }

  getMessagesNoAdvisor(query?: any): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/messagesNoAdvisor`, {
      params: query,
    });
  }

  /**
   * Obtener detalle de un correo
   * @param messageId id del correo
   */
  getMessageDetail(mailAttentionId: number): Observable<any> {
    return this.http.get<any>(
      `${this.baseUrl}/messageDetail/${mailAttentionId}`
    );
  }

  /**
   * Obtener correos por id del asesor
   *
   */
  getTicketsByAdvisor(query: any): Observable<any> {
    const params = new HttpParams({ fromObject: query });
    return this.http.get(`${this.baseUrl}/messagesAdvisor`, {
      params,
    });
  }

  /**
   * Listar correos sin deseo (no wish) por asesor
   * @param query filtros opcionales
   */
  getMessagesAdvisorNoWish(query?: any): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/messagesAdvisorNoWish`, {
      params: query,
    });
  }

  //POST

  /**
   * Enviar un correo
   * @param mailAttentionId id de la atención (hilo)
   * @param content contenido de la respuesta
   */
  sendEmailCenter(formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/sendEmailCenter`, formData);
  }

  /**
   * Responder un correo
   * @param mailAttentionId id de la atención (hilo)
   * @param content contenido de la respuesta
   */
  replyEmail(
    mailAttentionId: number,
    content: string,
    threadId?: number
  ): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/replyEmailCenter`, {
      mailAttentionId,
      content,
      threadId,
    });
  }

  /**
   * Reenvia/derivacion de correo
   *
   */
  forwardEmail(body: ForwardCenterMail): Observable<any> {
    return this.http.post(`${this.baseUrl}/forwardtoCenter`, body);
  }

  //PUT

  /**
   * Cerrar un ticket de correo
   * @param mailThreadId id del hilo
   */
  closeTicket(mailAttentionId: number): Observable<any> {
    return this.http.put<any>(
      `${this.baseUrl}/closeTicket/${mailAttentionId}`,
      {}
    );
  }

  /**
   * Cerrar un ticket de correo
   * @param mailThreadId id del hilo
   */
  closeMultipleTicket(mailAttentionIds: number[]): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/closeTicketMultiple`, {
      mailAttentionIds,
    });
  }

  /**
   * Poner ticket en Atención
   * @param mailAttentionId id del mail a actualizar
   */
  attentionTicket(mailAttentionIds: number[]): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/attentionTicket`, {
      mailAttentionIds,
    });
  }

  /**
   * Rebalanceo de correos entre asesores
   *
   */
  rebalanceAdvisors(): Observable<any> {
    return this.http.put(`${this.baseUrl}/rebalance`, {});
  }

  /**
   * Cambiar el estado de correos entre asesores
   *
   */
  changeEmailMyState(channelStateId: number): Observable<any> {
    return this.http.put(
      `${this.baseUrl}/changeEmailMyState/${channelStateId}`,
      {}
    );
  }

  /**
   * Cambiar el estado de correos entre asesores
   *
   */
  changeEmailState(userId: number, channelStateId: number): Observable<any> {
    return this.http.put(
      `${this.baseUrl}/changeEmailState/${userId}/${channelStateId}`,
      {}
    );
  }

  /**
   * Marcar un ticket como "No Wish"
   * @param mailAttentionId id del mail a actualizar
   */
  noWishTicket(mailAttentionIds: number[]): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/noWishTicket`, {
      mailAttentionIds,
    });
  }
}
