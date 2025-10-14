import { HttpClient } from '@angular/common/http';
import { environment } from '@envs/environments';
import { PaginatedResponse } from '@interfaces/paginated-response.interface';
import { Observable } from 'rxjs';

export class GenericCrudService<T> {
  protected readonly url!: string;

  constructor(protected http: HttpClient, endpoint: string) {
    this.url = `${environment.apiUrl}v1/${endpoint}`;
  }

  getAll(
    limit?: number,
    offset?: number,
    q?: Record<string, any>
  ): Observable<PaginatedResponse<T>> {
    const query = q ? `q=${encodeURIComponent(JSON.stringify(q))}` : '';
    const limitQ = limit ? `limit=${limit}&` : '';
    const offsetQ = limit ? `offset=${offset}&` : '';
    return this.http.get<PaginatedResponse<T>>(
      `${this.url}?${limitQ}${offsetQ}${query}`
    );
  }

  getByIdDetalle(id: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}/detail/${id}`);
  }

  findOne(id: number, q?: string): Observable<T> {
    return this.http.get<T>(`${this.url}/${id}`);
  }

  create(dto: Partial<T>): Observable<T> {
    // const formData = toFormData(dto);
    return this.http.post<T>(this.url, dto);
  }

  assignment(
    id: number,
    dto: Partial<T>[],
    q?: Record<string, any>
  ): Observable<T[]> {
    const query = q ? `?q=${encodeURIComponent(JSON.stringify(q))}` : '';
    return this.http.post<T[]>(`${this.url}/assignment/${id}${query}`, dto);
  }

  update(id: number, dto: Partial<T>): Observable<T> {
    // const formData = toFormData(dto);
    return this.http.patch<T>(`${this.url}/${id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }

  // Métodos opcionales específicos
  toggleStatus?(id: number): Observable<any> {
    return this.http.get<T>(`${this.url}/toggleStatus/${id}`);
  }

  obtenerArchivo?(id: number): Observable<Blob> {
    return this.http.get(`${this.url}/getFile/${id}`, {
      responseType: 'blob',
    });
  }
}
