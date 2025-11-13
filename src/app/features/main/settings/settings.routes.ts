import { Routes } from '@angular/router';

export const settingsRoutes: Routes = [
  {
    path: 'general',
    title: 'SAT | Configuración de la cuenta',
    loadComponent: () =>
      import('@features/main/settings/general/general.component').then(
        (c) => c.GeneralComponent
      ),
  },
  {
    path: 'usuarios',
    title: 'SAT | Usuarios',
    loadComponent: () =>
      import('@features/main/settings/users/users.component').then(
        (c) => c.UsersComponent
      ),
  },
  {
    path: 'teams',
    title: 'SAT | Equipos',
    loadComponent: () =>
      import('@features/main/settings/teams/teams.component').then(
        (c) => c.TeamsComponent
      ),
  },
  {
    path: 'areas',
    title: 'SAT | Áreas',
    loadComponent: () =>
      import('@features/main/settings/areas/areas.component').then(
        (c) => c.AreasComponent
      ),
  },
  {
    path: 'oficinas',
    title: 'SAT | Oficinas',
    loadComponent: () =>
      import('@features/main/settings/oficinas/oficinas.component').then(
        (c) => c.OficinasComponent
      ),
  },
  {
    path: 'inboxes',
    title: 'SAT | Configuración de canales',
    loadComponent: () =>
      import('@features/main/settings/inboxes/inboxes.component').then(
        (c) => c.InboxesComponent
      ),
  },
  {
    path: 'status',
    title: 'SAT | Estados personalizados',
    loadComponent: () =>
      import(
        '@features/main/settings/custom-states/custom-states.component'
      ).then((c) => c.CustomStatesComponent),
  },
  {
    path: 'mensajes-automaticos',
    title: 'SAT | Mensajes automaticos',
    loadComponent: () =>
      import(
        '@features/main/settings/mensajes-automaticos/mensajes-automaticos.component'
      ).then((c) => c.MensajesAutomaticosComponent),
  },
  {
    path: 'skills',
    title: 'SAT | Habilidades',
    loadComponent: () =>
      import('@features/main/settings/skills/skills.component').then(
        (c) => c.SkillsComponent
      ),
  },
  {
    path: 'roles',
    title: 'SAT | Roles',
    loadComponent: () =>
      import('@features/main/settings/roles/roles.component').then(
        (c) => c.RolesComponent
      ),
  },
  {
    path: 'wallets',
    title: 'SAT | Carteras',
    loadComponent: () =>
      import('@features/main/settings/wallets/wallets.component').then(
        (c) => c.WalletsComponent
      ),
  },
  {
    path: 'labels',
    title: 'SAT | Etiquetas',
    loadComponent: () =>
      import('@features/main/settings/labels/labels.component').then(
        (c) => c.LabelsComponent
      ),
  },
  {
    path: 'reminder',
    title: 'SAT | Recordatorio ',
    loadComponent: () =>
      import('@features/main/settings/reminder/reminder.component').then(
        (c) => c.ReminderComponent
      ),
  },
  {
    path: 'calendar',
    title: 'SAT | Calendario',
    loadComponent: () =>
      import('@features/main/settings/calendar/calendar.component').then(
        (c) => c.CalendarComponent
      ),
  },
  {
    path: 'predefined-response',
    loadComponent: () =>
      import(
        '@features/main/quick-response/quick.response-dashboard/quick.response-dashboard.component'
      ).then((m) => m.QuickresponseDashboardComponent),
  },
  {
  path: 'feriado',
  title: 'SAT | Feriado',
  loadComponent: () =>
    import('@features/main/campaigns/feriado/feriado.component').then(
      (c) => c.FeriadoComponent
    ),
  },
  {
  path: 'schedule-assignment',
  title: 'SAT | Asignación de Horarios',
  loadComponent: () =>
    import('@features/main/settings/schedule-assignment/schedule-assignment.component').then(
      (c) => c.ScheduleAssignmentComponent
    ),
  },
  {
  path: 'monitoring-panel',
  title: 'SAT | Panel',
  loadComponent: () =>
    import('@features/main/settings/monitoring-panel/monitoring-panel.component').then(
      (c) => c.MonitoringPanelComponent
    ),
  },
];
