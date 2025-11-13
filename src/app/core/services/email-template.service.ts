import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GenericCrudService } from '@services/generic/generic-crud.service';
import { EmailTemplate } from '@models/email-template.model';

@Injectable({
  providedIn: 'root',
})
export class EmailTemplateService extends GenericCrudService<EmailTemplate> {
  constructor(http: HttpClient) {
    super(http, 'email-templates');
  }
}
