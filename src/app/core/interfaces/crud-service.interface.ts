import { Observable } from 'rxjs';
import { PaginatedResponse } from './paginated-response.interface';

export interface CrudService<T> {
  getAll(
    limit?: number,
    offset?: number,
    q?: Record<string, any>
  ): Observable<PaginatedResponse<T>>;
  findOne(id: number | string, query?: string): Observable<T>;
  getByIdDetalle(id: number | string, query?: string): Observable<T[]>;
  create(data: Partial<T>): Observable<T>;
  assignment(
    id: number | string,
    data: any[],
    q?: Record<string, any>
  ): Observable<T[]>;
  toggleStatus(id: string | number): Observable<T>;
  update(id: number | string, data: Partial<T>): Observable<T>;
  delete(id: number | string): Observable<void>;
}
