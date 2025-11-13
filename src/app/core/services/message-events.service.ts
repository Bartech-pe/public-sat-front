// message-events.service.ts
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MessageEventsService {
  private messageSelectedSource = new Subject<any>();
  messageSelected$ = this.messageSelectedSource.asObservable();

  sendMessageSelected(message: any) {
    this.messageSelectedSource.next(message);
  }
}
