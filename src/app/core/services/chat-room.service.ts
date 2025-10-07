import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GenericCrudService } from '@services/generic/generic-crud.service';
import { ChatRoom } from '@models/chat-room.model';

@Injectable({
  providedIn: 'root',
})
export class ChatRoomService extends GenericCrudService<ChatRoom> {
  constructor(http: HttpClient) {
    super(http, 'chat/room');
  }
}
