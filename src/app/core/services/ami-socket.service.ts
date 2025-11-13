import { Injectable } from '@angular/core';
import { environment } from '@envs/environments';
import { ActualCall } from '@models/supervise';
import { Observable, Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root',
})
export class AmiSocketService {
  private socket: Socket;
  private newChannels = new Subject<ActualCall[]>();

  constructor() {
    this.socket = io(environment.apiUrl);

    this.socket.on('connect', () => {
      console.log('✅ WebSocket connected');
    });

    this.socket.on('disconnect', (reason) => {
      console.log(`🔌 disconnected: ${reason}`);
    });

    this.socket.on('CoreShowChannelsComplete', (payload: ActualCall[]) => {
      this.newChannels.next(payload);
    });
  }

  onNewChannelsDetected(): Observable<ActualCall[]> {
    return this.newChannels.asObservable();
  }
}
