import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, signal, ViewChild } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { User } from '@models/user.model';
import { MessageGlobalService } from '@services/generic/message-global.service';
import { SocketService } from '@services/socket.service';
import { UserStore } from '@stores/user.store';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { Popover } from 'primeng/popover';

@Component({
  selector: 'notification-supervises',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    DropdownModule,
  ],
  templateUrl: './notification-supervises.component.html',
  styles: ``
})
export class NotificationSupervisesComponent implements OnInit, OnDestroy {

   @ViewChild('popoverButonesNotificaciones') popoverButonesNotificaciones!: Popover;

  readonly storeUser = inject(UserStore);
  private readonly msg = inject(MessageGlobalService);
  readonly socketService = inject(SocketService);
  get listUsers(): User[] {
    return this.storeUser.items();
  }

  isLoading = false;
  
  get listSupervises (): User[] {
    return this.storeUser.items().filter((user) => user.roleId === 2);
  }

  limit = signal(10);
  offset = signal(0);
  formNotificacion = new FormGroup({
    userId: new FormControl<number[]>([], {
      nonNullable: true,
      validators: [Validators.required] // Ensures at least one supervisor is selected
    }),
    message: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(5)]
    })
  });

  // Optional: Log form values on submit
  enviarNotificacion(): void {
    if (this.formNotificacion.valid) {
      this.isLoading = true;
      const formValue = this.formNotificacion.value;
      console.log('Form Submitted:', formValue);
      this.socketService.sendAlertas(formValue);
      this.formNotificacion.reset({ userId: [], message: '' });
      this.formNotificacion.markAsUntouched();
      this.isLoading = false;
      if (this.popoverButonesNotificaciones) {
          this.popoverButonesNotificaciones.hide();
      }
      
    } else {
      this.msg.error('Por favor complete todos los campos');
      this.formNotificacion.markAllAsTouched();
     
    }
  }


  ngOnInit(): void {
      this.loadData();
  }

  ngOnDestroy() {
     ///document.removeEventListener('click', this.closeGroupOnClickOutside.bind(this));
  }

  loadData() {
    this.storeUser.loadAll(this.limit(), this.offset());
  }

}
