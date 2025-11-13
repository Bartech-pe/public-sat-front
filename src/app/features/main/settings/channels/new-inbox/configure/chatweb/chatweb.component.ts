import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  effect,
  EventEmitter,
  inject,
  Input,
  OnDestroy,
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
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputMaskModule } from 'primeng/inputmask';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { DividerModule } from 'primeng/divider';
import { ImageModule } from 'primeng/image';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { CardModule } from 'primeng/card';
import { MessageGlobalService } from '@services/generic/message-global.service';
import { InboxStore } from '@stores/inbox.store';
import { ChannelStore } from '@stores/channel.store';
import { Channel } from '@models/channel.model';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { ButtonSaveComponent } from '@shared/buttons/button-save/button-save.component';
import { ChannelData } from '../../../inbox-form/inbox-form.component';

@Component({
  selector: 'app-chatweb',
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
  templateUrl: './chatweb.component.html',
  providers: [MessageService],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  styles: ``,
})
export class ChatwebComponent implements OnInit {
  scriptCode = `<script type="text/javascript">
      var _miChat = _miChat || {};
      _miChat.key = 'mi-sala-prueba';
    </script>
    <script src="http://localhost:4000/loader.js" async></script>`;

  @Input() data: ChannelData | null = null;
  @Output() inboxChange = new EventEmitter<boolean>();

  readonly store = inject(InboxStore);
  readonly channelStore = inject(ChannelStore);

  private readonly msg = inject(MessageGlobalService);

  id!: number;
  selectedProvider = signal('');
  apiKey = signal('');
  inboxName = signal('');

  channelSelected!: Channel;

  formData = new FormGroup({
    name: new FormControl<string | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    accessToken: new FormControl<string | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  constructor() {}

  ngOnInit(): void {
    if (this.data) {
      (this.id = this.data.id),
        this.formData.patchValue({
          name: this.data.name,
          accessToken: this.data.credentials?.accessToken ?? '',
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
        accessToken: undefined,
      });

      if (action === 'created') {
        this.inboxChange.emit(false);
        // this.messageLoader = ""
      } else {
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
        accessToken: item.accessToken,
      });
    }
  });

  onProviderChange(e: any) {
    this.selectedProvider.set(e.value);
  }

  onInboxNameChange(e: Event) {
    this.inboxName.set((e.target as HTMLInputElement).value);
  }
  onApiKeyChange(e: Event) {
    this.apiKey.set((e.target as HTMLInputElement).value);
  }

  confirmPhone(event: Event) {}

  onSubmit() {
    const form = this.formData.value;
    const cleanedForm = {
      ...form,
      accessToken: form.accessToken?.trim() ?? undefined,
    };
    if (this.id) {
      this.store.update(this.id, {
        ...form,
      });
    } else {
      this.store.create({ ...cleanedForm, channelId: this.channelSelected.id });
    }
  }
}
