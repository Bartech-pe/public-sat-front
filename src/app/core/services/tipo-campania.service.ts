import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GenericCrudService } from '@services/generic/generic-crud.service';
import { TipoCampania } from '@models/tipo-campania.model';

@Injectable({
  providedIn: 'root',
})
export class TipoCampaniaService extends GenericCrudService<TipoCampania> {
  constructor(http: HttpClient) {
    super(http, 'tipo-campania');
  }
}