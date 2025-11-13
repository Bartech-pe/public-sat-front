import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@envs/environments';
import {
  AMIFilter,
  CallDTO,
  EndDTO,
  InterferCallDTO,
  RecordingDTO,
  SpyDTO,
} from '@models/supervise';

@Injectable({
  providedIn: 'root',
})
export class AmiService {
  private basePath = `${environment.apiUrl}v1/call`;
  constructor(private http: HttpClient) {}

  getActiveChannels(query: AMIFilter) {
    const params = Object.entries(query)
      .filter(
        ([_, value]) => value !== undefined && value !== null && value !== ''
      )
      .reduce(
        (httpParams, [key, value]) => httpParams.set(key, value.toString()),
        new HttpParams()
      );
    return this.http.get<any>(`${this.basePath}/active-channels`, { params });
  }

  getActiveChannelsAction() {
    return this.http.get<any>(`${this.basePath}/active-channels-action`);
  }

  postStartCall(body: CallDTO) {
    return this.http.post<any>(`${this.basePath}/start-call`, body);
  }

  postEndCall(body: EndDTO) {
    return this.http.post<any>(`${this.basePath}/end-call`, body);
  }

  postListen(body: SpyDTO) {
    return this.http.post<any>(`${this.basePath}/listen`, body);
  }

  postEnterCall(body: SpyDTO) {
    return this.http.post<any>(`${this.basePath}/enter-call`, body);
  }

  postInterferCall(body: InterferCallDTO) {
    return this.http.post<any>(`${this.basePath}/interfer-call`, body);
  }

  postRecording(body: RecordingDTO) {
    return this.http.post<any>(`${this.basePath}/recording`, body);
  }

  getDownloadFilename(filename: string) {
    return this.http.get(`${this.basePath}/dowload/${filename}`, {
      responseType: 'blob',
    });
  }
}
