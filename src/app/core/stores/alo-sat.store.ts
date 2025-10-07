import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { inject } from '@angular/core';
import { AloSatService } from '@services/alo-sat.service';
import { ChannelState } from '@models/channel-state.model';
import { tap } from 'rxjs';

export interface AloSat {
  state: ChannelState | undefined;
  error: string | null;
}

const initialState: AloSat = {
  state: undefined,
  error: null,
};

export const AloSatStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store) => {
    const service = inject(AloSatService);

    return {
      getState() {
        patchState(store, { state: undefined });
        service
          .agentStatus()
          .pipe(
            tap({
              next: (state: ChannelState) => {
                patchState(store, {
                  state: state,
                });
              },
              error: (err) =>
                patchState(store, {
                  error: err?.error?.message,
                }),
            })
          )
          .subscribe();
      },
    };
  })
);
