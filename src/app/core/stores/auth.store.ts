import {
  signalStore,
  withState,
  withMethods,
  withComputed,
  patchState,
} from '@ngrx/signals';
import { inject, computed } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '@models/user.model';
import { AuthService } from '@services/auth.service';
import { LoginRequest, LoginResponse } from '@models/auth.model';
import { catchError, EMPTY, mapTo, mergeMap, Observable, of, tap } from 'rxjs';
import { MenuOption } from '@interfaces/menu-option.interface';
import { Screen } from '@models/screen.model';
import { MessageGlobalService } from '@services/generic/message-global.service';

export interface AuthState {
  user: User | null;
  screens: MenuOption[];
  screenSelected: Screen | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  screens: [],
  screenSelected: null,
  loading: false,
  error: null,
};

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ user }) => ({
    isAuthenticated: computed(() => !!user()),
  })),
  withMethods((store) => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const msg = inject(MessageGlobalService);
    return {
      login(req: LoginRequest, returnUrl?: string) {
        patchState(store, { loading: true });
        authService
          .login(req)
          .pipe(
            mergeMap((res: LoginResponse) => {
              authService.storeToken(res.accessToken);
              return authService.getProfile();
            }),
            mergeMap((user: User) => {
              authService.storeUser(user);
              patchState(store, { user, loading: false, error: null });
              return authService.getScreens();
            })
          )
          .subscribe({
            next: (data: Screen[]) => {
              const screens = data.map((item) => ({
                icon: item.icon!,
                label: item.name!,
                link: item.path!,
                active: false,
                items: item.items.map((s) => ({
                  icon: s.icon!,
                  label: s.name!,
                  link: s.path!,
                })),
              }));
              patchState(store, {
                screens,
              });
              router.navigate([returnUrl ?? '/']);
            },
            error: (e) => {
              patchState(store, { error: e.error.message, loading: false });
            },
            complete: () => patchState(store, { loading: false }),
          });
      },

      selectScreen(screen: any) {
        patchState(store, { screenSelected: screen });
      },

      checkSession(): Observable<void> {
        const token = authService.getToken();
        if (!token) {
          patchState(store, { user: null, loading: false, error: null });
          return of(void 0);
        }

        patchState(store, { loading: true });
        return authService.getProfile().pipe(
          mergeMap((user: User) => {
            authService.storeUser(user);
            patchState(store, { user, loading: false, error: null });
            return authService.getScreens();
          }),
          catchError((error) => {
            console.log('error', error);
            const isServerDown = error.status === 0;

            if (isServerDown) {
              msg.error(error?.error?.message);
              const currentUrl = router.url;
              const previousUrl = sessionStorage.getItem('previousUrl');
              if (!previousUrl && currentUrl != '/server-down') {
                sessionStorage.setItem('previousUrl', currentUrl);
              }
              router.navigate(['/server-down']);
            } else {
              authService.logout();
              patchState(store, { user: null, loading: false, error: null });
              router.navigate(['/auth/login']);
            }
            return EMPTY;
          }),
          tap({
            next: (data: Screen[]) => {
              sessionStorage.removeItem('previousUrl');
              const screens = data.map((item) => ({
                icon: item.icon!,
                label: item.name!,
                link: item.path!,
                active: false,
                items: item.items.map((s) => ({
                  icon: s.icon!,
                  label: s.name!,
                  link: s.path!,
                })),
              }));
              patchState(store, {
                screens,
              });
            },
            error: () => {
              authService.logout();
              patchState(store, { user: null, loading: false, error: null });
              router.navigate(['/auth/login']);
            },
            complete: () => {
              patchState(store, { loading: false });
            },
          }),
          mapTo(void 0)
        );
      },

      logout() {
        authService.logout();
        patchState(store, { user: null });
        router.navigate(['/auth/login']);
      },
    };
  })
);
