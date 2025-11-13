import { Route } from '@angular/router';

export const adviserRoutes: Route[] = [
  {
    path: 'telefono',
    title: 'SAT | Teléfono',
    loadComponent: () =>
      import('@features/main/adviser/telefono/telefono.component').then(
        (c) => c.TelefonoComponent
      ),
  },
  {
    path: 'dashboard-adviser',
    title: 'SAT | Dashboard Asesor Telefónico',
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
  {
    path: 'atencion-detalle',
    title: 'SAT | Atención',
    loadComponent: () =>
      import(
        '@features/main/adviser/dashboard-adviser/atencion-detalle/atencion-detalle.component'
      ).then((c) => c.AtencionDetalleComponent),
  },
];
