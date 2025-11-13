import { Component, signal, computed, ViewChild, ElementRef, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { GmailService } from '@services/gmail.service';
import { Router } from '@angular/router';
import { OverlayPanel } from 'primeng/overlaypanel';
import { PickerModule } from '@ctrl/ngx-emoji-mart';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { EditorModule } from 'primeng/editor';
import { MailService } from '@services/mail.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { AuthService } from '@services/auth.service';

interface Mail {
  id: number;
  mailAttentionId?: number;
  from: string;
  to: string;
  subject: string;
  body: string; 
  date: Date | null;
  starred: boolean;
  read: boolean;
  hasAttachment?: boolean;
  sizeMB?: number;
  folder: 'inbox' | 'sent' | 'drafts' | 'spam' | 'trash';
  selected?: boolean;

  // Campos nuevos
  advisor?: string;
  status?: 'open' | 'close' | 'unassigned';
  showMore?: boolean;
  replies?: Reply[];
  closed?: boolean;
  deleted?: boolean;

  type: 'CIUDADANO' | 'REENVIO INTERNO' | 'ASESOR' | string; 
}

interface MailDto {
  id: number;
  from?: string;
  to?: string;
  subject?: string;
  content?: string;
  body?: string;
  date?: string;
  status?: 'open' | 'close' | 'unassigned';
  type?: 'CIUDADANO' | 'REENVIO INTERNO' | 'RESPUESTA' | string;
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

interface Reply {
  id: number;
  from: string;
  body: string;
  date: Date;
  type:'CIUDADANO' | 'ASESOR' | 'REENVIO INTERNO' | 'RESPUESTA INTERNA';
  replyTarget?: 'Ciudadano' | 'Interno';
  attachments?: {
    name: string;
    size: number;
    url: string;
  }[];
}

interface ForwardCenterMail {
  mailAttentionId: number;
  from: string;
}

function parseDate(date: any): Date | null {
  if (!date) return null;

  const parsed = new Date(date);
  return isNaN(parsed.getTime()) ? null : parsed;
}

@Component({
  selector: 'app-mail',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    ReactiveFormsModule, 
    PickerModule, 
    OverlayPanelModule,
    EditorModule
  ],
  templateUrl: './mail.component.html',
})
export class MailComponent {

  private mapMail(item: any): Mail {
    return {
      id: item.id,
      mailAttentionId: item.mailAttentionId,
      from: item.from || 'Desconocido',
      to: item.to || '',
      subject: item.subject || '(sin asunto)',
      body: item.body || item.content || '',   // 👈 acepta ambos
      date: parseDate(item.date),
      starred: false,
      read: false,
      folder: 'inbox',
      sizeMB: 1,
      selected: false,
      advisor: '',
      status: (item.open ? 'open' : 'close'),
      showMore: false,
      type: item.type || 'CIUDADANO',  // 👈 agrega esto
      replies: (item.replies || []).map((r: any) => ({
        id: r.id,
        from: r.from,
        body: r.body || r.content || '',       
        date: parseDate(r.date) || new Date(),
        type: (r.type as Reply['type']) || 'Ciudadano' // valor por defecto
      }))
    };
  }


  trackById(index: number, reply: Reply) {
    return reply.id;
  }
  
  private fb = new FormBuilder();
  constructor(
    private authService: AuthService,
    private gmailService: GmailService,
    private mailService: MailService,
    private router: Router,
    private sanitizer: DomSanitizer
  ) {}

  isSupervisor = false;

  menuOpen = false;
  selectMenuOpen = false;
  allSelected = true;

  showLoginMessage = false;

  replyingTo: Mail | null = null;
  isReplying = false;

  isForwardMode = false;
  forwardTo = '';
  forwardSubject = '';
  forwardText = '';
  forwardFrom = '';
  forwardMailAttentionId: number | null = null;

  formatBarVisible = false;
  showFormatting = false;

  filterVisible = signal(false);
  selectedMail = signal<Mail | null>(null);

  currentView = signal<'inbox' | 'sent' | 'drafts' | 'spam' | 'trash' | 'open' | 'close' | 'unassigned'>('inbox');

  replyText = '';
  attachments: any[] = []; // 👈 inicializa tus adjuntos aquí

  addReply() {
    if (!this.replyText.trim()) return;

    const reply: Reply = {
      id: Date.now(), // id temporal
      from: 'demo.correo.sat@gmail.com', 
      body: this.replyText,
      date: new Date(),
      attachments: this.attachments.map(a => ({
        name: a.name,
        size: a.size,
        url: URL.createObjectURL(a.file)
      })),
      type: 'ASESOR' 
    };

    const current = this.selectedMail();
    if (current) {
      current.replies = [...(current.replies || []), reply];
      this.selectedMail.set({ ...current });
    }

    // limpiar el editor de respuesta
    this.replyText = '';
    this.attachments = [];
    this.isReplying = false;
  }


  ngOnInit() {
    console.log('📩 Inicializando componente de correo');

    this.mailService.getMessages().subscribe({
      next: (res: any[]) => {
        console.log('📥 Mensajes recibidos:', res);

        const mapped = res.map(item => this.mapMail(item));
        this.mails.set(mapped);
      },
      error: (err) => {
        console.error('❌ Error al obtener mensajes', err);
      }
    });
  }


  openMail(mail: Mail) {
    const id = mail.mailAttentionId;
    if (!id) return;

    this.selectedMail.set(mail);

    this.mailService.getMessageDetail(id).subscribe({
      next: (detail: any[]) => {
        if (!detail || detail.length === 0) return;

        // Convertimos todo en un hilo de mensajes
        const thread: Reply[] = detail.map(d => ({
          id: d.id,
          from: d.from,
          body: d.content || d.body || '',
          date: new Date(d.date),
          attachments: d.files || [],
          type: (d.type as Reply['type']) || 'Ciudadano' // <--- aquí también
        }));

        this.selectedMail.set({
          ...mail,
          body: thread[0]?.body || '(sin contenido)',
          replies: thread.slice(1) // 👈 los demás son respuestas
        });
      }
    });
  }

  getReplyClass(reply: Reply) {
    switch(reply.type) {
      case 'CIUDADANO': return 'bg-green-50 border-green-300';
      case 'ASESOR': return 'bg-blue-50 border-blue-300';
      case 'REENVIO INTERNO': return 'bg-yellow-50 border-yellow-300';
      case 'RESPUESTA INTERNA': return 'bg-purple-50 border-purple-300';
      default: return 'bg-gray-50 border-gray-200';
    }
  }

  get canSeeSupervisorBlock(): boolean {
    return this.authService.hasRole(['supervisor', 'administrador']);
  }

  connectAccount() {
    this.gmailService.loginWithGoogle();
  }

  mails = signal<Mail[]>([]);

  loadMails() {
    const user = this.authService.getUser();

    // Si es asesor, carga sus tickets + los no asignados
    if (this.authService.hasRole(['asesor']) && user?.id) {
      this.mailService.getTicketsByAdvisor(user.id).subscribe({
        next: (assigned: MailDto[]) => {
          this.mailService.getMessagesNoAdvisor().subscribe({
            next: (unassigned: MailDto[]) => {
              const all = [...assigned, ...unassigned];
              const mapped = all.map(item => this.mapMail(item));

              const filtered = mapped.filter(m => {
                const view = this.currentView();
                if (view === 'inbox') {
                  return m.folder === 'inbox' || m.status === 'unassigned';
                }
                if (['sent', 'drafts', 'spam', 'trash'].includes(view)) {
                  return m.folder === view;
                }
                if (['open', 'close'].includes(view)) {
                  return m.status === view;
                }
                return true;
              });

              this.mails.set(filtered);
            },
            error: err => console.error('❌ Error obteniendo correos sin asignar', err)
          });
        },
        error: err => console.error('❌ Error obteniendo tickets por asesor', err)
      });
      return;
    }

    // Si es admin o supervisor, carga todos los mensajes
    this.mailService.getMessages().subscribe({
      next: (res: MailDto[]) => {
        const mapped = res.map(item => this.mapMail(item));

        const filtered = mapped.filter(m => {
          const view = this.currentView();
          if (view === 'inbox') {
            return m.folder === 'inbox' || m.status === 'unassigned';
          }
          if (['sent', 'drafts', 'spam', 'trash'].includes(view)) {
            return m.folder === view;
          }
          if (['open', 'close'].includes(view)) {
            return m.status === view;
          }
          return true;
        });

        this.mails.set(filtered);
      },
      error: err => console.error('❌ Error cargando mensajes', err)
    });
  }


  setView(view: 'inbox'|'sent'|'drafts'|'spam'|'trash'|'open'|'close'|'unassigned') {
    this.currentView.set(view);
    this.loadMails();
  }

  sendMail() {
    if (!this.replyTo || !this.replySubject || !this.replyText) {
      alert('Completa Para, Asunto y Cuerpo');
      return;
    }

    // Crear FormData
    const formData = new FormData();
    formData.append('to', this.replyTo.trim());  // backend espera string, él mismo convierte en array
    formData.append('subject', this.replySubject);
    formData.append('content', this.replyText);
    formData.append('mailAttentionId', ''); // vacío por ahora

    // Si tuvieras adjuntos:
    // for (let file of this.attachments) {
    //   formData.append('attachments', file, file.name);
    // }

    this.mailService.sendCenterEmail(formData).subscribe({
      next: res => {
        alert('Correo enviado');
        this.cancelReply();
        this.loadMails();
      },
      error: err => {
        console.error('Error al enviar', err);
        alert('Error al enviar el correo');
      }
    });
  }

  replyMode: 'reply' | 'compose' | 'forward' | null = null;
  replyTarget: 'Ciudadano' | 'Interno' | null = null;
  replyTo = '';
  replySubject = '';

  startReply() {
    this.replyMode = 'reply';
    this.replyText = '';
  }

  startReplyTo(reply: Reply, target: 'Ciudadano' | 'Interno') {
    this.replyMode = 'reply';
    this.replyText = '';
    this.replyingTo = this.selectedMail();
    this.replyTarget = target; 
  }

  startCompose() {
    this.replyMode = 'compose';
    this.replyText = '';
    this.replyTo = '';
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
        console.log("✅ Respuesta guardada en backend:", res);

        const newReply: Reply = {
          id: Date.now(),
          from: 'demo.correo.sat@gmail.com',
          body: this.replyText,
          date: new Date(),
          attachments: this.attachments.map(a => ({
            name: a.name,
            size: a.size,
            url: URL.createObjectURL(a.file)
          })),
          // 👇 usamos replyTarget solo para diferenciar
          type: 'ASESOR',
          replyTarget: this.replyTarget || 'Ciudadano'
        };

        const current = this.selectedMail();
        if (current) {
          this.selectedMail.set({
            ...current,
            replies: [...(current.replies || []), newReply]
          });
        }

        this.replyText = '';
        this.attachments = [];
        this.isReplying = false;
        this.replyTarget = null;
      },
      error: (err) => {
        console.error("❌ Error enviando reply", err);
      }
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
      body: ''
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
  const unwantedPatterns = [
    /Libre\s+de\s+virus.*avast\.com/gi,
    /<#.*?>/g
  ];

  unwantedPatterns.forEach(pattern => {
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
      Array.from(input.files).forEach(file => {
        const newAttachment = {
          file,
          name: file.name,
          size: file.size,
          progress: 0
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
  
  signature: string = `
    
    -- 
    Juan Pérez
    Asesor Comercial
    juan.perez@sat.pe
    SAT.
  `;

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
  searchQuery = signal<string>('');

  // 👉 Saber si hay correos seleccionados
  hasSelection = computed(() =>
    this.mails().some(mail => mail.selected)
  );

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
    body: ['']
  });

  // Abrir/cerrar redactor
  openCompose() {
    this.composeVisible.set(true);
  }

  sendMenuOpen = signal(false);

  toggleSendMenu() {
    this.sendMenuOpen.update(v => !v);
  }

  scheduleSend() {
    console.log("⏰ Programar envío");
    this.sendMenuOpen.set(false);
  }

  /** Seleccionar/deseleccionar todos */
  selectAll() {
    this.allSelected = !this.allSelected;
    this.mails.update(mails => mails.map(m => ({ ...m, selected: this.allSelected })));

    // 🔜 En el futuro esto vendría del backend:
    // this.messages.forEach(m => m.selected = this.allSelected);
  }

  /** Seleccionar/deseleccionar un correo */
  toggleSelect(mail: Mail) {
    this.mails.update(mails =>
      mails.map(m => m.id === mail.id ? { ...m, selected: !m.selected } : m)
    );

    // 🔜 Futuro:
    // const msg = this.messages.find(m => m.id === mail.id);
    // if (msg) msg.selected = !msg.selected;
  }

  /** Cerrar correos seleccionados */
  closeSelected() {
    const selected = this.mails().filter(m => m.selected);

    selected.forEach(mail => {
      if (!mail.mailAttentionId) {
        console.warn(`Mail ${mail.id} no tiene mailAttentionId`);
        return;
      }

      this.mailService.closeTicket(mail.mailAttentionId).subscribe({
        next: () => {
          // Actualizar estado local después de cerrar
          this.mails.update(mails =>
            mails.map(m =>
              m.mailAttentionId === mail.mailAttentionId ? { ...m, status: 'close' } : m
            )
          );
        },
        error: err => {
          console.error(`❌ Error cerrando ticket ${mail.mailAttentionId}`, err);
        }
      });
    });
  }


  deleteSelected() {
    this.mails.update(mails =>
      mails.map(m => m.selected ? { ...m, folder: 'trash', selected: false } : m)
    );
  }

  markAsRead(all: boolean = false) {
    this.mails.update(mails =>
      mails.map(m =>
        all || m.selected ? { ...m, read: true } : m
      )
    );
  }

  moveMenuOpen = false;

  /** Mover correos seleccionados a una carpeta */
  moveSelected(folder: Mail['folder']) {
    console.log("📂 Moviendo a:", folder);
    this.mails.update(mails =>
      mails.map(m =>
        m.selected ? { ...m, folder, selected: false } : m
      )
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
  applySelection(option: 'all' | 'none' | 'read' | 'unread' | 'starred' | 'unstarred' | 'open' | 'close'|'unassigned') {
  this.mails.update(mails =>
    mails.map(m => {
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
        case 'open':
          return { ...m, selected: m.status === 'open' };
        case 'close':
          return { ...m, selected: m.status === 'close' };
        case 'unassigned':
          return { ...m, selected: m.status === 'unassigned' };
        default:
          return m;
      }
    })
  );

    this.selectMenuOpen = false; // cerrar el menú después de seleccionar
  
  }

  setSelectedAt(index: number, checked: boolean) {
    this.mails.update(mails => {
      const copy = [...mails];
      const m = copy[index];
      if (!m) return mails;
      copy[index] = { ...m, selected: checked };
      return copy;
    });

    // opcional: sincroniza el estado del botón "Seleccionar todos"
    this.allSelected = this.mails().length > 0 && this.mails().every(m => m.selected);
  }

  /** Seleccionar un correo para verlo */
  selectMail(mail: Mail) {
    this.selectedMail.set(mail);

    // 🔹 Pedir el detalle actualizado
    this.mailService.getMessageDetail(mail.id).subscribe(detail => {
      const messageDetail = Array.isArray(detail) ? detail[0] : detail;

      if (messageDetail) {
        this.selectedMail.set({
          ...mail,
          body: this.cleanBody(
            messageDetail?.content || messageDetail?.body || '(sin contenido)'
          ),
          replies: messageDetail?.replies || []
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
    console.log("😀 Abrir reacciones");
  }

  openMore() {
    console.log("⋮ Más opciones");
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
    linkUrl: new FormControl('')
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
    a.target = "_blank";
    a.rel = "noopener noreferrer";
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
    this.composeForm.get("body")?.setValue(html);
  }

  openDetails(mail: Mail) {
    console.log("📄 Ver detalles de:", mail);
    this.selectMail(mail);
  }
  
  toggleMore(mail: Mail) {
    this.mails.update(mails =>
      mails.map(m =>
        m.id === mail.id
          ? { ...m, showMore: !m.showMore }
          : { ...m, showMore: false } // cierra otros menús
      )
    );
  }

  onDeleteMail(mail: Mail) {
    console.log("🗑 Eliminar:", mail.subject);
    this.mails.update(mails => mails.filter(m => m.id !== mail.id));
  }

  startForwardCompose() {
    const mail = this.selectedMail();
    if (!mail) {
      alert('No hay correo seleccionado para reenviar');
      return;
    }

    this.isForwardMode = true;
    this.forwardTo = '';
    this.forwardSubject = mail.subject;
    this.forwardText = '';
    this.forwardFrom = mail.from;
    this.forwardMailAttentionId = mail.mailAttentionId ?? null;
  }

  sendForward() {

      if (!this.forwardTo.trim() || !this.forwardMailAttentionId) {
        alert("Falta el destinatario o el ID del correo para reenviar");
        return;
      }

    const fullBody = `
    ${this.forwardText} 

    ---------- Reenvío Interno ----------
    De: ${this.forwardFrom}
    Asunto: ${this.forwardSubject}
    -------------------------------------
    ${this.selectedMail()?.body || '(sin contenido)'} 
    `;

      // Solo enviamos lo que el backend necesita
      const payload: ForwardCenterMail = {
        mailAttentionId: this.forwardMailAttentionId,
        from: this.forwardTo
      };

      this.mailService.forwardEmail(payload).subscribe({
        next: (res) => {
          console.log("✅ Correo reenviado:", res);

          const newForward: Reply = {
            id: Date.now(),
            from: 'demo.correo.sat@gmail.com',
            body: fullBody, // guardamos todo en historial
            date: new Date(),
            attachments: this.attachments.map(a => ({
              name: a.name,
              size: a.size,
              url: URL.createObjectURL(a.file)
            })),
            type: 'REENVIO INTERNO'
          };

          // actualizar lista global y seleccionado
          const updatedMails = this.mails().map(mail =>
            mail.mailAttentionId === this.forwardMailAttentionId
              ? { ...mail, replies: [...(mail.replies || []), newForward] }
              : mail
          );
          this.mails.set(updatedMails);

          const current = this.selectedMail();
          if (current) {
            this.selectedMail.set({
              ...current,
              replies: [...(current.replies || []), newForward]
            });
          }

          this.cancelForward();
        },
        error: (err) => {
          console.error("❌ Error reenviando correo", err);
        }
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
      next: res => {
        console.log('🔄 Rebalanceo completado', res);
        alert('Correos re-balanceados entre asesores');
        this.loadMails(); // opcional refrescar
      },
      error: err => console.error('❌ Error en rebalanceo', err)
    });
  }

  /** Cargar tickets por asesor */
  loadTicketsByAdvisor(advisorId: number) {
    const query = { advisorEmailId: advisorId }; // 👈 usar el nombre correcto
    this.mailService.getTicketsByAdvisor(query).subscribe({
      next: (res: MailDto[]) => {
        console.log('🎯 Tickets del asesor', res);
        this.mails.set(res.map(item => this.mapMail(item)));
      },
      error: err => console.error('❌ Error obteniendo tickets', err)
    });
  }

  /** Cargar mensajes abiertos por asesor */
  loadOpenMessagesByAdvisor(advisorId: number) {
    const query = { advisorId };
    this.mailService.getMessagesAdvisorOpen(query).subscribe({
      next: (res: MailDto[]) => {
        console.log('📬 Correos abiertos del asesor', res);
        this.mails.set(res.map(item => this.mapMail(item)));
      },
      error: err => console.error('❌ Error obteniendo abiertos', err)
    });
  }






  //provisional

  open = false; 
  selectedOption: string | null = null; 

  select(option: string) {
    this.selectedOption = option;
    this.open = false; 
  }



}
