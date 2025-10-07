import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { environment } from '@envs/environments';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root',
})
export class KeepaliveService implements OnDestroy {
  private fails = 0;
  private timer: any;

  constructor(private http: HttpClient, private storage: StorageService) {
    this.startKeepalive();
    window.addEventListener('visibilitychange', this.handleVisibilityChange);
  }

  private ping() {
    this.http.get(`${environment.apiUrl}v1/alosat/keepalive`).subscribe({
      next: () => (this.fails = 0),
      error: () => {
        this.fails++;
        if (this.fails >= 3) {
          console.warn('Keepalive fallando. Revisa tu red / registro WebRTC.');
        }
      },
    });
  }

  startKeepalive() {
    this.stopKeepalive();
    this.timer = setInterval(() => this.ping(), 2000);
  }

  stopKeepalive() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
  }

  private handleVisibilityChange = () => {
    if (document.visibilityState === 'hidden') {
      const token = this.storage.getToken();
      fetch(`${environment.apiUrl}v1/alosat/keepalive`, {
        method: 'GET', // o POST si backend acepta
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        keepalive: true,
      }).catch(() => {
        // No bloquea ni molesta al usuario
      });
    }
  };

  ngOnDestroy() {
    this.stopKeepalive();
    window.removeEventListener('visibilitychange', this.handleVisibilityChange);
  }
}
