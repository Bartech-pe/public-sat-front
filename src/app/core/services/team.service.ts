import { Injectable } from '@angular/core';
import { GenericCrudService } from '@services/generic/generic-crud.service';
import { HttpClient } from '@angular/common/http';
import { Team } from '@models/team.model';

@Injectable({
  providedIn: 'root'
})
export class TeamService extends GenericCrudService<Team> {
  constructor(http: HttpClient) {
    super(http, 'teams');
  }
}
