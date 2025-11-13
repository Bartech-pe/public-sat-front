import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  pauseCodeAgent,
  VicidialPauseCode,
} from '@constants/pause-code-agent.constant';
import { environment } from '@envs/enviroments';
import {
  BehaviorSubject,
  interval,
  map,
  mergeMap,
  Observable,
  of,
  Subscription,
  tap,
} from 'rxjs';
import { CallTimerService } from './call-timer.service';
import { CitizenInfo, ExternalCitizenService } from './externalCitizen.service';

@Injectable({
  providedIn: 'root',
})
export class AloSatService {
  private basePath = `${environment.apiUrl}/alosat`;

  private callTimer = inject(CallTimerService);

  private http = inject(HttpClient);

  private externalCitizenService = inject(ExternalCitizenService);

  private timer: any;

  private _isLogged: boolean = false;

  set isLogged(val: boolean) {
    this._isLogged = val;
  }

  get isLogged(): boolean {
    return this._isLogged;
  }

  private _status: any = undefined;

  set status(val: any) {
    this._status = val;
  }

  private _callInfo: any = undefined;

  set callInfo(val: any) {
    this._callInfo = val;
  }

  get callInfo(): any {
    return this._callInfo;
  }

  private _citizen?: CitizenInfo = undefined;

  set citizen(val: CitizenInfo | undefined) {
    this._citizen = val;
  }

  get citizen(): CitizenInfo {
    return this._citizen!;
  }

  get status(): any {
    if (this._status) {
      return {
        status: this._status?.status ?? 'LOOSE',
        lastChange: this._status?.lastChange
          ? new Date(this._status?.lastChange)
          : undefined,
        callsToday: this._status?.callsToday,
        pauseCode: ['LOGIN', ''].includes(this._status?.pauseCode)
          ? 'Inicial'
          : this._status?.pauseCode == 'WRAP'
          ? 'Tiempo de post-llamada'
          : pauseCodeAgent.find((item) => item.code === this._status?.pauseCode)
              ?.name ?? '',
      };
    } else {
      return undefined;
    }
  }

  handleIncomingCall(entryDate: Date) {
    if (entryDate) {
      // Arrancar sincronizado con la fecha de inicio
      this.callTimer.start(entryDate);
    } else {
      // Si no hay llamada activa, paramos el timer
      this.callTimer.reset();
    }
  }

  private resetCall() {
    this.callTimer.pause();
    this.citizen = undefined;
    this.existCitizen = false;
    this.loadingCitizen = false;
  }

  getCampaignsByUser(): Observable<any[]> {
    return this.http.get<any[]>(`${this.basePath}/campaigns`);
  }

  agentLogin(idCampaign: string) {
    return this.http
      .post<any>(`${this.basePath}/agent-login`, { idCampaign })
      .subscribe();
  }

  startKeepalive() {
    this.stopKeepalive();
    this.timer = setInterval(() => this.agentStatus(), 1000);
  }

  stopKeepalive() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
  }

  private _loadCitizens = false;

  agentStatus() {
    return this.http.get<any>(`${this.basePath}/agent-status`)
      .pipe(
        tap((res) => {
          this.status = res;
          this.isLogged = res.status !== 'LOGGED_OUT';
          this.callInfo = res.callInfo;
          if (['QUEUE', 'INCALL'].includes(res.status)) {
            if (!this._loadCitizens) {
              this._loadCitizens = true;
              this.callInit(res.callInfo);
            }
          } else if (['PAUSE'].includes(res.status)) {
            this.resetCall();
          }
        })
      )
      .subscribe() /* of({
      status: 'INCALL',
      callInfo: {
        phone_number: '957586572',
        entryDate: new Date()
      }
    }) */;
  }
  loadingCitizen: boolean = false;

  existCitizen: boolean = false;

  private callInit(callInfo: any) {
    this.handleIncomingCall(new Date(callInfo?.entryDate));
    this.loadingCitizen = true;
    if (callInfo?.phone_number) {
      this.externalCitizenService
        .getCitizenInformation({
          psiTipConsulta: 1,
          piValPar1: callInfo?.phone_number,
          pvValPar2: 'empty',
        })
        .subscribe((res) => {
          this.citizen = res[0];
          this.existCitizen = res.length != 0;
          this.loadingCitizen = false;
        });
    }
  }

  agentLogout() {
    return this.http.get<any>(`${this.basePath}/agent-logout`).subscribe();
  }

  endCall() {
    this._loadCitizens = false;
    return this.http.get<any>(`${this.basePath}/end-call`);
  }

  pauseAgent(pauseCode: VicidialPauseCode | '') {
    return this.http.post<any>(`${this.basePath}/pause-agent`, { pauseCode });
  }

  transferCall(idUser: number) {
    return this.http.post<any>(`${this.basePath}/transfer-call`, { idUser });
  }

  resumeAgent() {
    return this.http
      .get<any>(`${this.basePath}/resume-agent`)
      .pipe(
        tap((res) => {
          this.agentStatus();
        })
      )
      .subscribe();
  }
}
