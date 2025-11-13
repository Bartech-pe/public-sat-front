import { Routes } from '@angular/router';
import { adviserRoutes } from '@features/main/adviser/adviser.routes';
import { campaignsRoutes } from '@features/main/campaigns/campaigns.routes';
import { settingsRoutes } from '@features/main/settings/settings.routes';
import { authGuard } from '@guards/auth.guard';
import { redirectIfLoggedInGuard } from '@guards/redirect-if-logged-in.guard';
import { verifyScreenGuard } from '@guards/verify-screen.guard';

export const routes: Routes = [
  {
    path: 'auth/login',
    title: 'SAT | Iniciar Sesión',
    canActivate: [redirectIfLoggedInGuard],
    loadComponent: () =>
      import('@features/auth/login/login.component').then(
        (c) => c.LoginComponent
      ),
  },
  {
    path: 'auth/reset-password',
    title: 'SAT | Restablecer contraseña',
    canActivate: [redirectIfLoggedInGuard],
    loadComponent: () =>
      import('@features/auth/reset-password/reset-password.component').then(
        (c) => c.ResetPasswordComponent
      ),
  },
  {
    path: 'auth',
    redirectTo: 'auth/login',
    pathMatch: 'full',
  },
  {
    path: '',
    canActivate: [authGuard],
    canActivateChild: [verifyScreenGuard],
    loadComponent: () =>
      import('@features/main/main.component').then((c) => c.MainComponent),
    children: [
      {
        path: '',
        title: 'SAT | Inicio',
        loadComponent: () =>
          import('@features/main/home/home.component').then(
            (c) => c.HomeComponent
          ),
      },
      {
        path: 'inbox-view',
        title: 'SAT | Bandeja de entrada',
        loadComponent: () =>
          import('@features/main/inbox-view/inbox-view.component').then(
            (c) => c.InboxViewComponent
          ),
      },
      {
        path: 'inbox-multi-channel',
        title: 'SAT | Chat Multicanal',
        children: [
          {
            path: '',
            loadComponent: () =>
              import(
                '@features/main/omnichannel-inbox/omnichannel-inbox.component'
              ).then((c) => c.OmnichannelInboxComponent),
          },
          {
            path: ':channel',
            loadComponent: () =>
              import(
                '@features/main/omnichannel-inbox/omnichannel-inbox.component'
              ).then((c) => c.OmnichannelInboxComponent),
          },
        ],
      },
      {
        path: 'conversations',
        title: 'SAT | Conversaciones',
        loadComponent: () =>
          import('@features/main/conversations/conversations.component').then(
            (c) => c.ConversationsComponent
          ),
        children: [
          {
            path: 'dashboard',
            title: 'SAT | Conversaciones',
            loadComponent: () =>
              import(
                '@features/main/conversations/dashboard/dashboard.component'
              ).then((c) => c.DashboardComponent),
          },
          {
            path: 'mentions',
            title: 'SAT | Menciones',
            loadComponent: () =>
              import(
                '@features/main/conversations/mentions/mentions.component'
              ).then((c) => c.MentionsComponent),
          },
          {
            path: 'unattended',
            title: 'SAT | Desatendido',
            loadComponent: () =>
              import(
                '@features/main/conversations/unattended/unattended.component'
              ).then((c) => c.UnattendedComponent),
          },
        ],
      },
      {
        path: 'reports',
        title: 'SAT | Reportes',
        loadComponent: () =>
          import('@features/main/reports/reports.component').then(
            (c) => c.ReportsComponent
          ),
        children: [
          {
            path: 'general',
            title: 'SAT | Configuración de la cuenta',
            loadComponent: () =>
              import('@features/main/reports/overview/overview.component').then(
                (c) => c.OverviewComponent
              ),
          },
        ],
      },
      
      {
        path: 'campaigns',
        title: 'SAT | Bandeja de entrada',
        loadComponent: () =>
          import('@features/main/campaigns/campaigns.component').then(
            (c) => c.CampaignsComponent
          ),
        children: campaignsRoutes,
      },
      {
        path: 'briefcase',
        title: 'SAT | Cartera',
        loadComponent: () =>
          import('@features/main/briefcase/briefcase.component').then(
            (c) => c.BriefcaseComponent
          ),
      },
      {
        path: 'briefcase/new',
        title: 'SAT | Nueva Cartera',
        loadComponent: () =>
          import(
            '@features/main/briefcase/new-briefcase/new-briefcase.component'
          ).then((c) => c.NewBriefcaseComponent),
      },
      {
        path: 'briefcase/edit/:id',
        title: 'SAT | Editar Cartera',
        loadComponent: () =>
          import(
            '@features/main/briefcase/edit-briefcase/edit-briefcase.component'
          ).then((c) => c.EditBriefcaseComponent),
      },
       {
        path: 'calls',
        title: 'SAT | LLamadas',
        loadComponent: () =>
          import('@features/main/campaigns/llamadas/llamadas.component').then(
            (c) => c.LlamadasComponent
          ),
      },
      {
        path: 'mails',
        title: 'SAT | Correo Electronico',
        loadComponent: () =>
          import('@features/main/mail/mail.component').then(
            (c) => c.MailComponent
          ),
      },
      {
        path: 'assignments',
        title: 'SAT | Mis Asignaciones',
        loadComponent: () =>
          import('@features/main/assignments/assignments.component').then(
            (c) => c.AssignmentsComponent
          ),
      },
      {
        path: 'templates',
        title: 'SAT | Plantillas',
        loadComponent: () =>
          import('@features/main/templates/templates.component').then(
            (c) => c.TemplatesComponent
          ),
        children: [
          {
            path: 'my-templates',
            title: 'SAT | Mis Plantillas',
            loadComponent: () =>
              import(
                '@features/main/templates/my-templates/my-templates.component'
              ).then((c) => c.MyTemplatesComponent),
          },
        ],
      },
      {
        path: 'adviser',
        title: 'SAT | Asesor Telefónico',
        loadComponent: () =>
          import('@features/main/adviser/adviser.component').then(
            (c) => c.AdviserComponent
          ),
        children: adviserRoutes,
      },
      {
        path: 'settings',
        title: 'SAT | Ajustes',
        loadComponent: () =>
          import('@features/main/settings/settings.component').then(
            (c) => c.SettingsComponent
          ),
        children: settingsRoutes,
      },
      {
        path: 'supervisor',
        title: 'SAT | Supervisor',
        loadComponent: () =>
          import('@features/main/supervisor/supervisor.component').then(
            (c) => c.SupervisorComponent
          ),
        // children: settingsRoutes,
      },
    ],
  },

  

  {
    path: 'editor',
    loadComponent: () =>
      import('./grapes-editor/grapes-editor.component').then(
        (m) => m.GrapesEditorComponent
      ),
  },
  {
    path: 'not-found',
    loadComponent: () =>
      import('./layouts/not-found/not-found.component').then(
        (c) => c.NotFoundComponent
      ),
  },
  {
    path: 'server-down',
    loadComponent: () =>
      import('./layouts/server-down/server-down.component').then(
        (c) => c.ServerDownComponent
      ),
  },
  { path: '**', redirectTo: 'not-found', pathMatch: 'full' },
];
