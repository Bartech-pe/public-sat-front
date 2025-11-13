import { Injectable } from '@angular/core';
import { GenericCrudService } from '@services/generic/generic-crud.service';
import { HttpClient } from '@angular/common/http';
import { Oficina } from '@models/oficina.model';

@Injectable({
  providedIn: 'root',
})
export class OficinaService extends GenericCrudService<Oficina> {
  constructor(http: HttpClient) {
    super(http, 'oficinas');
  }
}
