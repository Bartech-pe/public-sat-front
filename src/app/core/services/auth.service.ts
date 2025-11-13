import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '@envs/enviroments';
import { LoginRequest, LoginResponse } from '@models/auth.model';
import { Screen } from '@models/screen.model';
import { User } from '@models/user.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private readonly url = `${environment.apiUrl}/auth`;
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

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
    if (this.isBrowser) {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw) as User : null;
    }
    return null;
  }

  hasRole(roles: string[]): boolean {
    const user = this.getUser();
    if (!user?.role) return false;

    const roleName = typeof user.role === 'string'
      ? user.role
      : user.role.name;

    return roles.map(r => r.toLowerCase()).includes(roleName.toLowerCase());
  }


  //private accessToken: string | null = null;
  //private refreshToken: string | null = null;

  //storeTokens(accessToken: string, refreshToken: string): void {
  //  localStorage.setItem('accessToken', accessToken);
  //  if (refreshToken) {
  //    localStorage.setItem('refreshToken', refreshToken);
  //  }
  //}

  //loadTokens() {
  //  this.accessToken = localStorage.getItem('accessToken');
  //  this.refreshToken = localStorage.getItem('refreshToken');
  //}

  isLoggedIn(): boolean {
   return !!localStorage.getItem('accessToken');
  }


}
