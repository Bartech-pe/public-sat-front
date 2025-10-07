import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, inject, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { MessagesModule } from 'primeng/messages';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AuthStore } from '../../../core/stores/auth.store';
import { LoginRequest } from '@models/auth.model';

@Component({
  selector: 'app-login',
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    PasswordModule,
    CheckboxModule,
    ButtonModule,
    MessagesModule,
  ],
  templateUrl: './login.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  styles: ``,
})
export class LoginComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);

  readonly store = inject(AuthStore);

  formData = new FormGroup({
    email: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    rememberMe: new FormControl<boolean>(false, {
      nonNullable: true,
    }),
  });

  returnUrl!: string;

  get invalid(): boolean {
    return !this.formData.valid;
  }

  get loading(): boolean {
    return this.store.loading();
  }

  get error(): string | null {
    return this.store.error();
  }

  ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  onSubmit() {
    this.store.login(this.formData.value as LoginRequest, this.returnUrl);
  }
}
