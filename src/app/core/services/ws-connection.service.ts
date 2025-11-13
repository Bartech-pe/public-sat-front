import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';

import { Observable } from 'rxjs';
import { ChatMessage } from '@stores/chat-message.model';
import { environment } from '@envs/enviroments';

@Injectable({
  providedIn: 'root',
})
export class SocketMessageService {

  // private socket: Socket;

  // constructor() {
  //   this.socket = io(environment.wsUrl);
  // }

  // // Emitir un mensaje al servidor
  // sendMessage(message: ChatMessage) {
  //   this.socket.emit('send_message', message);
  // }

  // // Escuchar los mensajes entrantes
  // onMessage(): Observable<ChatMessage> {
  //   return new Observable((subscriber) => {
  //     this.socket.on('receive_message', (data: ChatMessage) => {
  //       subscriber.next(data);
  //     });
  //   });
  // }

  // onConnect(): Observable<string> {
  //   return new Observable((subscriber) => {
  //     this.socket.on('connect', () => {
  //       if (this.socket.id) {
  //         subscriber.next(this.socket.id);
  //       }
  //     });
  //   });
  // }

  // disconnect() {
  //   this.socket.disconnect();
  // }
}
