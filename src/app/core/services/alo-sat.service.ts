import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  pauseCodeAgent,
  VicidialPauseCode,
} from '@constants/pause-code-agent.constant';
import { environment } from '@envs/environments';
import { Observable, tap } from 'rxjs';
import { CallTimerService } from './call-timer.service';
import { CitizenInfo, ExternalCitizenService } from './externalCitizen.service';
import { ChannelState } from '@models/channel-state.model';
import { VicidialUser } from '@models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AloSatService {
  private basePath = `${environment.apiUrl}v1/alosat`;

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

  findAllUserGroups(): Observable<{ userGroup: string; groupName: string }[]> {
    return this.http.get<{ userGroup: string; groupName: string }[]>(
      `${this.basePath}/user-groups`
    );
  }

  getCampaignsByUser(): Observable<any[]> {
    return this.http.get<any[]>(`${this.basePath}/campaigns`);
  }

  findInboundGroupsByCampaign(campaignId: string) {
    return this.http.post<{ groupId: string; groupName: string }[]>(
      `${this.basePath}/inbound-groups-by-campaign`,
      { campaignId }
    );
  }

  agentLogin(campaignId: string, inboundGroups: string) {
    return this.http.post<any>(`${this.basePath}/agent-login`, {
      campaignId,
      inboundGroups,
    });
  }

  agentRelogin() {
    return this.http.get<any>(`${this.basePath}/agent-relogin`);
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

  agentStatus(): Observable<{ state: ChannelState; pauseCode: string }> {
    return this.http.get<{ state: ChannelState; pauseCode: string }>(
      `${this.basePath}/agent-status`
    );
  }

  loadAllStates(): Observable<VicidialUser[]> {
    return this.http.get<VicidialUser[]>(`${this.basePath}/all-agent-status`);
  }

  getCallInfo(): Observable<any[]> {
    return this.http.get<any>(`${this.basePath}/call-info`);
  }

  getLastCallInfo(): Observable<any[]> {
    return this.http.get<any>(`${this.basePath}/last-call-info`);
  }

  loadingCitizen: boolean = false;

  existCitizen: boolean = false;

  callInit(callInfo: any) {
    // this.handleIncomingCall(new Date(callInfo?.entryDate));
    this.loadingCitizen = true;
    if (callInfo?.phoneNumber) {
      this.externalCitizenService
        .getCitizenInformation({
          psiTipConsulta: 1,
          piValPar1: callInfo?.phoneNumber,
          pvValPar2: 'empty',
        })
        .subscribe({
          next: (res) => {
            this.citizen = res[0];
            this.existCitizen = res.length != 0;
            this.loadingCitizen = false;
          },
          error: (e) => {
            this.citizen = undefined;
            this.existCitizen = false;
            this.loadingCitizen = false;
          },
        });
    }
  }

  agentLogout() {
    return this.http.get<any>(`${this.basePath}/agent-logout`);
  }

  agentLogoutByUserId(userId: number) {
    return this.http.get<any>(`${this.basePath}/agent-logout/${userId}`);
  }

  endCall() {
    this._loadCitizens = false;
    return this.http.get<any>(`${this.basePath}/end-call`);
  }

  endCallByUserId(userId: number) {
    this._loadCitizens = false;
    return this.http.get<any>(`${this.basePath}/end-call/${userId}`);
  }

  pauseAgent(pauseCode: VicidialPauseCode | '', concluded: boolean = false) {
    return this.http.post<any>(`${this.basePath}/pause-agent`, {
      pauseCode,
      concluded,
    });
  }

  transferCall(userId: number) {
    return this.http.post<any>(`${this.basePath}/transfer-call`, { userId });
  }

  transferCallMe(userId: number) {
    return this.http.post<any>(`${this.basePath}/transfer-call-me`, { userId });
  }

  parkCall(putOn: boolean) {
    return this.http.post<any>(`${this.basePath}/park-call`, { putOn });
  }

  resumeAgent() {
    return this.http.get<any>(`${this.basePath}/resume-agent`);
  }
}
