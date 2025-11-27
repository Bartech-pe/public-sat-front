import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  pauseCodeAgent,
  VicidialPauseCode,
} from '@constants/pause-code-agent.constant';
import { environment } from '@envs/environments';
import { map, Observable, tap } from 'rxjs';
import { CallTimerService } from './call-timer.service';
import { CitizenInfo, ExternalCitizenService } from './externalCitizen.service';
import { ChannelState } from '@models/channel-state.model';
import { VicidialUser } from '@models/user.model';
import { ChannelAssistance } from '@models/channel-assistance.model';

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

  public queueCalls: number = 0;

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

  findAllCampaignPauseCodes(campaignId?: string) {
    return this.http.post<{ pauseCode: string; pauseCodeName: string }[]>(
      `${this.basePath}/campaign-pause-codes`,
      { campaignId }
    );
  }

  findAllCallDisposition(campaignId?: string) {
    return this.http.post<
      { statusId: string; statusName: string; campaignId: string }[]
    >(`${this.basePath}/call-disposition`, { campaignId });
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

  private _loadCitizens = false;

  agentStatus(): Observable<{
    state: ChannelState;
    pauseCode: string;
    campaignId: string;
  }> {
    return this.http.get<{
      state: ChannelState;
      pauseCode: string;
      campaignId: string;
    }>(`${this.basePath}/agent-status`);
  }

  loadAllStates(): Observable<VicidialUser[]> {
    return this.http.get<VicidialUser[]>(`${this.basePath}/all-agent-status`);
  }

  getCallInfo(): Observable<any[]> {
    console.log('getCallInfo');
    return this.http.get<any>(`${this.basePath}/call-info`);
  }

  // getLastCallInfo(): Observable<any[]> {
  //   return this.http.get<any>(`${this.basePath}/last-call-info`);
  // }

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

  pauseAgent(
    pauseCode: VicidialPauseCode | undefined,
    concluded: boolean = false
  ) {
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

  transferSurvey(dial: 'd1' | 'd2' | 'd3' | 'd4' | 'd5') {
    return this.http.post<any>(`${this.basePath}/transfer-survey`, { dial });
  }

  updateDispo(dispoChoice: string, pauseAgent: boolean) {
    return this.http.post<any>(`${this.basePath}/update-dispo`, {
      dispoChoice,
      pauseAgent,
    });
  }

  alosatAssistance(dto: ChannelAssistance, pauseAgent: boolean) {
    return this.http.post<any>(`${this.basePath}/alosat-assistance`, {
      ...dto,
      pauseAgent,
    });
  }

  resumeAgent() {
    return this.http.get<any>(`${this.basePath}/resume-agent`);
  }

  confExtenCheck() {
    return this.http.get<any>(`${this.basePath}/conf-exten-check`).pipe(
      map((res) => {
        this.queueCalls = res.queueCalls ?? 0;
        return res;
      })
    );
  }

  startKeepAlive() {
    this.stopKeepAlive();
    this.timer = setInterval(() => this.confExtenCheck(), 2500);
  }

  stopKeepAlive() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
  }

  manualDialing(phoneNumber: string, phoneCode: string) {
    return this.http.post<any>(`${this.basePath}/manual-dialing`, {
      phoneNumber,
      phoneCode,
    });
  }
}
