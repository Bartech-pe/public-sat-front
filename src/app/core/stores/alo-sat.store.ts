import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { inject } from '@angular/core';
import { AloSatService } from '@services/alo-sat.service';
import { ChannelState } from '@models/channel-state.model';
import { tap } from 'rxjs';
import {
  ChannelPhoneState,
  VicidialPauseCode,
} from '@constants/pause-code-agent.constant';
import {
  CitizenInfo,
  ExternalCitizenService,
} from '@services/externalCitizen.service';
import { VicidialUser } from '@models/user.model';

export interface AloSat {
  userStates: VicidialUser[];
  state: ChannelState | undefined;
  pauseCode: string | undefined;
  campaignId: string | undefined;
  callInfo: any | undefined;
  lastCallInfo: any | undefined;
  citizen: CitizenInfo | undefined;
  loadingCitizen: boolean;
  error: string | null;
}

const initialState: AloSat = {
  userStates: [],
  state: undefined,
  pauseCode: undefined,
  campaignId: undefined,
  callInfo: undefined,
  lastCallInfo: undefined,
  citizen: undefined,
  loadingCitizen: false,
  error: null,
};

export const AloSatStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store) => {
    const service = inject(AloSatService);

    const externalCitizenService = inject(ExternalCitizenService);

    return {
      loadAllStates() {
        service
          .loadAllStates()
          .pipe(
            tap({
              next: (res: VicidialUser[]) => {
                patchState(store, { userStates: res });
              },
              error: (err) =>
                patchState(store, {
                  error: err?.error?.message,
                }),
            })
          )
          .subscribe();
      },
      getState() {
        patchState(store, { state: undefined });
        service
          .agentStatus()
          .pipe(
            tap({
              next: (res: {
                state: ChannelState;
                pauseCode: string;
                campaignId: string;
              }) => {
                patchState(store, {
                  state: res.state,
                  pauseCode: res.pauseCode,
                  campaignId: res.campaignId,
                });
                if (res.state.id !== ChannelPhoneState.OFFLINE) {
                  this.getCallInfo();
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

                if (res) {
                  externalCitizenService
                    .getCitizenInformation({
                      psiTipConsulta: 1,
                      piValPar1: res?.phoneNumber,
                      pvValPar2: 'empty',
                    })
                    .subscribe({
                      next: (res) => {
                        patchState(store, {
                          citizen: res[0],
                          loadingCitizen: false,
                        });
                      },
                      error: (e) => {
                        patchState(store, {
                          citizen: undefined,
                          loadingCitizen: false,
                        });
                      },
                    });
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
      // getLastCallInfo() {
      //   service
      //     .getLastCallInfo()
      //     .pipe(
      //       tap({
      //         next: (res: any) => {
      //           patchState(store, {
      //             lastCallInfo: res,
      //           });
      //           patchState(store, {
      //             citizen: undefined,
      //             loadingCitizen: true,
      //           });
      //           if (store.pauseCode() === VicidialPauseCode.WRAP) {
      //             externalCitizenService
      //               .getCitizenInformation({
      //                 psiTipConsulta: 1,
      //                 piValPar1: res?.phoneNumber,
      //                 pvValPar2: 'empty',
      //               })
      //               .subscribe({
      //                 next: (res) => {
      //                   patchState(store, {
      //                     citizen: res[0],
      //                     loadingCitizen: false,
      //                   });
      //                 },
      //                 error: (e) => {
      //                   patchState(store, {
      //                     citizen: undefined,
      //                     loadingCitizen: false,
      //                   });
      //                 },
      //               });
      //           }
      //         },
      //         error: (err) =>
      //           patchState(store, {
      //             error: err?.error?.message,
      //           }),
      //       })
      //     )
      //     .subscribe();
      // },
    };
  })
);
