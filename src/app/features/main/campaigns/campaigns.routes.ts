import { Route } from '@angular/router';

export const campaignsRoutes: Route[] = [
  {
    path: 'audio-campaign',
    title: 'SAT | Campaña de audio',
    loadComponent: () =>
      import(
        '@features/main/campaigns/manage-campaign/manage-campaign.component'
      ).then((c) => c.ManageMampaignComponent),
  },
  {
    path: 'sms-campaign',
    title: 'SAT | Campaña de SMS',
    loadComponent: () =>
      import('@features/main/campaigns/sms/sms.component').then(
        (c) => c.SmsComponent
      ),
  },{
    path: 'mail-campaign',
    title: 'SAT | Email',
    loadComponent: () =>
      import('@features/main/campaigns/mail/mail.component').then(
        (c) => c.MailComponent
      ),
  },
];

