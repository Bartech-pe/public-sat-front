import { Injectable } from '@angular/core';
import { GenericCrudService } from '@services/generic/generic-crud.service';
import { HttpClient } from '@angular/common/http';
import { Area } from '@models/area.model';
import { ScheduleAssignment } from '@models/schedule-assignment.model';

@Injectable({
  providedIn: 'root',
})
export class ScheduleAssignmentService extends GenericCrudService<ScheduleAssignment> {
  constructor(http: HttpClient) {
    super(http, 'scheduleAssignment');
  }
}
