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

  private requestPortfolioSubject = new Subject<any>();

  private requestPortfolioCompleteSubject = new Subject<any>();

  private requestPortfolioCancelledSubject = new Subject<any>();

  private requestPortfolioErrorSubject = new Subject<any>();

  // private newReminderSubject = new Subject<any>();

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
      console.log('Conectado al servidor Socket.IO');
    });

    this.socket.on('disconnect', () => {
      console.warn('Desconectado del servidor Socket.IO');
    });

    this.socket.on('reconnect', (attempt) => {
      console.log(`Reconectado al servidor en intento ${attempt}`);
    });

    this.socket.on('reconnect_error', (error) => {
      console.error('Error al reconectar:', error);
    });

    this.socket.on('error', (error) => {
      console.error('Error en Socket.IO:', error);
    });

    this.socket.on('respuesta', (data: any) => {
      console.log('Respuesta del servidor:', data);
    });

    this.socket.on('email.request', (paload: { userId: number }) => {
      this.requestAdvisorSubject.next(paload);
    });

    this.socket.on('user.phone.state.request', (paload: { userId: number }) => {
      console.log('user.phone.state.request');
      this.requestUserPhoneStateSubject.next(paload);
    });

    this.socket.on('phone.call.request', (payload: { userId: number }) => {
      console.log('Solicitud de llamada recibida:', payload);
      this.requestPhoneCallSubject.next(payload);
    });

    // Escuchar progreso
    this.socket.on('portfolio-progress', (data) => {
      console.log(
        `Cartera ${data.portfolioId}: ${(
          (data.processed / data.total) *
          100
        ).toFixed(2)}% (${data.processed}/${data.total})`
      );
      this.requestPortfolioSubject.next(data);
    });

    // Escuchar fin del proceso
    this.socket.on('portfolio-complete', (data) => {
      console.log(data.message);
      this.requestPortfolioCompleteSubject.next(data);
    });

    // Escuchar fin del proceso
    this.socket.on('portfolio-cancelled', (data) => {
      console.log(data.message);
      this.requestPortfolioCancelledSubject.next(data);
    });

    // Escuchar fin del proceso
    this.socket.on('portfolio-error', (data) => {
      console.log(data.message);
      this.requestPortfolioErrorSubject.next(data);
    });
  }

  onPortfolioProgress(): Observable<{
    updated: boolean;
    portfolioId: number;
    name: string;
    processed: number;
    total: number;
    progress: number;
    remainingSeconds?: number;
  }> {
    return this.requestPortfolioSubject.asObservable();
  }

  // Escuchar cuando termina el proceso
  onPortfolioComplete(): Observable<any> {
    return this.requestPortfolioCompleteSubject.asObservable();
  }

  // onBotRepliesStatusChanged(): Observable<void> {
  //   return this.newReminderSubject.asObservable();
  // }

  // Escuchar cuando termina el proceso
  onPortfolioCancelled(): Observable<any> {
    return this.requestPortfolioCancelledSubject.asObservable();
  }

  // Escuchar cuando termina el proceso
  onPortfolioError(): Observable<any> {
    return this.requestPortfolioErrorSubject.asObservable();
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

  onMessage(callback: (msg: any) => void): void {
    this.socket?.on('receive_message', callback);
  }

  sendMessageNotification(
    toUserId: number,
    fromUserId: number,
    text: string
  ): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('send_message_notification', {
        toUserId,
        fromUserId,
        text,
      });
    } else {
      console.warn('⚠️ Socket no conectado');
    }
  }

  onMessageNotification(callback: (msg: any) => void): void {
    this.socket?.on('receive_message_notification', callback);
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

  onNewReminder(callback: (data: any) => void): void {
    this.socket?.on('reminders.new', callback);
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

  cancelProtfolio(portfolioId: number): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('cancel-portfolio', { portfolioId });
    }
  }
}
