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
    path: 'users',
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
    path: 'departments',
    title: 'SAT | Áreas',
    loadComponent: () =>
      import('@features/main/settings/departments/departments.component').then(
        (c) => c.DepartmentsComponent
      ),
  },
  {
    path: 'offices',
    title: 'SAT | Oficinas',
    loadComponent: () =>
      import('@features/main/settings/offices/offices.component').then(
        (c) => c.OfficesComponent
      ),
  },
  {
    path: 'channels',
    title: 'SAT | Configuración de canales',
    loadComponent: () =>
      import('@features/main/settings/channels/channels.component').then(
        (c) => c.ChannelsComponent
      ),
  },
  {
    path: 'states',
    title: 'SAT | Estados personalizados',
    loadComponent: () =>
      import(
        '@features/main/settings/custom-states/custom-states.component'
      ).then((c) => c.CustomStatesComponent),
  },
  {
    path: 'automatic-messages',
    title: 'SAT | Mensajes automaticos',
    loadComponent: () =>
      import(
        '@features/main/settings/automatic-messages/automatic-messages.component'
      ).then((c) => c.AutomaticMessagesComponent),
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
    path: 'tags',
    title: 'SAT | Etiquetas',
    loadComponent: () =>
      import('@features/main/settings/tags/tags.component').then(
        (c) => c.TagsComponent
      ),
  },
  {
    path: 'reminder',
    title: 'SAT | Recordatorio',
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
        '@features/main/settings/predefined-responses/predefined-responses.component'
      ).then((m) => m.PredefinedResponsesComponent),
  },
  {
    path: 'holidays',
    title: 'SAT | Feriado',
    loadComponent: () =>
      import('@features/main/settings/holidays/holidays.component').then(
        (c) => c.HolidaysComponent
      ),
  },
  {
    path: 'channel-schedule',
    title: 'SAT | Asignación de Horarios',
    loadComponent: () =>
      import(
        '@features/main/settings/channel-schedule/channel-schedule.component'
      ).then((c) => c.ChannelScheduleComponent),
  },
  {
    path: 'monitoring-panel',
    title: 'SAT | Panel',
    loadComponent: () =>
      import(
        '@features/main/settings/monitoring-panel/monitoring-panel.component'
      ).then((c) => c.MonitoringPanelComponent),
  },
];
