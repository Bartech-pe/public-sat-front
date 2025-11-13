import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@envs/enviroments';
import { Observable } from 'rxjs';

interface ForwardCenterMail {
    mailAttentionId: number;
    from: string;
  }

@Injectable({
  providedIn: 'root',
})
export class MailService {
  private apiUrl = `${environment.apiUrl}/v1`;

  constructor(private http: HttpClient) {}

  //GET

  // leer mensajes
  getMessages(): Observable<any> {
    return this.http.get(
      `http://localhost:3000/v1/mail-center/messagesAdvisor`
    )
  }
  
  /**
   * Listar correos abiertos por asesor
   * @param query filtros opcionales
   */
  getMessagesAdvisorOpen(query?: any): Observable<any> {
    return this.http.get<any>(`http://localhost:3000/v1/mail-center/messagesAdvisorOpen`, {
      params: query,
    });
  }

  /**
   * Listar correos cerrados por asesor
   * @param query filtros opcionales
   */
  getMessagesAdvisorClose(query?: any): Observable<any> {
    return this.http.get<any>(`http://localhost:3000/v1/mail-center/messagesAdvisorClose`, {
      params: query,
    });
  }

  getMessagesNoAdvisor(query?: any): Observable<any> {
    return this.http.get<any>(`http://localhost:3000/v1/mail-center/messagesNoAdvisor`, {
      params: query,
    });
  }

  /**
   * Obtener detalle de un correo
   * @param messageId id del correo
   */
  getMessageDetail(mailAttentionId: number): Observable<any> {
    return this.http.get<any>(
      `http://localhost:3000/v1/mail-center/messageDetail/${mailAttentionId}`
    );
  }


  /**
   * Obtener correos por id del asesor
   * 
   */
  getTicketsByAdvisor(query: any): Observable<any> {
    const params = new HttpParams({ fromObject: query });
    return this.http.get(`http://localhost:3000/v1/mail-center/messagesAdvisor`, { params });
  }


  //POST

  /**
   * Enviar un correo
   * @param mailAttentionId id de la atención (hilo)
   * @param content contenido de la respuesta
   */
  sendCenterEmail(formData: FormData): Observable<any> {
    return this.http.post<any>(
      'http://localhost:3000/v1/mail-center/sendcenteremail',
      formData
    );
  }

  /**
   * Responder un correo
   * @param mailAttentionId id de la atención (hilo)
   * @param content contenido de la respuesta
   */
  replyEmail(mailAttentionId: number, content: string): Observable<any> {
    return this.http.post<any>(`http://localhost:3000/v1/mail-center/replyEmailCenter`, {
      mailAttentionId,
      content,
    });
  }

  /**
   * Reenvia/derivacion de correo
   * 
   */
  forwardEmail(body: ForwardCenterMail): Observable<any> {
    return this.http.post(`http://localhost:3000/v1/mail-center/forwardtoCenter`, body);
  }



  //PUT

  /**
   * Cerrar un ticket de correo
   * @param mailThreadId id del hilo
   */
  closeTicket(mailThreadId: number): Observable<any> {
    return this.http.put<any>(
      `http://localhost:3000/v1/mail-center/closeTicket/${mailThreadId}`,
      {}
    );
  }

  /**
   * Rebalanceo de correos entre asesores
   * 
   */
  rebalanceAdvisors(): Observable<any> {
    return this.http.put(`http://localhost:3000/v1/mail-center/rebalance`, {});
  }


}
