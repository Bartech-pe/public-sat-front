export interface Sender {
  id: number;
  name: string;
  displayName: string;
  email: string;
  avatarUrl: string | null;
  idRole: number;
  verified: boolean;
  status: boolean;
  createdAt: string; // o Date si prefieres
  updatedAt: string;
}

export interface ChatMessage {
  id?: number;
  type: 'text' | 'image' | 'video' | string; // puedes extender tipos si lo necesitas
  content: string;
  idChatRoom: number;
  idSender?: number;
  resourceUrl ?: string | null;
  isRead: boolean;
  createdAt ?: string; // o Date
  updatedAt?: string;
  sender ?: Sender;
  isSender: boolean;
}



