import { Injectable } from '@angular/core';
import { GenericCrudService } from '@services/generic/generic-crud.service';
import { Skill } from '@models/skill.model';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class SkillService extends GenericCrudService<Skill> {
  constructor(http: HttpClient) {
    super(http, 'skills');
  }
}
