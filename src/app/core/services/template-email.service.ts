import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GenericCrudService } from '@services/generic/generic-crud.service';
import { TemplateEmail } from '@models/template-email.model';

@Injectable({
  providedIn: 'root',
})
export class TemplateEmailService extends GenericCrudService<TemplateEmail> {

  constructor(http: HttpClient) {
    super(http, 'template-email');
  }
  
}
