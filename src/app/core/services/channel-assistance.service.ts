import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "@envs/enviroments";
import { Observable } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ChannelAssistanceService {
  private readonly url = `${environment.apiUrl}/channel-room`;

  constructor(private http : HttpClient){}

  getMessagesFromAssistance(assistanceId: number): Observable<any>{
    try {
      return this.http.get<any>(`${this.url}/assistance/${assistanceId}`);
    } catch (error) {
      console.log(error)
      throw new Error('No se pudo enviar el mensaje')
    }
  }

  getAssistances(channelRoomId: number): Observable<any>{
    try {
      return this.http.get<any>(`${this.url}/${channelRoomId}/assistance/retrieve`);
    } catch (error) {
      console.log(error)
      throw new Error('No se pudo enviar el mensaje')
    }
  }
  sendEmailWithConversation(assintanceId: number): Observable<any>{
    try {
      return this.http.post<any>(`${this.url}/assistance/${assintanceId}/send-to-email`, {});
    } catch (error) {
      console.log(error)
      throw new Error('No se pudo enviar el mensaje')
    }
  }



}
