import { Routes } from '@angular/router';

export const supervisorRoutes: Routes = [
  {
    path: 'channel-management',
    title: 'SAT | Gestión de canales',
    loadComponent: () =>
      import(
        '@features/main/supervisor/channel-management/channel-management.component'
      ).then((c) => c.ChannelManagementComponent),
  },
  {
    path: 'call-management',
    title: 'SAT | Gestión de llamadas',
    loadComponent: () =>
      import(
        '@features/main/supervisor/call-management/call-management.component'
      ).then((c) => c.CallManagementComponent),
  },
];
