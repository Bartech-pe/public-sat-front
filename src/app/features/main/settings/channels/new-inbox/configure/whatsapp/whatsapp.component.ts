import { Component, CUSTOM_ELEMENTS_SCHEMA, effect, EventEmitter, inject, Input, OnDestroy, OnInit, Output, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputMaskModule } from 'primeng/inputmask';
import { InputTextModule } from 'primeng/inputtext';
import { Toast, ToastModule } from 'primeng/toast';
import { DividerModule } from 'primeng/divider';
import { ImageModule } from 'primeng/image';
import { WhatsappAuthDto, WhatsappService } from '@services/whatsapp.service';
import { Subscription } from 'rxjs';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { CardModule } from 'primeng/card';
import { ModalLoaderComponent } from '@shared/modal/loader/modal-loader.component';
import { HttpResponse } from '@angular/common/http';
import { Messages, MessagesModule, MessagesStyle } from 'primeng/messages';
import { MessageGlobalService } from '@services/generic/message-global.service';
import { InboxStore } from '@stores/inbox.store';
import { ChannelStore } from '@stores/channel.store';
import { Channel } from '@models/channel.model';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { ButtonSaveComponent } from '@shared/buttons/button-save/button-save.component';
import { ChannelData } from '../../../inbox-form/inbox-form.component';
// For dynamic progressbar demo
@Component({
  selector: 'app-whatsapp',
  imports: [
    DropdownModule,
    InputMaskModule,
    InputTextModule,
    FormsModule,
    ReactiveFormsModule,
    InputGroupModule,
    InputGroupAddonModule,
    ButtonModule,
    ConfirmDialogModule,
    ToastModule,
    DividerModule,
    ImageModule,
    ProgressSpinnerModule,
    CardModule,
    ButtonSaveComponent,
  ],
  templateUrl: './whatsapp.component.html',
  providers: [MessageService],
  schemas:  [CUSTOM_ELEMENTS_SCHEMA],
  styles: `
  `
})

export class WhatsappComponent implements OnInit, OnDestroy {
  @Input() data: ChannelData | null = null;
  @Output() inboxChange = new EventEmitter<boolean>();

  readonly store = inject(InboxStore);
  readonly channelStore = inject(ChannelStore);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly msg = inject(MessageGlobalService);


  id!: number;
  selectedProvider = signal('');
  inboxName = signal('');
  phone = signal('');
  phoneId = signal('');
  businessId = signal('');
  apiKey = signal('');

  channelSelected!: Channel;

