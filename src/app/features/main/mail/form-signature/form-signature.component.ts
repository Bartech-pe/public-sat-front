import { CommonModule } from '@angular/common';
import { Component, effect, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EmailSignatureService } from '@services/email-signature.service';
import { MessageGlobalService } from '@services/generic/message-global.service';
import { ButtonCancelComponent } from '@shared/buttons/button-cancel/button-cancel.component';
import { ButtonSaveComponent } from '@shared/buttons/button-save/button-save.component';
import { AuthStore } from '@stores/auth.store';
import { EmailSignatureStore } from '@stores/email-signature.store';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { EditorModule } from 'primeng/editor';

@Component({
  selector: 'app-form-signature',
  imports: [
    CommonModule,
    FormsModule,
    EditorModule,
    ButtonSaveComponent,
    ButtonCancelComponent,
  ],
  templateUrl: './form-signature.component.html',
  styles: ``,
})
export class FormSignatureComponent implements OnInit {
  public readonly ref: DynamicDialogRef = inject(DynamicDialogRef);

  public readonly config = inject(DynamicDialogConfig);

  private readonly msg = inject(MessageGlobalService);

  readonly store = inject(EmailSignatureStore);

  readonly service = inject(EmailSignatureService);

  readonly authStore = inject(AuthStore);

  signature?: string;
  userId?: number;

  private resetOnSuccessEffect = effect(() => {
    const item = this.store.selectedItem();
    const error = this.store.error();
    const action = this.store.lastAction();

    // Manejo de errores
    if (error) {
      console.log('error', error);
      this.msg.error(
        error ?? '¡Ups, ocurrió un error inesperado al guardar el rol!'
      );
      return; // Salimos si hay un error
    }

    // Si se ha creado o actualizado correctamente
    if (action === 'created' || action === 'updated') {
      this.msg.success(
        action === 'created'
          ? '¡Firma creada exitosamente!'
          : '¡Firma actualizada exitosamente!'
      );

      this.store.clearSelected();
      this.ref.close(true);
      return;
    }
  });

  get loading(): boolean {
    return this.store.loading();
  }

  get invalid(): boolean {
    return !this.signature;
  }

  ngOnInit(): void {
    this.userId = this.authStore.user()?.id;
    this.service.findOneByTokenUserId().subscribe({
      next: (data) => {
        this.signature = data.content;
      },
    });
  }

  onCancel() {
    this.store.clearSelected();
    this.ref.close(false);
  }

  onSubmit() {
    this.store.create({ content: this.signature, userId: this.userId });
  }
}
