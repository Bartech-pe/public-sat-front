import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GenericCrudService } from '@services/generic/generic-crud.service';
import { Cartera } from '@models/cartera.model';

@Injectable({
  providedIn: 'root',
})
export class CarteraService extends GenericCrudService<Cartera> {
  constructor(http: HttpClient) {
    super(http, 'cartera');
  }
}
