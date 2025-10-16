import {
  Component,
  signal,
  computed,
  ViewChild,
  ElementRef,
  inject,
  OnInit,
  CUSTOM_ELEMENTS_SCHEMA,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  FormControl,
} from '@angular/forms';
import { GmailService } from '@services/gmail.service';
import { ActivatedRoute, Router } from '@angular/router';
import { PickerModule } from '@ctrl/ngx-emoji-mart';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { EditorModule } from 'primeng/editor';
import { MailService } from '@services/mail.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { AuthService } from '@services/auth.service';
import { environment } from '@envs/environments';
import { MultiSelectModule } from 'primeng/multiselect';
import { UserStore } from '@stores/user.store';
import { User } from '@models/user.model';
import { MessageGlobalService } from '@services/generic/message-global.service';
import { BtnCustomComponent } from '@shared/buttons/btn-custom/btn-custom.component';
import { ChannelStateService } from '@services/channel-state.service';
import { ChannelState } from '@models/channel-state.model';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { FormAssistanceComponent } from './form-assistance/form-assistance.component';
import { DialogService } from 'primeng/dynamicdialog';
import { AssistanceStateService } from '@services/assistance-state.service';
import {
  MailEnum,
  mailEnumToState,
  MailStates,
  MailType,
} from '@constants/mail.constant';
import { getContrastColor } from '@utils/color.util';
import { AssistanceState } from '@models/assistance-state.model';
import { CheckboxModule } from 'primeng/checkbox';
import { PredefinedResponsesService } from '@services/predefined.service';
import { PredefinedResponses } from '@models/predefined-response.model';
import { Popover, PopoverModule } from 'primeng/popover';
import { ReplyMailComponent } from './reply-mail/reply-mail.component';
import { SocketService } from '@services/socket.service';
import { FormSignatureComponent } from './form-signature/form-signature.component';
import { EmailSignatureService } from '@services/email-signature.service';
import { SplitButtonModule } from 'primeng/splitbutton';
import { CalendarCommonModule } from 'angular-calendar';
import { CardModule } from 'primeng/card';
import { Reply } from '@models/mail-reply.model';
import { ForwardCenterMail } from '@models/mail-forward.model';

interface Mail {
  id: number;
  mailAttentionId?: number;
  from: string;
  to: string;
  name: string;
  subject: string;
  body: string;
  createdAt?: Date;
  starred: boolean;
  read: boolean;
  hasAttachment?: boolean;
  sizeMB: number;
  folder: 'inbox' | 'sent' | 'drafts' | 'spam' | 'trash'; // 👈 sin open/closed
  selected?: boolean;

  // 👉 Campos nuevos
  advisor?: User;
  state?: AssistanceState; // estado viene del backend
  showMore?: boolean;
  replies?: Reply[];

  closed?: boolean;
  deleted?: boolean;
}

interface MailDto {
  id: number;
  from?: string;
  to?: string;
  subject?: string;
  content?: string;
  body?: string;
  date?: string;
  state?: AssistanceState;
  replies?: {
    id: number;
    from: string;
    body?: string;
    content?: string;
    date?: string;
  }[];
}

interface CenterEmail {
  to: string[];
  subject: string;
  content: string;
  mailAttentionId?: number;
}

interface OptionView {
  key: MailType;
  label: string;
  icon: string;
  textColor: string;
  bgColor: string;
  isHover?: boolean;
}

