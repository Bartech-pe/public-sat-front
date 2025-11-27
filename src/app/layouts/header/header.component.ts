import { CommonModule, DatePipe } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  inject,
  OnInit,
  signal,
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
import { NotificationService } from '@services/notification.service';
import { SocketService } from '@services/socket.service';
import { User } from '@models/user.model';
import { AvatarModule } from 'primeng/avatar';
import { MessageEventsService } from '@services/message-events.service';
import { Reminder } from '@models/reminder.model';
import { ReminderService } from '@services/reminder.service';
import { MessageGlobalService } from '@services/generic/message-global.service';

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
    AvatarModule
  ],
  templateUrl: './header.component.html',
  styles: `
  .custom-scrollbar::-webkit-scrollbar {
  width: 4px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(55, 95, 149, 0.2);
    border-radius: 4px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(55, 95, 149, 0.4);
  }
`,
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

  readonly authStore = inject(AuthStore);
  private readonly store = inject(AuthStore);
  readonly  authService = inject(AuthService);
  readonly  sidebarService = inject(SidebarService);
  readonly  notificationService= inject(NotificationService);
  readonly  reminderService = inject(ReminderService);
  readonly  socketService = inject(SocketService);
  readonly  messageEvents = inject(MessageEventsService);
  private readonly msg = inject(MessageGlobalService);
  get userCurrent(): User {
      return this.authStore.user()!;
  }

  constructor(private elRef: ElementRef, private renderer: Renderer2) {}

  dateHoy: Date = new Date();
  timeHoy: Date = new Date();

  hasNotification: boolean = true;

  isDropdownOpen = false;
  isNotificationsOpen = signal<boolean>(false);
  isRemindersOpen= signal<boolean>(false);

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

  notifications: any[] = [];
  reminders: Reminder[] = [];

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
          this.isRemindersOpen.set(false);
          this.isNotificationsOpen.set(false);
        }
      });

      this.socketService.onMessage((msg) => {
        if (msg.senderId != this.userCurrent.id) {
            msg.senderId = false;
            this.allNotification();
        }
      });

      this.socketService.onNewReminder((res)=>{
        console.log("event received", res)
        this.allReminders()
      })

      this.allNotification();
      this.allReminders()
  }

  allNotification(){
    this.notificationService.findAllByuserId().subscribe((res:any) => {
       this.notifications = res.data;
    })
  }
  allReminders(){
    this.reminderService.findAllByuserId().subscribe((res:any) => {
       this.reminders = res.data;
    })
  }

  viewMessage(n:any){
     this.isNotificationsOpen.set(false);
     this.messageEvents.sendMessageSelected(n);
  }

  get name(): string | undefined {
    return this.store.user()?.name;
  }

  // En tu componente
  get todayReminders(): Reminder[] {
    if (!this.reminders) return [];

    const today = new Date();
    const todayStr = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;

    return this.reminders.filter(r => {
      const d = new Date(r.reminderAt!);
      const dateStr = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      return dateStr === todayStr;
    });
  }

  get pastReminders(): Reminder[] {
    if (!this.reminders) return [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.reminders.filter(r => {
      const d = new Date(r.reminderAt!);
      d.setHours(0, 0, 0, 0);
      return d.getTime() < today.getTime();
    });
  }

  get upcomingReminders(): Reminder[] {
    if (!this.reminders) return [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.reminders.filter(r => {
      const d = new Date(r.reminderAt!);
      d.setHours(0, 0, 0, 0);
      return d.getTime() > today.getTime();
    });
  }
  get allRemindersRead()
  {
    return this.todayRemindersRead?.length + this.pastRemindersRead?.length + this.upcomingRemindersRead?.length
  }

  get upcomingRemindersRead(): Reminder[]
  {
    return this.upcomingReminders.filter(x => x.status)
  }
  get pastRemindersRead(): Reminder[]
  {
    return this.pastReminders.filter(x => x.status)
  }
  get todayRemindersRead(): Reminder[]
  {
    return this.todayReminders.filter(x => x.status)
  }

  deleteReminder(reminder: Reminder): void {
    this.reminderService.delete(reminder.id).subscribe(x => {
      this.reminders = this.reminders.filter(remainingReminder => remainingReminder.id != reminder.id)
      this.msg.success("El recordatorio fue eliminado correctamente.", "Recordatorios", 3000)
    })
  }


  markAllRemindersAsRead(reminder: Reminder | null = null): void {
    let remindersUnread: number[] = [];
    if (reminder) {
      this.msg.confirm(
        "¿Desea marcar este recordatorio como leído?",
        () => {
          remindersUnread = [reminder.id];
          this.sendMarkAsReadRequest(remindersUnread);
        },
        () => {},
        "Recordatorios"
      );
    }else{
      remindersUnread = this.reminders
        .filter(r => r.status)
        .map(r => r.id);

      this.sendMarkAsReadRequest(remindersUnread);
    }
  }
  private sendMarkAsReadRequest(ids: number[]): void {
    this.reminderService.markRemindersAsRead(ids).subscribe(response => {
      if (!response.success) {
        this.msg.error(response.message, "Recordatorios", 3000);
        console.error(response?.error);
      } else {
        this.msg.success(response.message, "Recordatorios", 3000);
      }

      this.allReminders();
    });
  }


  get displayName(): string | undefined {
    return this.store.user()?.displayName;
  }

  get role(): string | undefined {
    return this.store.user()?.role?.name;
  }

  get initials(): string | undefined {
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

  toggleReminders(): void {
    this.isRemindersOpen.set(!this.isRemindersOpen());
    // asegurar que no queden otros menus abiertos
    if (this.isNotificationsOpen) {
      this.isNotificationsOpen.set(false);
    }
  }

  // Notificaciones
  toggleNotifications(): void {
    this.isNotificationsOpen.set(!this.isNotificationsOpen());
    if (this.isRemindersOpen) {
      this.isRemindersOpen.set(false);
    }
  }

  // marcar/desmarcar notificación individual
  toggleNotificationChecked(item: NotificationItem): void {
    item.checked = !item.checked;
    // si se marcaron todas, no mostramos el indicador (lo maneja unreadCount getter)
  }

  // marcar todas (opcional)
  markAllAsRead(): void {
    this.notificationService.allAsReadNotification({}).subscribe((res:any) => {
        this.allNotification();
    })
  }

  // cantidad de no leídas
  get unreadCount(): number {
    return this.notifications.filter((n) => !n.checked).length;
  }
  get unreadRemindersCount(): number {
    return this.notifications.filter((n) => !n.checked).length;
  }

  // helper para mostrar fecha legible
  formatDate(d?: Date): string {
    if (!d) return '';
    const dt = new Date(d);
    return dt.toLocaleDateString(); // puedes adaptar formato si quieres DatePipe
  }
}
