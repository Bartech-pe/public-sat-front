import { CommonModule } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  effect,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
  signal,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { InputTextModule } from 'primeng/inputtext';
import { MessagesModule } from 'primeng/messages';
import { InputMaskModule } from 'primeng/inputmask';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { ToastModule } from 'primeng/toast';
import { MessageGlobalService } from '@services/message-global.service';
import { Inbox } from '@models/inbox.model';
import { ButtonSaveComponent } from '@shared/buttons/button-save/button-save.component';
import { InboxStore } from '@stores/inbox.store';
import { ChannelStore } from '@stores/channel.store';
import { Channel } from '@models/channel.model';
import { TelegramService } from '@services/telegram.service';
import { ChannelData } from '../../../inbox-form/inbox-form.component';
import { InputNumberInputEvent, InputNumberModule } from 'primeng/inputnumber';
import { PhoneFormatPipe } from '@pipes/phone-format.pipe';
@Component({
  selector: 'app-telegram',
  imports: [
    CommonModule,
    InputTextModule,
    FormsModule,
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    ConfirmDialogModule,
    MessagesModule,
    InputTextModule,
    InputMaskModule,
    InputNumberModule,
    InputGroupModule,
    InputGroupAddonModule,
    ToastModule,
    ButtonSaveComponent,
  ],
  providers: [PhoneFormatPipe],
  templateUrl: './telegram.component.html',
  styles: ``,
})
export class TelegramComponent implements OnInit {
  @Output() inboxChange = new EventEmitter<boolean>();
  @Input() data: ChannelData | null = null;
  phoneFormat = new PhoneFormatPipe();
  private readonly confirmationService = inject(ConfirmationService);
  private readonly msg = inject(MessageGlobalService);
  readonly store = inject(InboxStore);
  readonly channelStore = inject(ChannelStore);

  email: string = ''
  phone = signal('');
  code = signal('');
  codeSended = signal(false);
  showModal = signal(false);
  requireEmail = signal(false);

  channelSelected!: Channel;

  formData = new FormGroup({
    name: new FormControl<string | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    phoneNumber: new FormControl<string | undefined>(undefined, {
      nonNullable: false,
      validators: [Validators.minLength(13)],
    }),
    status: new FormControl<boolean | undefined>(true, {
      nonNullable: false
    })
  });

  id!: number;

  constructor(private telegramService: TelegramService) {}
  ngOnInit(): void {
    if(this.data){
      this.formData.patchValue({
        name: this.data.name,
        phoneNumber: this.data.credentials?.phoneNumber
      });
    }
  }

  get loading(): boolean {
    return this.store.loading();
  }

  private resetOnSuccessEffect = effect(() => {
    const item = this.store.selectedItem();
    const error = this.store.error();
    const action = this.store.lastAction();

    const channel = this.channelStore.selectedItem();

    // Manejo de errores
    if (error) {
      console.log('error', error);
      this.msg.error(
        error ?? '¡Ups, ocurrió un error inesperado al guardar el rol!'
      );
      return; // Salimos si hay un error
    }

    if (channel) {
      this.channelSelected = channel;
    }

    // Si se ha creado o actualizado correctamente
    if (action === 'created' || action === 'updated') {
      this.msg.success(
        action === 'created'
          ? '¡Bandeja de entrada creada exitosamente!'
          : '¡Bandeja de entrada actualizada exitosamente!'
      );

      this.formData.reset({
        name: undefined,
        phoneNumber: undefined,
        status: true,
      });

      if (action === 'created') {
        this.inboxChange.emit(false);
      } else {
        this.store.clearSelected();
        this.inboxChange.emit(false);
      }

      return;
    }

    if (item) {
      this.id = item.id ?? null;
      this.formData.patchValue({
        name: item.name,
        phoneNumber: item.phoneNumber,
        status: item.status!,
      });
    }
  });

  sendCode(phoneValue: string) {
    if(phoneValue != ""){
      let phoneNumberFormatted = phoneValue.replace(/[^\d+]/g, '');
      this.telegramService.sendCodeAuth({phoneNumber: phoneNumberFormatted, email: this.email}).subscribe({
        next: (response)=>{
          if(response.authStatuses?.codeSended){
            this.msg.toast("success","¡Código enviado!", response.message, 3000)
            this.codeSended.set(true)
            return
          }
          else{
            if(response.authStatuses?.authMethod == 'EMAIL'){
                this.msg.toast("warn","Por su seguridad, ingrese un correo electrónico para recepcionar el codigo de inicio de sesión.", response.message, 3000)
                this.requireEmail.set(true)
                return
            }
            this.msg.toast("error","Mensaje no enviado", response.message, 3000)
            return
          }
        },
        error: (error)=>{
          console.log(error)
          this.msg.toast("error","Ocurrió un problema", error.message, 3000)
        }
      })
    }
  }

  createNewSession() {
    let phoneNumber = this.phone().replace(/[^\d+]/g, '');
    let code = this.code().replace(/[^\d+]/g, '');
    if(phoneNumber != "" && code != ""){
      this.telegramService.createAuthSession({phoneNumber: phoneNumber, code: code}).subscribe({
        next: (response)=>{
          this.onSubmit()
        },
        error: (error)=>{
          console.log(error);
          this.msg.toast("error","Ocurrió un problema", error.message, 3000)
        }
      })
    }
  }

  get isActive(): boolean {
    return this.formData.get('status')?.value as boolean;
  }

  onPhoneChange(event: InputNumberInputEvent) {
    let formatted = '51'.concat(event.value as string)
    this.phone.set(formatted);
    console.log(this.phone())
  }

  onCodeChange(event: Event) {
    const target = event.target as HTMLInputElement;
    let codeFormatted = target.value.replace(/[^\d+]/g, '');
    this.code.set(codeFormatted);
  }

  validatePhone() {
    if (this.phone().trim().length >= 6) {
      this.confirmModal()
    }
  }

  confirmModal() {
      const phoneValue = this.phone();
      this.confirmationService.confirm({
        message:  `<div class="flex flex-col justify-center space-y-3">
            <p class="text-gray-800 text-base">
              ¿Estás seguro de que el número
              <span class="text-primary-600 font-semibold uppercase">
                ${this.phoneFormat.transform(phoneValue)}
              </span>
              está asociado a Telegram?
            </p>
            <p class="text-sm text-gray-600">
              Verifica que el número sea correcto antes de continuar.
            </p>
            <p class="text-sm text-yellow-700 bg-yellow-50 p-2 rounded-md border border-yellow-200">
              Se enviará un código de inicio de sesión a este número.
            </p>
          </div>
      `,
        header: "Confirmar número",
        acceptLabel: 'Confirmar',
        rejectLabel: 'Cancelar',
        acceptButtonStyleClass: 'p-button-info p-button-sm !px-2 !py-1.5',
        rejectButtonStyleClass: 'p-button-contrast p-button-sm !px-2 !py-1.5',
        accept: ()=>{
            this.sendCode(phoneValue)
        },
        reject: ()=>{},
      });
  }

  onSubmit() {
    const form = this.formData.value;
    const cleanedForm = {
        ...form,
        status: form.status ?? undefined,
        phoneNumber: form.phoneNumber?.replace("+","").replace(" ", "").trim() ?? undefined,
    };

    if (this.id) {
      this.store.update(this.id, cleanedForm);
    } else {
      this.store.create({ ...cleanedForm, idChannel: this.channelSelected.id });
    }
  }
}
