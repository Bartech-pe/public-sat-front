import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  private estadosChat: { [chatId: string]: 'resuelto' | 'pospuesto' | 'pendiente' | null } = {};

  constructor(
    private http: HttpClient,
  ) {
    const saved = localStorage.getItem('estadosChat');
    if (saved) this.estadosChat = JSON.parse(saved);
  }

  getNewMessages(): Observable<any[]> {
    return this.http.get<any[]>('/api/mensajes/nuevos');
  }

  setEstado(chatId: number, estado: 'resuelto' | 'pospuesto' | 'pendiente' | null) {
    this.estadosChat[chatId] = estado;
    localStorage.setItem('estadosChat', JSON.stringify(this.estadosChat));
  }

  getEstado(chatId: number): 'resuelto' | 'pospuesto' | 'pendiente' | null {
    return this.estadosChat[chatId] || null;
  }

  getAllEstados(): { [chatId: string]: 'resuelto' | 'pospuesto' | 'pendiente' | null } {
    return this.estadosChat;
  }

}
