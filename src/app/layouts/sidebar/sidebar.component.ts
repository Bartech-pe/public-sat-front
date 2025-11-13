import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import { FooterSidebarComponent } from './footer-sidebar/footer-sidebar.component';
import { MenuOption } from '@interfaces/menu-option.interface';
import { SidebarMenuComponent } from '@shared/sidebar-menu/sidebar-menu.component';
import { AuthStore } from '@stores/auth.store';
import { SidebarService } from '@services/sidebar.service';
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';

@Component({
  selector: 'sidebar',
  imports: [
    CommonModule, 
    // FooterSidebarComponent, 
    SidebarMenuComponent,
  ],
  templateUrl: './sidebar.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  styles: ``,
  animations: [
    trigger('slideInOut', [
      state(
        'in',
        style({
          transform: 'translateX(0)',
          opacity: 1,
        })
      ),
      state(
        'out',
        style({
          transform: 'translateX(-101%)', // o incluso -100.5%
          opacity: 0,
        })
      ),
      transition('in <=> out', [
        animate('300ms cubic-bezier(0.4, 0, 0.2, 1)')  // Material-style easing
      ]),
    ]),
  ],
})
export class SidebarComponent {

  constructor(public sidebarService: SidebarService) {}

  readonly authStore = inject(AuthStore);

  get listOpciones(): MenuOption[] {
    return this.authStore.screens();
  }

  get sidebarState() {
    return this.sidebarService.isSidebarVisible() ? 'in' : 'out';
  }
  

  // listOpciones: MenuOption[] = [
  //   {
  //     icon: 'lucide:inbox',
  //     label: 'Bandeja de entrada',
  //     link: '/inbox-view',
  //     active: false,
  //     items: [],
  //   },
  //   {
  //     icon: 'streamline-ultimate:corporate-social-media',
  //     label: 'Chat multi-canal',
  //     link: '/inbox-multi-channel',
  //     active: false,
  //     items: [],
  //   },
  //   {
  //     icon: 'lucide:message-circle',
  //     label: 'Conversaciones',
  //     link: '/conversations',
  //     active: false,
  //     items: [
  //       {
  //         label: 'Todas las conversaciones',
  //         link: '/conversations/dashboard',
  //       },
  //       {
  //         label: 'Menciones',
  //         link: '/conversations/mentions',
  //       },
  //       {
  //         label: 'Desatendido',
  //         link: '/conversations/unattended',
  //       },
  //     ],
  //   },
  //   {
  //     icon: 'lucide:chart-line',
  //     label: 'Informes',
  //     link: '/reports',
  //     active: false,
  //     items: [],
  //   },
  //   {
  //     icon: 'lucide:megaphone',
  //     label: 'Campañas',
  //     link: '/campaigns',
  //     active: false,
  //     items: [
  //       {
  //         label: 'Gestion de Campañas',
  //         link: '/campaigns/campaings-management',
  //       },
  //       {
  //         label: 'Live Chat',
  //         link: '/campaigns/live-chat',
  //       },
  //       {
  //         label: 'SMS',
  //         link: '/campaigns/sms',
  //       },
  //       {
  //         label: 'LLamadas',
  //         link: '/campaigns/calls',
  //       },
  //     ],
  //   },
  //   {
  //     icon: 'eos-icons:templates',
  //     label: 'Plantillas',
  //     link: '/templates',
  //     active: false,
  //     items: [
  //       {
  //         label: 'Mis Plantillas',
  //         link: '/templates/my-templates',
  //       },
  //     ],
  //   },
  //   {
  //     icon: 'fluent:people-call-24-regular',
  //     label: 'Gestión Atención Asesor',
  //     link: '/adviser',
  //     active: false,
  //     items: [
  //       {
  //         label: 'Dashboard Asesor',
  //         link: '/adviser/dashboard-adviser',
  //       },
  //       {
  //         label: 'Teléfono',
  //         link: '/adviser/telefono',
  //       },
  //       {
  //         label: 'Chat',
  //         link: '/adviser/chat',
  //       },
  //     ],
  //   },
  //   {
  //     icon: 'lucide:briefcase',
  //     label: 'Cartera',
  //     link: '/briefcase',
  //     active: false,
  //     items: [],
  //   },
  //   {
  //     icon: 'mingcute:user-add-line',
  //     label: 'Supervisor',
  //     link: '/supervisor',
  //     active: false,
  //     items: [],
  //   },
  //   {
  //     icon: 'lucide:bolt',
  //     label: 'Ajustes',
  //     link: '/settings',
  //     active: false,
  //     items: [
  //       {
  //         icon: 'lucide:briefcase',
  //         label: 'Configuración de la cuenta',
  //         link: '/settings/general',
  //       },
  //       {
  //         icon: 'lucide:shield-plus',
  //         label: 'Roles',
  //         link: '/settings/roles',
  //       },
  //       {
  //         icon: 'lucide:square-user-round',
  //         label: 'Agentes',
  //         link: '/settings/agents',
  //       },
  //       {
  //         icon: 'lucide:building-2',
  //         label: 'Áreas',
  //         link: '/settings/roles',
  //       },
  //       {
  //         icon: 'lucide:building',
  //         label: 'Oficinas',
  //         link: '/settings/roles',
  //       },
  //       {
  //         icon: 'lucide:users',
  //         label: 'Equipos',
  //         link: '/settings/teams',
  //       },
  //       {
  //         icon: 'lucide:stars',
  //         label: 'Habilidades',
  //         link: '/settings/skills',
  //       },
  //       {
  //         icon: 'lucide:inbox',
  //         label: 'Entradas',
  //         link: '/settings/inboxes',
  //       },
  //       {
  //         icon: 'lucide:tag',
  //         label: 'Estados Personalizados',
  //         link: '/settings/status',
  //       },
  //       {
  //         icon: 'ph:chat-circle-dots',
  //         label: 'Respuesta Predefinida',
  //         link: '/settings/predefined-response',
  //       },
  //       {
  //         icon: 'tabler:message',
  //         label: 'Mensajes Automaticos',
  //         link: '/settings/mensajes-automaticos',
  //       },
  //       {
  //         icon: 'ph:wallet',
  //         label: 'Carteras',
  //         link: '/settings/wallets',
  //       },
  //       {
  //         icon: 'lucide:tag',
  //         label: 'Etiquetas',
  //         link: '/settings/labels',
  //       },
  //       {
  //         icon: 'lucide:watch',
  //         label: 'Recordatorio',
  //         link: '/settings/reminder',
  //       },
  //       {
  //         icon: 'solar:calendar-linear',
  //         label: 'Calendario',
  //         link: '/settings/calendar',
  //       },
  //     ],
  //   },
  // ];
}
