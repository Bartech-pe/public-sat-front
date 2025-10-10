import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { inject } from '@angular/core';
import { AloSatService } from '@services/alo-sat.service';
import { ChannelState } from '@models/channel-state.model';
import { tap } from 'rxjs';
import { ChannelPhoneState } from '@constants/pause-code-agent.constant';

export interface AloSat {
  state: ChannelState | undefined;
  pauseCode: string | undefined;
  callInfo: any | undefined;
  lastCallInfo: any | undefined;
  error: string | null;
}

const initialState: AloSat = {
  state: undefined,
  pauseCode: undefined,
  callInfo: undefined,
  lastCallInfo: undefined,
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
              next: (res: { state: ChannelState; pauseCode: string }) => {
                patchState(store, {
                  state: res.state,
                  pauseCode: res.pauseCode,
                });
                if (res.state.id === ChannelPhoneState.INCALL) {
                  this.getCallInfo();
                } else {
                  this.getLastCallInfo();
                }
              },
              error: (err) =>
                patchState(store, {
                  error: err?.error?.message,
                }),
            })
          )
          .subscribe();
      },
      getCallInfo() {
        service
          .getCallInfo()
          .pipe(
            tap({
              next: (res: any) => {
                patchState(store, {
                  callInfo: res,
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
      getLastCallInfo() {
        service
          .getLastCallInfo()
          .pipe(
            tap({
              next: (res: any) => {
                patchState(store, {
                  lastCallInfo: res,
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
