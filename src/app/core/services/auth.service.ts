import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable, Injector, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '@envs/environments';
import { LoginRequest, LoginResponse } from '@models/auth.model';
import { Screen } from '@models/screen.model';
import { User } from '@models/user.model';
import { AuthStore } from '@stores/auth.store';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private readonly url = `${environment.apiUrl}v1/auth`;
  private readonly http = inject(HttpClient);

  constructor(private injector: Injector) {}

  private get store() {
    return this.injector.get(AuthStore);
  }

  login(req: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.url}/login`, req);
  }

  getProfile() {
    return this.http.get<User>(`${this.url}/profile`);
  }

  logout(): void {
    if (this.isBrowser) {
      localStorage.clear();
    }
  }

  storeToken(token: string): void {
    if (this.isBrowser) {
      localStorage.setItem('token', token);
    }
  }

  storeUser(user: User): void {
    if (this.isBrowser) {
      localStorage.setItem('user', JSON.stringify(user));
    }
  }

  getToken(): string | null {
    if (this.isBrowser) {
      return localStorage.getItem('token');
    }
    return null;
  }

  verifyAccess(url: string) {
    return this.http.post<any>(`${this.url}/verify-access`, { url });
  }

  getScreens() {
    return this.http.get<Screen[]>(`${this.url}/screens`);
  }

  getUser(): User | null {
    return this.store.user();
  }

  hasRole(roles: number[]): boolean {
    const user = this.getUser();
    if (!user?.roleId) return false;

    return roles.includes(user.roleId);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('accessToken');
  }
}
