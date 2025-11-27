import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GenericCrudService } from '@services/generic/generic-crud.service';
import { Observable } from 'rxjs';
import { Reminder } from '@models/reminder.model';
import { IBaseResponseDto } from '@interfaces/commons/base-response.interface';

@Injectable({
  providedIn: 'root',
})
export class ReminderService extends GenericCrudService<Reminder> {
  constructor(http: HttpClient) {
    super(http, 'reminders');
  }

  findAllByuserId(): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}`);
  }

  markRemindersAsRead(reminderIds: number[]): Observable<IBaseResponseDto> {
    return this.http.put<IBaseResponseDto>(`${this.url}/mark-all-read`, {reminderIds});
  }
}
