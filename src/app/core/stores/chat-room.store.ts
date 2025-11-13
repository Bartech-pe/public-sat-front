
import { ChatRoomService } from '@services/chat-room.service';
import { createEntityStore } from './generic/createEntityStore';
import { ChatRoom } from '@models/chat-room.model';

export const ChatRoomStore = createEntityStore<ChatRoom>({
  serviceToken: ChatRoomService,
  entityName: 'ChatRoom',
});
