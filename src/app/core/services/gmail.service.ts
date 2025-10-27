import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@envs/environments';

@Injectable({
  providedIn: 'root',
})
export class GmailService {
  private baseUrl = `${environment.apiUrl}v1/mail-configuration`;

  constructor(private http: HttpClient) {}

  // Crear credencial (ahora con datos dinámicos desde el componente)
  createCredential(data: {
    name: string;
    email: string;
    clientId: string;
    clientSecret: string;
    topicName: string;
    projectId: string;
  }): Observable<any> {
    return this.http.post(`${this.baseUrl}/generateGmailCredential`, data);
  }

  // Conectar correol
  loginWithGoogle(mail: string = ""): void {
    this.http
      .post<{ authUrl: string }>(`${this.baseUrl}/loginCredential`, {email: mail})
      .subscribe({
        next: (res) => {
          let authUrl = res.authUrl;

          // 👇 Fuerza selector de cuenta
          if (!authUrl.includes('prompt=')) {
            authUrl +=
              (authUrl.includes('?') ? '&' : '?') + 'prompt=select_account';
          }

          console.log('🔗 Redirigiendo a:', authUrl);
          window.location.href = authUrl;
        },
        error: (err) => {
          console.error('❌ Error al iniciar conexión con Gmail', err);
        },
      });
  }
}
