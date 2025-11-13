import {
  signalStore,
  withState,
  withMethods,
  patchState,
  withComputed,
} from '@ngrx/signals';
import { computed, inject } from '@angular/core';
import { tap } from 'rxjs'; // Define esta interfaz como arriba
import { CrudService } from '@interfaces/crud-service.interface';
import { PaginatedResponse } from '@interfaces/paginated-response.interface';

export interface EntityState<T> {
  totalItems: number;
  limit: number;
  offset: number;
  items: T[];
  itemsDetalle: any[];
  selectedItem: T | null;
  loading: boolean;
  error: string | null;
  lastAction:
    | 'created'
    | 'updated'
    | 'deleted'
    | 'assignment'
    | 'toggleStatus'
    | null;
}

export function createEntityStore<T>(options: {
  serviceToken: any; // El token de inyección del servicio
  entityName?: string; // opcional, solo para logging
}) {
  const initialState: EntityState<T> = {
    totalItems: 0,
    limit: 10,
    offset: 0,
    items: [],
    selectedItem: null,
    loading: false,
    error: null,
    lastAction: null,
    itemsDetalle: [],
  };

  return signalStore(
    { providedIn: 'root' },
    withState(initialState),
    withComputed(({ items }) => ({
      total: computed(() => items().length),
    })),
    withMethods((store) => {
      const service = inject<CrudService<T>>(options.serviceToken);
      const entity = options.entityName ?? 'Entity';

      return {
        loadAll(limit?: number, offset?: number, q?: Record<string, any>) {
          patchState(store, { loading: true, error: null });
          service
            .getAll(limit, offset, q)
            .pipe(
              tap({
                next: (res: PaginatedResponse<T>) => {
                  patchState(store, {
                    totalItems: res.total,
                    limit: res.limit,
                    offset: res.offset,
                    items: res.data,
                    loading: false,
                  });
                },
                error: (err) =>
                  patchState(store, {
                    error: `[${entity}] ${err?.error?.message}`,
                    loading: false,
                  }),
              })
            )
            .subscribe();
        },

        loadById(id: number | string, query?: string) {
          patchState(store, { loading: true, error: null });
          service
            .findOne(id, query)
            .pipe(
              tap({
                next: (item) =>
                  patchState(store, { selectedItem: item, loading: false }),
                error: (err) =>
                  patchState(store, {
                    error: `[${entity}] ${err?.error?.message}`,
                    loading: false,
                  }),
              })
            )
            .subscribe();
        },

        // loadByIdDetalle(id: number | string, query?: string) {
        //   patchState(store, { loading: true, error: null });
        //   service
        //     .getByIdDetalle(id, query)
        //     .pipe(
        //       tap({
        //         next: (item) =>
        //           patchState(store, { itemsDetalle: item, loading: false }),
        //         error: (err) =>
        //           patchState(store, {
        //             error: `[${entity}] ${err?.error?.message}`,
        //             loading: false,
        //           }),
        //       })
        //     )
        //     .subscribe();
        // },

        create(data: Partial<T>, file?: File) {
          patchState(store, { loading: true, error: null });
          service
            .create(data, file)
            .pipe(
              tap({
                next: (data) =>
                  patchState(store, {
                    items: [],
                    loading: false,
                    lastAction: 'created',
                  }),
                error: (err) => {
                  patchState(store, {
                    error: `[${entity}] ${err?.error?.message}`,
                    loading: false,
                  });
                },
              })
            )
            .subscribe();
        },

        assignment(id: number, data: any[], q?: Record<string, any>) {
          patchState(store, { loading: true, error: null });
          service
            .assignment(id, data, q)
            .pipe(
              tap({
                next: (data) =>
                  patchState(store, {
                    loading: false,
                    lastAction: 'assignment',
                  }),
                error: (err) => {
                  patchState(store, {
                    error: `[${entity}] ${err?.error?.message}`,
                    loading: false,
                  });
                },
              })
            )
            .subscribe();
        },

        update(id: number | string, data: Partial<T>, file?: File) {
          patchState(store, { loading: true, error: null });
          service
            .update(id, data, file)
            .pipe(
              tap({
                next: (data) =>
                  patchState(store, {
                    items: [],
                    loading: false,
                    lastAction: 'updated',
                  }),
                error: (err) =>
                  patchState(store, {
                    error: `[${entity}] ${err?.error?.message}`,
                    loading: false,
                  }),
              })
            )
            .subscribe();
        },

        toggleStatus(id: number | string) {
          patchState(store, { loading: true, error: null });
          service
            .toggleStatus(id)
            .pipe(
              tap({
                next: (item) =>
                  patchState(store, {
                    items: [],
                    selectedItem: null,
                    loading: false,
                    lastAction: 'toggleStatus',
                  }),
                error: (err) =>
                  patchState(store, {
                    error: `[${entity}] ${err?.error?.message}`,
                    loading: false,
                  }),
              })
            )
            .subscribe();
        },

        delete(id: number | string) {
          patchState(store, { loading: true, error: null });
          service
            .delete(id)
            .pipe(
              tap({
                next: () =>
                  patchState(store, {
                    items: [],
                    selectedItem: null,
                    loading: false,
                    lastAction: 'deleted',
                  }),
                error: (err) =>
                  patchState(store, {
                    error: `[${entity}] ${err?.error?.message}`,
                    loading: false,
                  }),
              })
            )
            .subscribe();
        },

        clearAll() {
          patchState(store, {
            items: [],
            selectedItem: null,
            loading: false,
            error: null,
            lastAction: null,
          });
        },

        clearSelected() {
          patchState(store, {
            selectedItem: null,
            loading: false,
            error: null,
            lastAction: null,
          });
        },
      };
    })
  );
}