@Component({
  selector: 'app-mail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DialogModule,
    PickerModule,
    OverlayPanelModule,
    EditorModule,
    MultiSelectModule,
    SelectModule,
    InputTextModule,
    CheckboxModule,
    EditorModule,
    PopoverModule,
    CardModule,
    SplitButtonModule,
    BtnCustomComponent,
    ReplyMailComponent,
    CalendarCommonModule,
  ],
  templateUrl: './mail.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class MailComponent implements OnInit {
  @ViewChild('responses') responses!: Popover;

  private readonly roleIdAdministrador = environment.roleIdAdministrador;

  private readonly roleIdSupervisor = environment.roleIdSupervisor;

  private readonly roleIdAsesor = environment.roleIdAsesor;

  private readonly dialogService = inject(DialogService);

  private readonly msg = inject(MessageGlobalService);

  private readonly socketService = inject(SocketService);

  private readonly channelStateService = inject(ChannelStateService);

  private readonly assistanceStateService = inject(AssistanceStateService);

  private readonly route = inject(ActivatedRoute);

  private readonly predefinedResponsesService = inject(
    PredefinedResponsesService
  );

  private readonly emailSignatureService = inject(EmailSignatureService);

  userMailStates: ChannelState[] = [];

  userStateId!: number;

  predefinedResponseList: PredefinedResponses[] = [];

  quillModules = {
    toolbar: {
      container: [
        // texto básico
        ['bold', 'italic', 'underline', 'strike'],

        // encabezados
        [{ header: [1, 2, 3, 4, 5, 6, false] }],

        // listas y sangría
        [{ list: 'ordered' }, { list: 'bullet' }],
        [{ indent: '-1' }, { indent: '+1' }],

        // alineación
        [{ align: [] }],

        // colores y fondos
        [{ color: [] }, { background: [] }],

        // scripts superíndice/subíndice
        [{ script: 'sub' }, { script: 'super' }],

        // bloques de cita y código
        ['blockquote', 'code-block'],

        // links, imágenes, video
        ['link', 'image', 'video'],

        // tablas (nuevo en Quill 2)
        ['table'],

        // limpiar formato
        ['clean'],
      ],
    },
    imageResize: {
      modules: ['Resize', 'DisplaySize', 'Toolbar'],
    },
    table: true, // activar módulo de tabla de Quill 2
  };

  private fb = new FormBuilder();
  constructor(
    private authService: AuthService,
    private gmailService: GmailService,
    private mailService: MailService,
    private router: Router,
    private sanitizer: DomSanitizer
  ) {}

  get userList(): User[] {
    return this.filteredMails
      .filter((mail) => !!mail.advisor)
      .map((mail) => mail.advisor as User)
      .filter(
        (user, index, self) => index === self.findIndex((u) => u.id === user.id)
      );
  }

  selectedUsers: number[] = [];

  isSupervisor = false;

  menuOpen = false;
  selectMenuOpen = false;
  allSelected: boolean = false;

  showLoginMessage = false;

  replyingTo: Mail | null = null;
  isReplying = false;

  isForwardMode = false;
  forwardTo = '';
  forwardSubject = '';
  forwardText = '';
  forwardBody = '';
  forwardFrom = '';
  forwardMailAttentionId: number | null = null;

  formatBarVisible = false;
  showFormatting = false;

  filterVisible = signal(false);
  selectedMail = signal<Mail | null>(null);

  currentView = signal<MailType>('inbox');

  replyText = '';
  attachments: any[] = [];

  optionViews: OptionView[] = [
    {
      key: MailEnum.INBOX,
      label: 'Recibidos',
      icon: 'material-symbols:inbox',
      textColor: '#fff',
      bgColor: '#375f95',
    },
    {
      key: MailEnum.OPEN,
      label: 'Abiertos',
      icon: 'ion:open',
      textColor: '',
      bgColor: '',
    },
    {
      key: MailEnum.ATTENTION,
      label: 'En atención',
      icon: 'bi:person-fill-exclamation',
      textColor: '',
      bgColor: '',
    },
    {
      key: MailEnum.PENDDING,
      label: 'Pendiente',
      icon: 'tabler:clock-filled',
      textColor: '',
      bgColor: '',
    },
    {
      key: MailEnum.CLOSED,
      label: 'Cerrados',
      icon: 'mdi:archive-lock',
      textColor: '',
      bgColor: '',
    },
    {
      key: MailEnum.UNASSIGNED,
      label: 'Sin asignar',
      icon: 'mdi:file-document-remove',
      textColor: '',
      bgColor: '',
    },
    {
      key: MailEnum.SPAM,
      label: 'No deseados',
      icon: 'ri:spam-fill',
      textColor: '',
      bgColor: '',
    },
  ];

  originalRoute: string = '';

  ngOnInit() {
    this.loadChannelStateEmails();

    this.getMyChannelStateEmail();

    this.loadSignature();

    this.loadAssistanceStateEmails();

    this.loadPredefinedResponseMail();

    this.originalRoute = this.router.url.split('?')[0];
    console.log('Ruta original:', this.originalRoute);
    this.route.queryParams.subscribe((params) => {
      const view = params['view'] ?? 'inbox';

      this.currentView.set(view);

      this.loadMails();
    });

    this.socketService.onEmailRequest().subscribe({
      next: () => {
        console.log('Mensaje identificado');
        this.loadMails();

        if (this.selectedMail()) {
          this.openMail(this.selectedMail()!);
        }
      },
    });
  }

  loadChannelStateEmails() {
    this.channelStateService.channelStateEmail().subscribe({
      next: (data) => {
        this.userMailStates = data;
      },
    });
  }

  loadAssistanceStateEmails() {
    this.assistanceStateService.assistanceStateEmail().subscribe({
      next: (data) => {
        this.optionViews.forEach((view) => {
          const stateId = mailEnumToState[view.key as MailEnum];
          if (stateId) {
            const state = data.find((d) => d.id === stateId);

            if (state) {
              view.icon = state.icon ?? view.icon;
              view.textColor = getContrastColor(state.color);
              view.bgColor = state.color;
            }
          }
        });
      },
    });
  }

  loadPredefinedResponseMail() {
    this.predefinedResponsesService.allMail().subscribe({
      next: (data) => {
        this.predefinedResponseList = data;
      },
    });
  }

  loadSignature() {
    this.emailSignatureService.findOneByTokenUserId().subscribe({
      next: (data) => {
        this.signature = data?.content ?? '';
      },
    });
  }

  private mapMail(item: any): Mail {
    return {
      id: item.id,
      mailAttentionId: item.mailAttentionId,
      from: item.from || 'Desconocido',
      name: item.name,
      to: item.to || '',
      subject: item.subject || '(sin asunto)',
      body: item.body || item.content || '',
      createdAt: item.createdAt,
      starred: false,
      read: false,
      folder: 'inbox',
      sizeMB: 1,
      selected: false,
      advisor: item.advisor,
      state: item.state,
      showMore: false,
      replies: (item.replies || []).map((r: any) => ({
        id: r.id,
        from: r.from,
        body: r.body || r.content || '',
        createdAt: r.createdAt,
        type: (r.type as Reply['type']) || 'CIUDADANO',
      })),
    };
  }

  trackById(index: number, reply: Reply) {
    return reply.id;
  }

  getViewIsActive(view: OptionView): boolean {
    return this.currentView() === view.key;
  }

  getButtonStyle(view: OptionView) {
    if (this.getViewIsActive(view)) {
      return { 'background-color': view.bgColor, color: view.textColor };
    }

    if (view.isHover) {
      return { color: view.bgColor };
    }

    return {};
  }

  getStateStyle(state: AssistanceState) {
    return {
      'background-color': state.color,
      color: getContrastColor(state.color),
    };
  }

  addReply() {
    if (!this.replyText.trim()) return;

    const reply: Reply = {
      id: Date.now(),
      from: 'demo.correo.sat@gmail.com',
      body: this.replyText,
      date: new Date(),
      attachments: this.attachments.map((a) => ({
        name: a.name,
        size: a.size,
        url: URL.createObjectURL(a.file),
      })),
      type: 'ASESOR',
    };

    const current = this.selectedMail();
    if (current) {
      current.replies = [...(current.replies || []), reply];
      this.selectedMail.set({ ...current });
    }

    this.replyText = '';
    this.attachments = [];
    this.isReplying = false;
  }

  selectResponse(event: any) {
    this.responses.toggle(event);
  }

  insertResponse(response: PredefinedResponses) {
    console.log('response.content', response.content);
    this.replyText = this.replyText + response.content;
  }

  getMyChannelStateEmail() {
    this.channelStateService.myChannelStateEmail().subscribe({
      next: (data) => {
        this.userStateId = data?.id;
      },
    });
  }

  changeChannelState() {
    if (this.userStateId) {
      this.mailService.changeEmailState(this.userStateId).subscribe({
        next: () => {
          this.msg.success('Estado actualizado');
        },
      });
    }
  }

  openMail(mail: Mail) {
    const id = mail.mailAttentionId;
    if (!id) return;

    this.selectedMail.set(mail);

    this.mailService.getMessageDetail(id).subscribe({
      next: (detail: any[]) => {
        if (!detail || detail.length === 0) return;

        // Convertimos todo en un hilo de mensajes
        const thread: Reply[] = detail.map((d) => ({
          id: d.id,
          from: d.from,
          body: d.content || d.body || '',
          date: new Date(d.date),
          attachments: d.files || [],
          type: (d.type as Reply['type']) || 'CIUDADANO', // <--- aquí también
        }));

        this.selectedMail.set({
          ...mail,
          body: thread[0]?.body || '(sin contenido)',
          replies: thread.slice(1), // 👈 los demás son respuestas
        });
      },
    });
  }

  replyTags: Record<
    string,
    { label: string; bg: string; border: string; text: string }
  > = {
    CIUDADANO: {
      label: 'Ciudadano',
      bg: 'bg-green-50',
      border: 'border-green-300',
      text: 'text-green-700',
    },
    ASESOR: {
      label: 'Asesor',
      bg: 'bg-blue-50',
      border: 'border-blue-300',
      text: 'text-blue-700',
    },
    REENVIO_INTERNO: {
      label: 'Reenvío Interno',
      bg: 'bg-yellow-50',
      border: 'border-yellow-300',
      text: 'text-yellow-700',
    },
    RESPUESTA_INTERNA: {
      label: 'Respuesta Interna',
      bg: 'bg-purple-50',
      border: 'border-purple-300',
      text: 'text-purple-700',
    },
  };

  get canSeeSupervisorBlock(): boolean {
    return this.authService.hasRole([
      this.roleIdSupervisor,
      this.roleIdAdministrador,
    ]);
  }

  get canSeeAsesorBlock(): boolean {
    return this.authService.hasRole([this.roleIdAsesor]);
  }

  get filteredMails(): Mail[] {
    const query = this.searchQuery().toLowerCase();
    const all = this.mails();

    return all.filter((mail) => {
      // 🔎 filtro por asunto
      const subject = mail.subject?.toLowerCase() ?? '';

      // 📧 filtro por remitente (correo "from")
      const from = mail.from?.toLowerCase() ?? '';

      const matchesQuery =
        !query || subject.includes(query) || from.includes(query);

      // 👤 filtro por asesor (si hay seleccionados)
      const matchesAdvisor =
        !this.selectedUsers.length ||
        (mail.advisor && this.selectedUsers.includes(mail.advisor.id));

      return matchesQuery && matchesAdvisor;
    });
  }

  connectAccount() {
    this.gmailService.loginWithGoogle();
  }

  mails = signal<Mail[]>([]);

  loadMails() {
    // const user = this.authService.getUser();

    // // Si es ASESOR, carga sus tickets + los no asignados
    // if (this.authService.hasRole([this.roleIdAsesor]) && user?.id) {
    //   this.mailService.getTicketsByAdvisor(user.id).subscribe({
    //     next: (assigned: MailDto[]) => {
    //       this.mailService.getMessagesNoAdvisor().subscribe({
    //         next: (unassigned: MailDto[]) => {
    //           const all = [...assigned, ...unassigned];
    //           const mapped = all.map((item) => this.mapMail(item));
    //           const view = this.currentView();

    //           const filtered = mapped.filter((m) => {
    //             if (view === 'inbox') {
    //               return m.folder === 'inbox' || m.status === 'unassigned';
    //             } else if (['sent', 'drafts', 'spam', 'trash'].includes(view)) {
    //               return m.folder === view;
    //             } else if (['open', 'closed', 'unassigned'].includes(view)) {
    //               return m.status === view;
    //             } else {
    //               return true;
    //             }
    //           });

    //           this.mails.set(filtered);
    //         },
    //         error: (err) =>
    //           console.error('❌ Error obteniendo correos sin asignar', err),
    //       });
    //     },
    //     error: (err) =>
    //       console.error('❌ Error obteniendo tickets por ASESOR', err),
    //   });
    //   return;
    // }

    // Si es admin o supervisor, carga todos los mensajes
    this.mailService.getMessages().subscribe({
      next: (res: MailDto[]) => {
        const mapped = res.map((item) => this.mapMail(item));

        const view = this.currentView();

        const filtered = mapped.filter((m) => {
          if (view === 'inbox') {
            return (
              m.folder === 'inbox' ||
              m.state?.id === mailEnumToState[MailEnum.UNASSIGNED]
            );
          } else if (['sent', 'drafts', 'spam', 'trash'].includes(view)) {
            return m.folder === view;
          } else if (
            [
              'open',
              'closed',
              'attention',
              'pendding',
              'noWish',
              'unassigned',
            ].includes(view)
          ) {
            return m.state?.id === mailEnumToState[view];
          } else {
            return true;
          }
        });

        this.mails.set(filtered);
      },
      error: (err) => console.error('❌ Error cargando mensajes', err),
    });
  }

  setView(view: MailType) {
    this.selectedMail.set(null);
    this.router.navigate([this.originalRoute], {
      queryParams: { view },
    });
  }

  sendMail() {
    if (!this.replyTo || !this.replySubject || !this.replyText) {
      alert('Completa Para, Asunto y Cuerpo');
      return;
    }

    // Crear FormData
    const formData = new FormData();
    formData.append('to', this.replyTo.trim()); // backend espera string, él mismo convierte en array
    formData.append('subject', this.replySubject);
    formData.append('content', this.replyText);
    formData.append('mailAttentionId', ''); // vacío por ahora

    // Si tuvieras adjuntos:
    // for (let file of this.attachments) {
    //   formData.append('attachments', file, file.name);
    // }

    this.mailService.sendEmailCenter(formData).subscribe({
      next: (res) => {
        alert('Correo enviado');
        this.cancelReply();
        this.loadMails();
      },
      error: (err) => {
        console.error('Error al enviar', err);
        alert('Error al enviar el correo');
      },
    });
  }

  replyMode: 'reply' | 'compose' | 'forward' | null = null;
  replyTarget: 'CIUDADANO' | 'Interno' | null = null;
  replyTo = '';
  replySubject = '';

  startReply() {
    this.replyMode = 'reply';
    this.replyText = '';
  }

  startReplyTo(reply: Reply, target: 'CIUDADANO' | 'Interno') {
    this.replyMode = 'reply';
    this.replyText = '';
    this.replyingTo = this.selectedMail();
    this.replyTarget = target;
  }

  startCompose() {
    console.log('startCompose');
    this.replyMode = 'compose';
    this.replyText = '';
    const mail = this.selectedMail();
    // Aquí depende si quieres responder al remitente o a otro campo
    this.replyTo = mail ? mail.from : '';
    this.replySubject = '';
  }

  handleSend() {
    switch (this.replyMode) {
      case 'reply':
        this.sendReply();
        break;
      case 'compose':
        this.sendMail();
        break;
      case 'forward':
        this.sendForward();
        break;
      default:
        console.warn('Modo de envío no reconocido');
    }
  }

  sendReply() {
    if (!this.replyText.trim() || !this.selectedMail()) return;

    const mailId = this.selectedMail()?.mailAttentionId;
    if (!mailId) return;

    // 🚫 ya no mandamos this.replyTarget al backend
    this.mailService.replyEmail(mailId, this.replyText).subscribe({
      next: (res) => {
        console.log('✅ Respuesta guardada en backend:', res);

        this.replyText = '';
        this.attachments = [];
        this.isReplying = false;
        this.replyTarget = null;
        this.cancelReply();
      },
      error: (err) => {
        console.error('❌ Error enviando reply', err);
      },
    });
  }

  cancelReply() {
    this.replyMode = null;
    this.replyText = '';
    this.replyTo = '';
    this.replySubject = '';
  }

  reply(mail?: Mail) {
    const targetMail = mail || this.selectedMail();
    if (!targetMail) return;

    this.replyingTo = targetMail;
    this.composeVisible.set(true);
    this.composeForm.reset({
      to: targetMail.from,
      subject: `Re: ${targetMail.subject}`,
      body: '',
    });
  }

  getLastMessage(mail: any): string {
    let raw: string | undefined;

    if (mail?.replies && mail.replies.length > 0) {
      raw = mail.replies[mail.replies.length - 1]?.body as string;
    } else if (mail?.body) {
      raw = mail.body as string;
    } else if (mail?.content) {
      raw = mail.content as string;
    }

    if (!raw) {
      return '(sin contenido)';
    }

    // Quitar etiquetas HTML si existen y cortar a 100 caracteres
    return raw.replace(/<[^>]*>/g, '').slice(0, 100) || '(sin contenido)';
  }

  getSafeContent(body?: string | null): SafeHtml {
    // 🔹 Si viene vacío, devolvemos un fallback claro
    if (!body || body.trim() === '') {
      return this.sanitizer.bypassSecurityTrustHtml('<i>(sin contenido)</i>');
    }

    // 🔹 Limpiamos el contenido antes de confiarlo
    const cleaned = this.cleanBody(body);

    // 🔹 Retornamos como HTML seguro
    return this.sanitizer.bypassSecurityTrustHtml(cleaned);
  }

  cleanBody(raw: string): string {
    if (!raw) return '(sin contenido)';

    let cleaned = raw;

    // Patrones que no quieres mostrar
    const unwantedPatterns = [/Libre\s+de\s+virus.*avast\.com/gi, /<#.*?>/g];

    unwantedPatterns.forEach((pattern) => {
      cleaned = cleaned.replace(pattern, '');
    });

    // 👇 Quitar solo ">" que estén solos en la línea (dejando espacios o salto)
    cleaned = cleaned.replace(/^>\s*$/gm, '');

    return cleaned.trim() || '(sin contenido)';
  }

  safeBody: SafeHtml = '';

  setBody(content: string) {
    this.safeBody = this.sanitizer.bypassSecurityTrustHtml(content);
  }

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  attachFile() {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      Array.from(input.files).forEach((file) => {
        const newAttachment = {
          file,
          name: file.name,
          size: file.size,
          progress: 0,
        };

        this.attachments.push(newAttachment);

        // Simular carga con progreso
        this.simulateUpload(newAttachment);
      });

      // Reset del input (para poder volver a elegir el mismo archivo)
      input.value = '';
    }
  }

  removeAttachment(index: number) {
    this.attachments.splice(index, 1);
  }

  simulateUpload(fileObj: any) {
    const interval = setInterval(() => {
      if (fileObj.progress >= 100) {
        fileObj.progress = 100; // aseguramos que quede exacto
        clearInterval(interval);
      } else {
        fileObj.progress += 10;
      }
    }, 300);
  }

  toggleFormatBar() {
    this.formatBarVisible = !this.formatBarVisible;
  }

  openInsertLink() {
    const text = prompt('Escribe el texto que se mostrará:');
    if (!text) return;

    const url = prompt('Escribe la URL del enlace:');
    if (!url) return;

    // Agregamos el link en formato HTML
    const link = `<a href="${url}" target="_blank" rel="noopener noreferrer">${text}</a>`;

    // Insertamos en el replyText
    this.replyText += ' ' + link;
  }

  signature: string = ``;

  insertSignature() {
    // Si usas <textarea>
    this.replyText += this.signature;

    // Si en algún momento usas p-editor o ngx-quill:
    // puedes setear directamente el contenido HTML también
  }

  formatSize(bytes: number) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  toggleFormatting() {
    this.showFormatting = !this.showFormatting;
  }

  // Buscador
  searchQuery = signal('');

  // 👉 Saber si hay correos seleccionados
  get hasSelection(): boolean {
    return this.filteredMails.filter((item) => item.selected).length != 0;
  }

  toggleStar(mail: Mail) {
    mail.starred = !mail.starred;
    this.mails.set([...this.mails()]);
  }

  toggleRead(mail: Mail) {
    mail.read = !mail.read;
    this.mails.set([...this.mails()]);
  }

  /** 🔄 Refrescar mensajes (simulado, aquí iría tu servicio al backend) */
  refreshMessages() {
    console.log('🔄 Refrescando mensajes...');
    // Ejemplo: this.mailService.getMessages().subscribe(...)
  }

  /** ☰ Abrir/cerrar menú */
  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  // Estado del redactor
  composeVisible = signal(false);

  // Formulario de redacción
  composeForm: FormGroup = this.fb.group({
    to: [''],
    cc: [''],
    bcc: [''],
    subject: [''],
    body: [''],
  });

  sendItems = [];

  // Abrir/cerrar redactor
  openCompose() {
    this.composeVisible.set(true);
  }

  sendMenuOpen = signal(false);

  toggleSendMenu() {
    this.sendMenuOpen.update((v) => !v);
  }

  scheduleSend() {
    console.log('⏰ Programar envío');
    this.sendMenuOpen.set(false);
  }

  /** Seleccionar/deseleccionar todos */
  selectAll() {
    this.mails.update((mails) =>
      mails.map((m) => ({ ...m, selected: this.allSelected }))
    );

    // 🔜 En el futuro esto vendría del backend:
    // this.messages.forEach(m => m.selected = this.allSelected);
  }

  /** Seleccionar/deseleccionar un correo */
  toggleSelect(mail: Mail) {
    this.mails.update((mails) =>
      mails.map((m) => (m.id === mail.id ? { ...m, selected: !m.selected } : m))
    );

    // 🔜 Futuro:
    // const msg = this.messages.find(m => m.id === mail.id);
    // if (msg) msg.selected = !msg.selected;
  }

  /** Poner correos seleccionados en Atención */
  attentionSelected() {
    const mailAttentionIds = this.selectedMail()
      ? [this.selectedMail()?.mailAttentionId!]
      : this.mails()
          .filter((m) => m.selected && m.mailAttentionId)
          .map((item) => item.mailAttentionId!);

    if (mailAttentionIds.length === 0) {
      console.warn('⚠️ No hay correos seleccionados para poner en atención');
      return;
    }

    mailAttentionIds.forEach((id) => {
      this.mailService.attentionTicket(id).subscribe({
        next: () => {
          this.mails.update((mails) =>
            mails.map((m) =>
              m.mailAttentionId === id ? { ...m, status: 'attention' } : m
            )
          );
        },
        error: (err) => {
          console.error(`❌ Error poniendo en atención el ticket ${id}`, err);
        },
      });
    });
  }

  /** Marcar correos seleccionados como No Wish */
  noWishSelected() {
    const mailAttentionIds = this.selectedMail()
      ? [this.selectedMail()?.mailAttentionId!]
      : this.mails()
          .filter((m) => m.selected && m.mailAttentionId)
          .map((item) => item.mailAttentionId!);

    if (mailAttentionIds.length === 0) {
      console.warn('⚠️ No hay correos seleccionados para marcar como No Wish');
      return;
    }

    mailAttentionIds.forEach((id) => {
      this.mailService.noWishTicket(id).subscribe({
        next: () => {
          this.mails.update((mails) =>
            mails.map((m) =>
              m.mailAttentionId === id ? { ...m, status: 'noWish' } : m
            )
          );
        },
        error: (err) => {
          console.error(`❌ Error marcando como No Wish el ticket ${id}`, err);
        },
      });
    });
  }

  /** Cerrar correos seleccionados */
  closeSelected() {
    const ref = this.dialogService.open(FormAssistanceComponent, {
      header: 'Registro de Atención',
      styleClass: 'modal-lg',
      modal: true,
      data: {
        communicationId: this.selectedMail()?.id,
      },
      focusOnShow: false,
      dismissableMask: false,
      closable: true,
    });

    ref.onClose.subscribe((res) => {
      if (res) {
        const mailAttentionIds = this.selectedMail()
          ? [this.selectedMail()?.mailAttentionId!]
          : this.mails()
              .filter((m) => m.selected)
              .map((item) => item.mailAttentionId!);

        this.mailService.closeMultipleTicket(mailAttentionIds).subscribe({
          next: () => {
            this.loadMails();
          },
          error: (err) => {
            console.error(`❌ Error cerrando tickets ${mailAttentionIds}`, err);
          },
        });
      }
    });
  }

  deleteSelected() {
    this.mails.update((mails) =>
      mails.map((m) =>
        m.selected ? { ...m, folder: 'trash', selected: false } : m
      )
    );
  }

  markAsRead(all: boolean = false) {
    this.mails.update((mails) =>
      mails.map((m) => (all || m.selected ? { ...m, read: true } : m))
    );
  }

  moveMenuOpen = false;

  /** Mover correos seleccionados a una carpeta */
  moveSelected(folder: Mail['folder']) {
    console.log('📂 Moviendo a:', folder);
    this.mails.update((mails) =>
      mails.map((m) => (m.selected ? { ...m, folder, selected: false } : m))
    );
  }

  /** Archivar correos seleccionados */
  archiveSelected() {
    this.moveSelected('drafts');
  }

  /** Marcar como spam */
  markAsSpam() {
    this.moveSelected('spam');
  }

  /** Aplicar selección según opción del menú */
  applySelection(
    option:
      | 'all'
      | 'none'
      | 'read'
      | 'unread'
      | 'starred'
      | 'unstarred'
      | 'open'
      | 'attention'
      | 'closed'
      | 'unassigned'
  ) {
    this.mails.update((mails) =>
      mails.map((m) => {
        switch (option) {
          case 'all':
            return { ...m, selected: true };
          case 'none':
            return { ...m, selected: false };
          case 'read':
            return { ...m, selected: m.read };
          case 'unread':
            return { ...m, selected: !m.read };
          case 'starred':
            return { ...m, selected: m.starred };
          case 'unstarred':
            return { ...m, selected: !m.starred };
          // case 'open':
          //   return { ...m, selected: m.status === 'open' };
          // case 'closed':
          //   return { ...m, selected: m.status === 'closed' };
          // case 'unassigned':
          //   return { ...m, selected: m.status === 'unassigned' };
          default:
            return m;
        }
      })
    );

    this.selectMenuOpen = false; // cerrar el menú después de seleccionar
  }

  setSelectedAt(index: number, checked: boolean) {
    this.mails.update((mails) => {
      const copy = [...mails];
      const m = copy[index];
      if (!m) return mails;
      copy[index] = { ...m, selected: checked };
      return copy;
    });

    // opcional: sincroniza el estado del botón "Seleccionar todos"
    this.allSelected =
      this.mails().length > 0 && this.mails().every((m) => m.selected);
  }

  /** Seleccionar un correo para verlo */
  selectMail(mail: Mail) {
    this.selectedMail.set(mail);

    // 🔹 Pedir el detalle actualizado
    this.mailService.getMessageDetail(mail.id).subscribe((detail) => {
      const messageDetail = Array.isArray(detail) ? detail[0] : detail;

      if (messageDetail) {
        this.selectedMail.set({
          ...mail,
          body: this.cleanBody(
            messageDetail?.content || messageDetail?.body || '(sin contenido)'
          ),
          replies: messageDetail?.replies || [],
        });
      }
    });
  }

  /** Volver a la lista */
  backToList() {
    this.selectedMail.set(null);
  }

  isDetailsOpen = false;

  toggleDetails() {
    this.isDetailsOpen = !this.isDetailsOpen;
  }

  openReactions() {
    console.log('😀 Abrir reacciones');
  }

  openMore() {
    console.log('⋮ Más opciones');
  }

  minimized = false;

  toggleMinimize(event: Event) {
    event.stopPropagation();
    this.minimized = !this.minimized;
  }

  closeCompose() {
    this.composeVisible.set(false);
    this.minimized = false;
  }

  showMoreDetail = false;

  toggleMoreDetail() {
    this.showMoreDetail = !this.showMoreDetail;
  }

  linkText = '';
  linkUrl = '';
  showLinkDialog = false;

  linkForm = new FormGroup({
    linkText: new FormControl(''),
    linkUrl: new FormControl(''),
  });

  closeLinkDialog() {
    this.showLinkDialog = false;
  }

  insertLink(bodyEditor: HTMLElement) {
    const linkText = this.linkForm.value.linkText || '';
    const linkUrl = this.linkForm.value.linkUrl || '';
    if (!linkUrl) return;

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);

    const a = document.createElement('a');
    a.href = linkUrl;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.textContent = linkText || linkUrl;

    range.deleteContents();
    range.insertNode(a);

    range.setStartAfter(a);
    range.setEndAfter(a);
    selection.removeAllRanges();
    selection.addRange(range);

    this.updateBody(bodyEditor.innerHTML);
    this.closeLinkDialog();
  }

  updateBody(html: string) {
    this.composeForm.get('body')?.setValue(html);
  }

  // Cambiar estado (open <-> closed)
  toggleStatus(mail: Mail) {
    // mail.status = mail.status === 'open' ? 'closed' : 'open';
    this.mails.set([...this.mails()]);
  }

  // Acciones de botones
  assignAdvisor(mail: Mail) {
    console.log('👤 Asignar ASESOR a:', mail);
    // Aquí podrías abrir un modal o lista de ASESORes
  }

  openDetails(mail: Mail) {
    console.log('📄 Ver detalles de:', mail);
    this.selectMail(mail);
  }

  /** Abrir/cerrar menú de acciones (⋮) */
  toggleMore(mail: Mail) {
    this.mails.update((mails) =>
      mails.map(
        (m) =>
          m.id === mail.id
            ? { ...m, showMore: !m.showMore }
            : { ...m, showMore: false } // cierra otros menús
      )
    );
  }

  onDeleteMail(mail: Mail) {
    console.log('🗑 Eliminar:', mail.subject);
    this.mails.update((mails) => mails.filter((m) => m.id !== mail.id));
  }

  startForwardCompose() {
    const mail = this.selectedMail();
    if (!mail) {
      alert('No hay correo seleccionado para reenviar');
      return;
    }

    this.isForwardMode = true;
    this.forwardTo = ''; // lo escribe el usuario
    this.forwardSubject = mail.subject;
    this.forwardText = mail.body;
    this.forwardBody = '';
    this.forwardFrom = mail.from;
    this.forwardMailAttentionId = mail.mailAttentionId ?? null;
  }

  sendForward() {
    if (!this.forwardTo.trim() || !this.forwardMailAttentionId) {
      alert('Falta el destinatario o el ID del correo para reenviar');
      return;
    }

    const fullBody = `
    ${this.forwardBody}

    ---------- Reenvío Interno ----------
    De: ${this.forwardFrom}
    Asunto: ${this.forwardSubject}
    -------------------------------------
    ${this.selectedMail()?.body || '(sin contenido)'}
      `;

    // Solo enviamos lo que el backend necesita
    const payload: ForwardCenterMail = {
      mailAttentionId: this.forwardMailAttentionId,
      from: this.forwardTo,
      message: this.forwardBody,
    };

    this.mailService.forwardEmail(payload).subscribe({
      next: (res) => {
        console.log('✅ Correo reenviado:', res);

        const newForward: Reply = {
          id: Date.now(),
          from: 'demo.correo.sat@gmail.com',
          body: fullBody, // guardamos todo en historial
          date: new Date(),
          attachments: this.attachments.map((a) => ({
            name: a.name,
            size: a.size,
            url: URL.createObjectURL(a.file),
          })),
          type: 'REENVIO_INTERNO',
        };

        // actualizar lista global y seleccionado
        const updatedMails = this.mails().map((mail) =>
          mail.mailAttentionId === this.forwardMailAttentionId
            ? { ...mail, replies: [...(mail.replies || []), newForward] }
            : mail
        );
        this.mails.set(updatedMails);

        const current = this.selectedMail();
        if (current) {
          this.selectedMail.set({
            ...current,
            replies: [...(current.replies || []), newForward],
          });
        }

        this.cancelForward();
      },
      error: (err) => {
        console.error('❌ Error reenviando correo', err);
      },
    });
  }

  cancelForward() {
    this.forwardTo = '';
    this.forwardSubject = '';
    this.forwardText = '';
    this.attachments = [];
    this.isForwardMode = false;
    this.forwardMailAttentionId = null;
  }

  /** Rebalancear carga de correos */
  rebalance() {
    this.mailService.rebalanceAdvisors().subscribe({
      next: (res) => {
        console.log('🔄 Rebalanceo completado', res);
        this.msg.success('Correos re-balanceados entre asesores');
        this.loadMails(); // opcional refrescar
      },
      error: (err) => {
        console.error('❌ Error en rebalanceo', err);
        this.msg.error(err?.error?.message);
      },
    });
  }

  /** Cargar tickets por ASESOR */
  loadTicketsByAdvisor(advisorId: number) {
    const query = { advisorEmailId: advisorId }; // 👈 usar el nombre correcto
    this.mailService.getTicketsByAdvisor(query).subscribe({
      next: (res: MailDto[]) => {
        console.log('🎯 Tickets del ASESOR', res);
        this.mails.set(res.map((item) => this.mapMail(item)));
      },
      error: (err) => console.error('❌ Error obteniendo tickets', err),
    });
  }

  /** Cargar mensajes abiertos por ASESOR */
  loadOpenMessagesByAdvisor(advisorId: number) {
    const query = { advisorId };
    this.mailService.getMessagesAdvisorOpen(query).subscribe({
      next: (res: MailDto[]) => {
        console.log('📬 Correos abiertos del ASESOR', res);
        this.mails.set(res.map((item) => this.mapMail(item)));
      },
      error: (err) => console.error('❌ Error obteniendo abiertos', err),
    });
  }

  modifySignature() {
    const ref = this.dialogService.open(FormSignatureComponent, {
      header: 'Firma personal',
      styleClass: 'modal-lg',
      focusOnShow: false,
      dismissableMask: false,
      draggable: true,
      closable: true,
    });

    ref.onClose.subscribe((res) => {
      if (res) {
        this.loadSignature();
      }
    });
  }
}
