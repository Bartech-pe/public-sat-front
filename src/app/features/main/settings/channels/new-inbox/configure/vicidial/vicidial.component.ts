import { Component, CUSTOM_ELEMENTS_SCHEMA, effect, EventEmitter, inject, Input, OnInit, Output, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageGlobalService } from '@services/generic/message-global.service';
import { ChannelStore } from '@stores/channel.store';
import { Channel } from '@models/channel.model';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { ButtonSaveComponent } from '@shared/buttons/button-save/button-save.component';
import { ChannelData } from '../../../inbox-form/inbox-form.component';
import { CommonModule } from '@angular/common';
import { CreateVicidialCredentialDto, VicidialCredentialService } from '@services/vicidial-credential.service';
import { IBaseResponseDto } from '@interfaces/commons/base-response.interface';

@Component({
  selector: 'app-vicidial',
  imports: [
    CommonModule,
    InputTextModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    InputGroupModule,
    InputGroupAddonModule,
    ButtonSaveComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './vicidial.component.html',
  styles: ``,
})
export class VicidialComponent implements OnInit {

@Input() data: ChannelData | null = null;
  @Output() inboxChange = new EventEmitter<boolean>();

  readonly channelStore = inject(ChannelStore);
  private readonly msg = inject(MessageGlobalService);

  id!: number;
  inboxName = signal('');
  host = signal('');
  publicIp = signal('');
  loading = false;
  privateIp = signal('');
  user = signal('');
  password = signal('');

  channelSelected!: Channel;

  formData = new FormGroup({
    name: new FormControl<string | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    vicidialHost: new FormControl<string | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    publicIp: new FormControl<string | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    privateIp: new FormControl<string | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    user: new FormControl<string | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    password: new FormControl<string | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  constructor(private readonly vicidialCredentialService: VicidialCredentialService) {}

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  ngOnInit(): void {
    if (this.data) {
      console.log(this.data);
      this.id = this.data.id;
      this.formData.patchValue({
        name: this.data.name,
        vicidialHost: this.data.vicidialCredentials?.vicidialHost ?? "",
        publicIp: this.data.vicidialCredentials?.publicIp ?? "",
        privateIp: this.data.vicidialCredentials?.privateIp ?? "",
        user: this.data.vicidialCredentials?.user ?? "",
        password: this.data.vicidialCredentials?.password ?? "",
      });
    }
  }

  onInboxNameChange(e: Event) {
    this.inboxName.set((e.target as HTMLInputElement).value);
  }

  onHostChange(e: Event) {
    this.host.set((e.target as HTMLInputElement).value);
  }

  onPublicIpChange(e: Event) {
    this.publicIp.set((e.target as HTMLInputElement).value);
  }

  onPrivateIpChange(e: Event) {
    this.privateIp.set((e.target as HTMLInputElement).value);
  }

  onUserChange(e: Event) {
    this.user.set((e.target as HTMLInputElement).value);
  }

  onPasswordChange(e: Event) {
    this.password.set((e.target as HTMLInputElement).value);
  }

  onSubmit() {
    this.loading = true
    const form = this.formData.value;
    const cleanedForm: CreateVicidialCredentialDto = {
      name: form.name?.trim()?? "",
      vicidialHost: form.vicidialHost?.trim() ?? '',
      publicIp: form.publicIp?.trim() ?? '',
      privateIp: form.privateIp?.trim() ?? '',
      user: form.user?.trim() ?? '',
      password: form.password?.trim() ?? '',
    };

    this.vicidialCredentialService.createCredential({...cleanedForm, inboxId: this.id}).subscribe((response: IBaseResponseDto) => {
      if(response.success)
      {
        this.msg.success(response.message, "Credenciales registradas", 3000)
      }else{
        this.msg.error("No se pudo crear el canal", "Canal de Vicidial", 3000)
        console.error(response.error)
      }
      this.loading = false

      this.formData.reset({
        name: undefined,
        password: undefined,
        privateIp: undefined,
        publicIp: undefined,
        user: undefined,
        vicidialHost: undefined,
      });

      this.inboxChange.emit(false);
    })
  }
}
