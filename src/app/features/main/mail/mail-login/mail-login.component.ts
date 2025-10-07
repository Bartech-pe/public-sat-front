import { Component, OnInit } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button'; 
import { CommonModule } from '@angular/common';
import { AuthService } from '@services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { GmailService } from '@services/gmail.service';

@Component({
  selector: 'app-mail-login',
  standalone: true,
  imports: [
    DialogModule,
    ButtonModule,
    CommonModule
  ],
  templateUrl: './mail-login.component.html',
  styles: ``
})
export class MailLoginComponent {
 visible: boolean = false;
  provider: string = '';

  constructor(private gmailService: GmailService) {}

 

  loginWith(provider: string): void {
    switch (provider) {
      case 'google':
        window.location.href = 'http://localhost:3000/v1/mail';
        break;
      case 'outlook':
        window.location.href = 'https://login.live.com/';
        break;
      case 'yahoo':
        window.location.href = 'https://login.yahoo.com/';
        break;
      case 'sat':
        window.location.href = 'https://www.sunat.gob.pe/';
        break;
    }
    this.provider = provider;
    this.visible = true;
  }
}