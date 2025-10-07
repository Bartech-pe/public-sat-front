import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@envs/environments';
import { Observable } from 'rxjs';

interface ForwardCenterMail {
  mailAttentionId: number;
  from: string;
}

@Injectable({
  providedIn: 'root',
})
export class MailService {
  private baseUrl = `${environment.apiUrl}v1/mail-center`;

  private readonly http = inject(HttpClient);

  //GET

  // leer mensajes
  getMessages(): Observable<any> {
    return this.http.get(`${this.baseUrl}/messagesAdvisor`);
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
  replyEmail(mailAttentionId: number, content: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/replyEmailCenter`, {
      mailAttentionId,
      content,
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
  attentionTicket(mailAttentionId: number): Observable<any> {
    return this.http.put<any>(
      `${this.baseUrl}/attentionTicket/${mailAttentionId}`,
      {}
    );
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
  changeEmailState(channelStateId: number): Observable<any> {
    return this.http.put(
      `${this.baseUrl}/changeEmailState/${channelStateId}`,
      {}
    );
  }

   /**
  * Marcar un ticket como "No Wish"
  * @param mailAttentionId id del mail a actualizar
  */
  noWishTicket(mailAttentionId: number): Observable<any> {
    return this.http.put<any>(
      `${this.baseUrl}/noWishTicket/${mailAttentionId}`,
      {}
    );
  }
}
