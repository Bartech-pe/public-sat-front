import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { environment } from '@envs/environments';
import { Observable, Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';

@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket?: Socket;
  private readonly SERVER_URL = environment.apiUrl;

  private requestAdvisorSubject = new Subject<{ userId: number }>();

  private requestUserPhoneStateSubject = new Subject<{ userId: number }>();

  private requestPhoneCallSubject = new Subject<{ userId: number }>();

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      this.initializeSocketConnection();
    }
  }

  private initializeSocketConnection(): void {
    console.log('initializeSocketConnection');

    this.socket = io(this.SERVER_URL, {
      transports: ['websocket'], // evita polling
      withCredentials: true,
    });

    this.socket.on('connect', () => {
      console.log('✅ Conectado al servidor Socket.IO');
    });

    this.socket.on('disconnect', () => {
      console.warn('⚠️ Desconectado del servidor Socket.IO');
    });

    this.socket.on('respuesta', (data: any) => {
      console.log('📩 Respuesta del servidor:', data);
    });

    this.socket.on('email.request', (paload: { userId: number }) => {
      this.requestAdvisorSubject.next(paload);
    });

    this.socket.on('user.phone.state.request', (paload: { userId: number }) => {
      console.log('user.phone.state.request');
      this.requestUserPhoneStateSubject.next(paload);
    });
  }

  registerUser(userId: number): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('register_user', userId);
    }
  }

  sendMessageToUsers(userIds: number[], title: string, message: string): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('mensaje_chat', { to: userIds, title, message });
    }
  }

  sendMessage(msg: any): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('send_message', msg);
    }
  }

  sendAlertas(msg: any): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('send_alertas', msg);
    }
  }

  disconnect(): void {
    this.socket?.disconnect();
  }

  get isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  onConnect(callback: () => void): void {
    this.socket?.on('connect', callback);
  }

  onDisconnect(callback: () => void): void {
    this.socket?.on('disconnect', callback);
  }

  onNewAlert(callback: (data: any) => void): void {
    this.socket?.on('nueva_alerta', callback);
  }

  onMessage(callback: (msg: any) => void): void {
    this.socket?.on('receive_message', callback);
  }

  onAlertas(callback: (msg: any) => void): void {
    this.socket?.on('receive_alertas', callback);
  }

  onEmailRequest(): Observable<{ userId: number }> {
    return this.requestAdvisorSubject.asObservable();
  }

  onUserPhoneStateRequest(): Observable<{ userId: number }> {
    return this.requestUserPhoneStateSubject.asObservable();
  }
  
  onRequestPhoneCallSubject(): Observable<{ userId: number }> {
    return this.requestPhoneCallSubject.asObservable();
  }
}
