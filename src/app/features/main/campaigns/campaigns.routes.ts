import { Route } from '@angular/router';

export const campaignsRoutes: Route[] = [
  {
    path: 'campaings-management',
    title: 'SAT | Live Chat',
    loadComponent: () =>
      import(
        '@features/main/campaigns/gestionar-campania/gestionar-campania.component'
      ).then((c) => c.GestionarCampaniaComponent),
  },
  {
    path: 'live-chat',
    title: 'SAT | Live Chat',
    loadComponent: () =>
      import('@features/main/campaigns/live-chat/live-chat.component').then(
        (c) => c.LiveChatComponent
      ),
  },
  {
    path: 'sms',
    title: 'SAT | SMS',
    loadComponent: () =>
      import('@features/main/campaigns/sms/sms.component').then(
        (c) => c.SmsComponent
      ),
  },
  {
    path: 'email',
    title: 'SAT | Email',
    loadComponent: () =>
      import('@features/main/campaigns/mail/mail.component').then(
        (c) => c.MailComponent
      ),
  }

];
