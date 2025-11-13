import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GenericCrudService } from '@services/generic/generic-crud.service';
import { PredefinedResponses } from '@models/predefined-response.model';

@Injectable({
  providedIn: 'root',
})
export class ReminderService extends GenericCrudService<PredefinedResponses> {
  constructor(http: HttpClient) {
    super(http, 'reminders');
  }
}
