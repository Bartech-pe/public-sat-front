import { CommonModule, DatePipe } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  inject,
  OnInit,
} from '@angular/core';
import { ClockComponent } from '@shared/clock/clock.component';
import { LogoComponent } from '@shared/logo/logo.component';
import { ButtonModule } from 'primeng/button';
import { MenuItem } from 'primeng/api';
import { Menu, MenuModule } from 'primeng/menu';
import { BtnCustomComponent } from '@shared/buttons/btn-custom/btn-custom.component';
import { AuthStore } from '@stores/auth.store';
import { AuthService } from '@services/auth.service';
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';
import { SidebarService } from '@services/sidebar.service';
import { ElementRef, Renderer2 } from '@angular/core';

interface CalendarEvent {
  id: number;
  title: string;
  date: Date;
  description?: string;
}

interface NotificationItem {
  id: number;
  text: string;
  idUser?: number;
  date?: Date;
  checked?: boolean; // true = leído/checado
}

@Component({
  selector: 'app-header',
  imports: [
    //LogoComponent,
    CommonModule,
    MenuModule,
    ButtonModule,
    //ClockComponent,
    //BtnCustomComponent,
  ],
  templateUrl: './header.component.html',
  styles: ``,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  animations: [
    trigger('dropdownAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-10px)' }),
        animate(
          '150ms ease-out',
          style({ opacity: 1, transform: 'translateY(0)' })
        ),
      ]),
      transition(':leave', [
        animate(
          '150ms ease-in',
          style({ opacity: 0, transform: 'translateY(-10px)' })
        ),
      ]),
    ]),
  ],
})
export class HeaderComponent implements OnInit {
  private readonly store = inject(AuthStore);
  readonly authService = inject(AuthService);
  readonly sidebarService = inject(SidebarService);

  constructor(private elRef: ElementRef, private renderer: Renderer2) {}

  dateHoy: Date = new Date();
  timeHoy: Date = new Date();

  hasNotification: boolean = true;

  isDropdownOpen = false;
  isCalendarOpen = false;
  isNotificationsOpen = false;

  // datos (ejemplos, reemplaza por tus datos reales)
  calendarEvents: CalendarEvent[] = [
    {
      id: 1,
      title: 'Cierre de mes',
      date: new Date(2025, 7, 31),
      description: 'Cierre contable mensual',
    },
    {
      id: 2,
      title: 'Mantenimiento servidor',
      date: new Date(2025, 7, 15),
      description: 'Mantenimiento programado 02:00-04:00',
    },
    {
      id: 3,
      title: 'Reunión equipo',
      date: new Date(2025, 7, 12),
      description: 'Revisión sprints',
    },
  ];

  notifications: NotificationItem[] = [
    { id: 1, text: 'Nuevo mensaje de Juan', date: new Date(), checked: false },
    { id: 2, text: 'Orden #234 aprobada', date: new Date(), checked: false },
    { id: 3, text: 'Backup completado', date: new Date(), checked: false },
  ];

  hasCalendarNotification = this.calendarEvents.length > 0;

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  onSelect(option: string): void {
    console.log('Seleccionaste:', option);
    this.isDropdownOpen = false;
  }

  ngOnInit(): void {
    const now = new Date();
    this.dateHoy = now;
    this.timeHoy = now;

    this.renderer.listen('window', 'click', (event: Event) => {
      if (!this.elRef.nativeElement.contains(event.target)) {
        this.isDropdownOpen = false;
        this.isCalendarOpen = false;
        this.isNotificationsOpen = false;
      }
    });
  }

  get name(): string | undefined {
    return this.store.user()?.name;
  }

  get displayName(): string | undefined {
    return this.store.user()?.displayName;
  }

  get role(): string | undefined {
    return this.store.user()?.role?.name;
  }

  get initals(): string | undefined {
    return this.store.user()?.name.charAt(0);
  }

  get connected(): boolean {
    return !!this.store.user()?.connected;
  }

  toggleSidebar() {
    this.sidebarService.toggleSidebar();
  }

  logout() {
    this.store.logout();
  }

  toggleCalendar(): void {
    this.isCalendarOpen = !this.isCalendarOpen;
    // asegurar que no queden otros menus abiertos
    if (this.isCalendarOpen) {
      this.isNotificationsOpen = false;
    }
  }

  // Notificaciones
  toggleNotifications(): void {
    this.isNotificationsOpen = !this.isNotificationsOpen;
    if (this.isNotificationsOpen) {
      this.isCalendarOpen = false;
    }
  }

  // marcar/desmarcar notificación individual
  toggleNotificationChecked(item: NotificationItem): void {
    item.checked = !item.checked;
    // si se marcaron todas, no mostramos el indicador (lo maneja unreadCount getter)
  }

  // marcar todas (opcional)
  markAllAsRead(): void {
    this.notifications.forEach((n) => (n.checked = true));
  }

  // cantidad de no leídas
  get unreadCount(): number {
    return this.notifications.filter((n) => !n.checked).length;
  }

  // helper para mostrar fecha legible
  formatDate(d?: Date): string {
    if (!d) return '';
    const dt = new Date(d);
    return dt.toLocaleDateString(); // puedes adaptar formato si quieres DatePipe
  }
}
