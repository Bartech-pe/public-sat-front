import { HttpClient, HttpErrorResponse, HttpResponseBase } from "@angular/common/http";
import { inject, Injectable, OnDestroy } from "@angular/core";
import { environment } from "@envs/enviroments";
import { catchError, Observable, Subject, throwError } from "rxjs";
import { io, Socket } from "socket.io-client";

interface WhatsappAuthResponse {
  loginQr: string;
}

export interface WhatsappAuthDto
{
    status: "failed" | "success" | "loading" | "disconnected",
    message?: string;
}

@Injectable({
  providedIn: 'root',
})
export class WhatsappService implements OnDestroy {

  private readonly url = `${environment.wsUrl}`;
  private socket: Socket | null = null;

  private authStatusSubject = new Subject<any>();
  authStatus$ = this.authStatusSubject.asObservable();

  constructor(private http: HttpClient) {
    this.connectToSocket();
  }

  private connectToSocket() {
    this.socket = io(`${this.url}`, {
      transports: ['websocket'],
      reconnection: true,
    });
    this.socket.on('connect', () => {
      console.log('[Socket] ✅ Conectado al namespace /whatsapp');
    });

    this.socket.on('disconnect', () => {
      console.warn('[Socket] 🔌 Desconectado del WebSocket');
    });
    this.socket.on('connect_error', (err) => {
      console.error('[Socket] Error de conexión:', err);
    });

  }

  listenToPhoneStatus(phoneNumber: string) {
    if (!this.socket) return;
    const listener = (data: WhatsappAuthDto) => {
      console.log('[Socket] Evento recibido:', data);
      this.authStatusSubject.next(data);
    };

    this.socket.on(phoneNumber, listener);

    this.authStatus$.subscribe({
      complete: () => this.socket?.off(phoneNumber, listener),
    });
  }

    createAuthorizeQr(phoneNumber: string): Observable<WhatsappAuthResponse>
    {
      return this.http.post<WhatsappAuthResponse>(`${this.url}/whatsapp/init`, { phoneNumber })
        .pipe(
          catchError((error: HttpErrorResponse) => {
            console.error('Error al generar QR:', error);
            return throwError(() => new Error(error.message));
          })
        );
    }

  disconnectServices() {
    this.authStatusSubject.complete();
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
  }


  ngOnDestroy(): void {
    this.disconnectServices()
  }
}
