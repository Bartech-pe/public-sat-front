import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '@envs/environments';
import { BehaviorSubject, catchError, map, Observable, throwError } from 'rxjs';

import { AuthService } from './auth.service';
import { ChatMessage } from '@models/chat-message.model';
import { PaginatedResponse } from '@interfaces/paginated-response.interface';
import { ChatRoom } from '@models/chat-room.model';

@Injectable({
  providedIn: 'root',
})
export class ChatMessageService {
  private readonly apiUrl!: string;

  constructor(private http: HttpClient, private tokenes: AuthService) {
    this.apiUrl = `${environment.apiUrl}v1`;
  }

  private selectedChat = new BehaviorSubject<any>(null);

  private selectedChats$ = new BehaviorSubject<ChatRoom[]>([]);

  setSelectedChat(chats: ChatRoom[]) {
    this.selectedChats$.next(chats);
  }

  getSelectedChats() {
    return this.selectedChats$.asObservable();
  }

  getRoomMessages(channelRoomId: number): Observable<ChatMessage[]> {
    const token = this.tokenes.getToken();

    if (!token) {
      throw new Error('Token no disponible');
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    return this.http
      .get<ChatMessage[]>(`${this.apiUrl}/chat/room/${channelRoomId}/messages`, {
        headers,
      })
      .pipe(
        map((messages) =>
          messages.map((msg) => ({
            ...msg,
            // 🔧 Normalizamos el senderId siempre
            senderId: msg.senderId ?? msg.sender?.id ?? 0,
          }))
        )
      );
  }


  registerMessage(body: ChatMessage): Observable<ChatMessage[]> {
    const { isSender, ...dto } = body;
    return this.http.post<ChatMessage[]>(
      `${this.apiUrl}/chat/room/message`,
      dto
    );
  }

  deleteMessage(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/chat/room/message/${id}`);
  }

  registerMessageImagen(data: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/chat/room/message`, data);
  }

  registerRoomPrivate(data: any): Observable<any> {
    const token = this.tokenes.getToken();

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http
      .post(`${this.apiUrl}/chat/room/private`, data, { headers })
      .pipe(
        catchError((error) => {
          console.error('❌ Error al crear sala privada:', error);
          return throwError(() => error);
        })
      );
  }

  registerRoom(data: any): Observable<any> {
    const token = this.tokenes.getToken();

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.post(`${this.apiUrl}/chat/room`, data, { headers }).pipe(
      catchError((error) => {
        console.error('❌ Error al crear sala privada:', error);
        return throwError(() => error);
      })
    );
  }

  registerRoomGrupo(data: any): Observable<any> {
    const token = this.tokenes.getToken();

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http
      .post(`${this.apiUrl}/chat/room/multiple`, data, { headers })
      .pipe(
        catchError((error) => {
          console.error('❌ Error al crear sala privada:', error);
          return throwError(() => error);
        })
      );
  }

  getAllWithToken(
    limit?: number,
    offset?: number,
    q?: string
  ): Observable<PaginatedResponse<any>> {
    const token = this.tokenes.getToken();

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    const params = new URLSearchParams();
    if (limit !== undefined) params.set('limit', limit.toString());
    if (offset !== undefined) params.set('offset', offset.toString());
    if (q) params.set('q', q);

    const queryString = params.toString();

    return this.http.get<PaginatedResponse<any>>(
      `${this.apiUrl}/chat/room?${queryString}`,
      { headers }
    );
  }

  deleteRoom(id: number) {
    const token = this.tokenes.getToken();
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.delete(`${environment.apiUrl}v1/chat/room/${id}`, {
      headers,
    });
  }

  deleteUserGroup(id: number) {
    const token = this.tokenes.getToken();
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.delete(
      `${environment.apiUrl}v1/chat/room/userGroup/${id}`,
      { headers }
    );
  }
}
