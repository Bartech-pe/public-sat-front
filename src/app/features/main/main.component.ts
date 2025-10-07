import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { SidebarComponent } from '@layouts/sidebar/sidebar.component';
import { HeaderComponent } from '@layouts/header/header.component';
import { FooterComponent } from '@layouts/footer/footer.component';
import { BreadcrumbComponent } from '@shared/breadcrumb/breadcrumb.component';
import { ChatBubbleComponent } from './inbox-view/chat-bubble/chat-bubble.component';
import { SocketService } from '@services/socket.service';
import { MessageService } from 'primeng/api';
import { environment } from '@envs/environments';
import { MessageGlobalService } from '@services/generic/message-global.service';
import { AuthStore } from '@stores/auth.store';
import { User } from '@models/user.model';
import { Toast } from 'primeng/toast';
import { Subscription } from 'rxjs';
import { SidebarService } from '@services/sidebar.service';

@Component({
  selector: 'app-main',
  imports: [
    CommonModule,
    RouterModule,
    SidebarComponent,
    HeaderComponent,
    FooterComponent,
    ChatBubbleComponent,
    BreadcrumbComponent,
    ChatBubbleComponent,
    BreadcrumbComponent,
    Toast,
  ],
  template: `
    <div class="h-screen flex flex-col overflow-hidden">
      <div class="h-12 shrink-0">
        <app-header />
      </div>

      <div class="flex h-[calc(100vh-48px)] w-full overflow-hidden">
        <section
          [ngClass]="{
            'w-50 transition-all duration-300 ease-in-out': !collapsed,
            'w-0 transition-all duration-100 ease-in-out': collapsed
          }"
          class="h-full overflow-hidden"
        >
          <sidebar />
        </section>

        <section
          class="flex flex-col flex-1 h-full sat-background overflow-hidden"
        >
          <div class="h-[calc(100%-32px)] overflow-hidden">
            <div class="px-4 pt-4 h-full flex flex-col gap-2">
              <div class="h-14">
                <app-breadcrumb />
              </div>
              <div
                class="h-[calc(100%-56px)] w-full"
                [ngClass]="[isChatView() ? 'overflow-hidden' : 'overflow-auto']"
              >
                <router-outlet />
              </div>
            </div>
          </div>

          <div class="h-8 shrink-0">
            <app-footer />
          </div>
        </section>
      </div>
    </div>

    <app-chat-bubble *ngIf="!isOnBandeja()"></app-chat-bubble>

    <p-toast
      position="bottom-left"
      key="confirm"
      (onClose)="onReject()"
      [baseZIndex]="5000"
    >
      <ng-template let-message #message>
        <div class="flex flex-col items-start flex-auto">
          <div class="flex items-center gap-2">
            <span class="font-bold">{{ userCurrent.name }}</span>
          </div>
          <div class="font-medium text-md my-2">{{ message.summary }}</div>
        </div>
      </ng-template>
    </p-toast>
  `,
  styles: ``,
})
export class MainComponent {
  audio = new Audio();

  readonly authStore = inject(AuthStore);

  private readonly msg = inject(MessageGlobalService);

  get userCurrent(): User {
    return this.authStore.user()!;
  }

  constructor(
    public router: Router,
    private socketService: SocketService,
    private messageService: MessageService,
    public sidebarService: SidebarService
  ) {}

  ngOnInit() {
    this.audio.src = '/assets/sound.mp3';
    if (this.userCurrent.roleId === environment.roleIdSupervisor) {
      this.socketService.onAlertas((data) => {
        this.messageService.add({
          key: 'confirm',
          sticky: true,
          severity: 'success',
          summary: data.mensaje,
        });
      });
    }

    this.sub = this.sidebarService.sidebarVisible$.subscribe((visible) => {
      this.collapsed = !visible;
    });
  }

  collapsed = false;
  private sub = new Subscription();

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  isOnBandeja(): boolean {
    return this.router.url.includes('/inbox-view');
  }

  onReject() {
    this.messageService.clear('confirm');
  }
  isChatView() {
    return this.router.url.startsWith('/inbox-multi-channel');
  }
}
