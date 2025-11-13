
import { ChatRoomService } from '@services/chatRoom.service';
import { createEntityStore } from './createEntityStore';
import { ChatRoom } from '@models/chatRoom.model';

export const ChatRoomStore = createEntityStore<ChatRoom>({
  serviceToken: ChatRoomService,
  entityName: 'ChatRoom',
});
