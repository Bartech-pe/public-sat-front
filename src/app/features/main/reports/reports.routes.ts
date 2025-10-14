import { Routes } from '@angular/router';

export const reportsRoutes: Routes = [
  {
    path: 'alosat-dashboard',
    title: 'AlóSat | Dashboard',
    loadComponent: () =>
      import(
        '@features/main/reports/alosat-dashboard/alosat-dashboard.component'
      ).then((c) => c.AlosatDashboardComponent),
  },
  {
    path: 'attention-hour',
    title: 'Por Hora | Dashboard',
    loadComponent: () =>
      import(
        '@features/main/reports/attention-hour/attention-hour.component'
      ).then((c) => c.AttentionHourComponent),
  },
  {
    path: 'attention-ivr',
    title: 'Por IVR | Dashboard',
    loadComponent: () =>
      import(
        '@features/main/reports/attention-ivr/attention-ivr.component'
      ).then((c) => c.AttentionIvrComponent),
  },
  {
    path: 'attention-non-attention',
    title: 'Atenciones/No Atenciones AlóSAT | Dashboard',
    loadComponent: () =>
      import(
        '@features/main/reports/attention-non-attention/attention-non-attention.component'
      ).then((c) => c.AttentionNonAttentionComponent),
  },
  {
    path: 'intern-chat',
    title: 'Chat Interno | Dashboard',
    loadComponent: () =>
      import('@features/main/reports/intern-chat/intern-chat.component').then(
        (c) => c.InternChatComponent
      ),
  },
  {
    path: 'chatsat-wsp',
    title: 'ChatSat/Wsp | Dashboard',
    loadComponent: () =>
      import('@features/main/reports/chatsat-wsp/chatsat-wsp.component').then(
        (c) => c.ChatsatWspComponent
      ),
  },
  {
    path: 'cons-attention',
    title: 'Consolidado Atenciones | Dashboard',
    loadComponent: () =>
      import(
        '@features/main/reports/cons-attention/cons-attention.component'
      ).then((c) => c.ConsAttentionComponent),
  },
  {
    path: 'cons-consultas',
    title: 'Consolidado Consultas | Dashboard',
    loadComponent: () =>
      import(
        '@features/main/reports/cons-consultas/cons-consultas.component'
      ).then((c) => c.ConsConsultasComponent),
  },
  {
    path: 'mail-dash',
    title: 'Correo | Dashboard',
    loadComponent: () =>
      import('@features/main/reports/mail-dash/mail-dash.component').then(
        (c) => c.MailDashComponent
      ),
  },
  {
    path: 'survey-chat',
    title: 'Encuesta Chat | Dashboard',
    loadComponent: () =>
      import('@features/main/reports/survey-chat/survey-chat.component').then(
        (c) => c.SurveyChatComponent
      ),
  },
  {
    path: 'send-audio-campaign',
    title: 'Envíos Campaña de Audio | Dashboard',
    loadComponent: () =>
      import(
        '@features/main/reports/send-audio-campaign/send-audio-campaign.component'
      ).then((c) => c.SendAudioCampaignComponent),
  },
];