  formData = new FormGroup({
    name: new FormControl<string | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    phoneNumber: new FormControl<string | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    phoneNumberId: new FormControl<string | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    businessId: new FormControl<string | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    accessToken: new FormControl<string | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  constructor(){}

  ngOnDestroy(): void {
    // throw new Error('Method not implemented.');
  }
  ngOnInit(): void {
    if(this.data){
      console.log(this.data)
      this.id = this.data.id,
      this.formData.patchValue({
        name: this.data.name,
        accessToken: this.data.credentials?.accessToken ?? "",
        businessId: this.data.credentials.businessId?? "",
        phoneNumber: this.data.credentials?.phoneNumber?? "",
        phoneNumberId: this.data.credentials.phoneNumberId?? ""
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
        error ?? '¡Ups, ocurrió un error inesperado al guardar el canal!'
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
        accessToken: undefined,
        businessId: undefined,
        phoneNumberId: undefined,
      });
      console.log("entra a un effect")

      if (action === 'created') {
        this.inboxChange.emit(false);
        // this.messageLoader = ""
      } else {
        console.log("entra a un effect else")
        this.store.clearSelected();
        this.inboxChange.emit(false);
      }

      return;
    }

    // Si hay un item seleccionado, se carga en el formulario
    if (item) {
      this.id = item.id ?? null;
      this.formData.patchValue({
        name: item.name,
        phoneNumber: item.phoneNumber ? item.phoneNumber.replace(/\D/g, '').trim() : undefined,
        accessToken: item.accessToken,
        businessId: item.businessId,
        phoneNumberId: item.phoneNumberId,
      });
    }
  });

  onProviderChange(e: any) {
    this.selectedProvider.set(e.value);
  }

  onInboxNameChange(e: Event) {
    this.inboxName.set((e.target as HTMLInputElement).value);
  }

  onPhoneChange(e: Event) {
    this.phone.set((e.target as HTMLInputElement).value);
  }

  onPhoneIdChange(e: Event) {
    this.phoneId.set((e.target as HTMLInputElement).value);
  }

  onBusinessIdChange(e: Event) {
    this.businessId.set((e.target as HTMLInputElement).value);
  }

  onApiKeyChange(e: Event) {
    this.apiKey.set((e.target as HTMLInputElement).value);
  }

  confirmPhone(event: Event) {

  }

  // createChannel() {
  //   console.log({
  //     provider: this.selectedProvider(),
  //     inbox: this.inboxName(),
  //     phone: this.phone(),
  //     phoneId: this.phoneId(),
  //     businessId: this.businessId(),
  //     apiKey: this.apiKey()
  //   });
  // }


  onSubmit() {
    const form = this.formData.value;
    const cleanedForm = {
        ...form,
        accessToken: form.accessToken?.trim() ?? undefined,
        phoneNumber: this.phone() ? this.phone().replace(/\D/g, '').trim() : undefined,
    };
    if (this.id) {
      this.store.update(this.id, {
        ...form,
        phoneNumber: this.phone() ? this.phone().replace(/\D/g, '').trim() : undefined,
      });
    } else {
      this.store.create({ ...cleanedForm, channelId: this.channelSelected.id });
    }
  }
  // private AuthStatus?: Subscription;






  // phone = signal('');
  // showModal = signal(false);

  // channelSelected!: Channel;

  // formData = new FormGroup({
  //   name: new FormControl<string | undefined>(undefined, {
  //     nonNullable: true,
  //     validators: [Validators.required],
  //   }),
  //   phoneNumber: new FormControl<string | undefined>(undefined, {
  //     nonNullable: true,
  //     validators: [Validators.required, Validators.minLength(13)],
  //   }),
  //   status: new FormControl<boolean>(true, {
  //     nonNullable: true,
  //     validators: [Validators.required],
  //   }),
  // });

  // id!: number;
  // loginQr: string = "";
  // messageLoader: string = "";
  // numberValid: boolean = false;
  // authToastVisible: boolean = false;
  // authCompleted: boolean = false;
  // qrCodeError: string = "";



  // constructor(
  //   private whatsappService: WhatsappService
  // ){}



  // ngOnDestroy(): void {
  //   this.AuthStatus?.unsubscribe();
  //   this.whatsappService.disconnectServices();

  // }

  // ngOnInit(): void {
  //   this.AuthStatus?.unsubscribe()
  // }


  // onPhoneChange(event: Event) {
  //   const target = event.target as HTMLInputElement;
  //   this.phone.set(target.value);
  // }

  // confirmPhone(event: Event) {
  //   let phoneNumber = this.phone();
  //   if(phoneNumber == "") {
  //     this.qrCodeError = "El número es requerido."
  //     return;
  //   }
  //   let phoneNumberFomatted = phoneNumber.replace(/\D/g, '');
  //   this.messageLoader = "Generando QR de inicio de sesión."
  //   this.whatsappService.createAuthorizeQr(phoneNumberFomatted).subscribe({
  //     next: (response) => {
  //       this.whatsappService.listenToPhoneStatus(phoneNumberFomatted);
  //       if(this.loginQr != null){
  //         this.numberValid = true;
  //         this.loginQr = response.loginQr;
  //         this.messageLoader = "";
  //         this.qrCodeError = "";
  //         this.AuthStatus = this.whatsappService.authStatus$.subscribe((status: WhatsappAuthDto) => {
  //           switch (status.status) {
  //             case 'loading':
  //               this.messageLoader = "Creando nuevo cliente para Whatsapp."
  //               break;
  //             case 'disconnected':
  //               this.msg.error("Servidor no responde", status.message, 3000)
  //               this.inboxChange.emit(false);
  //               break;
  //             case 'success':
  //               this.authCompleted = true
  //               this.messageLoader = "Autenticación correcta, creando nuevo canal."
  //               this.onSubmit();
  //               break;
  //             case 'failed':
  //               this.msg.error("Algo ha salido mal", status.message, 3000)
  //               this.inboxChange.emit(false);
  //               break;
  //             default:
  //               this.inboxChange.emit(false);
  //               break;
  //           }
  //         });
  //       }
  //     },
  //     error: (err) => {
  //       this.messageLoader = "";
  //       this.numberValid = false;
  //       this.phone.set("");
  //       this.qrCodeError = "Hubo un problema con el servicio, Intentelo de nuevo más tarde."
  //       console.error('Fallo en la autenticación', err);
  //       // Mostrar notificación al usuario, etc.
  //     }

  //   });
  // }

  // onSubmit() {
  //   const form = this.formData.value;
  //   if (this.id) {
  //     this.store.update(this.id, {
  //       id: this.id,
  //       ...form,
  //       channelId: this.channelSelected.id,
  //     });
  //   } else {
  //     this.store.create({ ...form, channelId: this.channelSelected.id });
  //   }
  // }
}
