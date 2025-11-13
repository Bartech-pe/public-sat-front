import { Route } from '@angular/router';

export const adviserRoutes: Route[] = [
  {
    path: 'phone',
    title: 'SAT | Teléfono',
    loadComponent: () =>
      import('@features/main/adviser/phone/phone.component').then(
        (c) => c.PhoneComponent
      ),
  },
  {
    path: 'assistances',
    title: 'SAT | Atenciones del asesor',
    loadComponent: () =>
      import(
        '@features/main/adviser/dashboard-adviser/dashboard-adviser.component'
      ).then((c) => c.DashboardAdviserComponent),
  },
  {
    path: 'chat',
    title: 'SAT | Chat',
    loadComponent: () =>
      import('@features/main/adviser/chat/chat.component').then(
        (c) => c.ChatComponent
      ),
  },
];
