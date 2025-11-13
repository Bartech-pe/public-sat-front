import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GenericCrudService } from '@services/generic/generic-crud.service';
import { MensajeAutomatico } from '@models/mensaje-automatico.model';

@Injectable({
  providedIn: 'root',
})
export class MensajeAutomaticoService extends GenericCrudService<MensajeAutomatico> {
  constructor(http: HttpClient) {
    super(http, 'mensaje-automatico');
  }
}
