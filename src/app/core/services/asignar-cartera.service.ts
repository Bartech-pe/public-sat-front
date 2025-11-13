import { Injectable } from '@angular/core';
import { GenericCrudService } from '@services/generic/generic-crud.service';
import { HttpClient } from '@angular/common/http';
import { AssignPortfolioDetalle } from '@models/assign-portfolio-detalle.model';

@Injectable({
  providedIn: 'root',
})
export class SkillService extends GenericCrudService<AssignPortfolioDetalle> {
  constructor(http: HttpClient) {
    super(http, 'assign-portfolio');
  }
}
