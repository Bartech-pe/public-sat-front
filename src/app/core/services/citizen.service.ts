import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GenericCrudService } from '@services/generic/generic-crud.service';
import { Citizen, CitizenContact } from '@models/citizen.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CitizenService extends GenericCrudService<Citizen> {
  constructor(http: HttpClient) {
    super(http, 'citizens');
  }

  getCitizenContactsByTipDocAndDocId(
    tipDoc: string,
    docIde: string
  ): Observable<CitizenContact[]> {
    return this.http.get<CitizenContact[]>(
      `${this.url}/citizen-contacts/${tipDoc}/${docIde}`
    );
  }

  citizenContacts(dto: CitizenContact[]): Observable<CitizenContact[]> {
    return this.http.post<CitizenContact[]>(
      `${this.url}/citizen-contacts/multiple`,
      dto
    );
  }

  deleteContact(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/citizen-contacts/${id}`);
  }
}
