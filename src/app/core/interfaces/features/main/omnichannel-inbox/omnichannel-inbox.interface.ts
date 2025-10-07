import { Attachment } from "@features/main/omnichannel-inbox/chat-message-manager/chat-message-manager.component";

export enum ChannelLogo  {
    all = 'ant-design:message-outlined',
    telegram = 'logos:telegram',
    whatsapp = 'logos:whatsapp-icon',
    messenger = 'logos:messenger',
    instagram = 'skill-icons:instagram',
    sms = 'simple-icons:googlemessages',
    email = 'fluent:mail-32-regular',
    chatsat = 'token-branded:chat',
}

export enum ChannelStatusIcon  {
    pendiente = 'cuida:warning-outline',
    prioridad = 'nonicons:error-16',
    completado = 'icon-park-outline:check-one',
}

export enum ChannelStatusTag  {
    pendiente = 'warning',
    prioridad = 'danger',
    completado = 'success'
}


export type ChatStatus = 'pendiente' | 'prioridad' | 'completado';
export type MessageStatus = 'read' | 'unread';
export type Channels = 'all' | 'telegram' | 'whatsapp' | 'instagram' | 'messenger' | 'email' | 'sms' | 'chatsat';
export type BotStatus = 'paused' | 'active' | 'out'

export enum CHANNELS {
  ALL = 'all',
  TELEGRAM = 'telegram',
  WHATSAPP = 'whatsapp',
  INSTAGRAM = 'instagram',
  MESSENGER = 'messenger',
  SMS = 'sms',
  EMAIL = 'email',
  CHATSAT = 'chatsat',
}

// models/chat.models.ts
export interface ChatDetail
{
  channelRoomId: number;
  assistanceId: number;
  externalRoomId: string;
  channel: Channels;
  status: ChatStatus
  citizen: ChannelCitizen;
  botStatus: BotStatus;
  agentAssigned?: ChannelAgent;
  messages: ChannelMessage[];
  hasMore?: boolean
}

export interface ChannelCitizen
{
    id: number;
    fullName: string;
    email: string;
    avatar: string;
    alias: string;
    phone: string;
    lastSeen: string;
    isActive: boolean;
}

export interface ChannelMessage
{
    id: number;
    externalMessageId: string;
    content: string;
    status: MessageStatus;
    sender: ChannelSender;
    attachments: MessageAttachment[],
    timestamp?: Date;
    time: string;
}

export interface ChannelSender
{
  id: number;
  alias?: string;
  fullName?: string;
  phone?: string;
  avatar?: string;
  isAgent?: boolean;
  fromCitizen?: boolean
}

export interface ChannelAgent
{
    id: number;
    name: string;
    alias?: string;
    phoneNumber?: string;
    email?: string;
}

export interface LastMessageReceived
{
    id : number;
    channelRoomId?: number;
    assistanceId?: number;
    externalMessageId : string;
    hasAttachment?: boolean;
    message: string;
    status: MessageStatus;
    citizen: channelCitizen;
    time: string;
    fromMe: boolean;
}
export interface channelCitizen{
    id: number;
    name?: string;
    fullName?: string;
    phone?: string;
    avatar?: string;
}

export interface ChatListInbox{
    channelRoomId: number;
    assistanceId: number;
    externalRoomId: string;
    channel: Channels;
    status: ChatStatus;
    advisor: AdvisorAssigned;
    lastMessage: LastMessageReceived;
    unreadCount: number;
    botStatus: BotStatus;
}

export interface getAdvisorsResponseDto {
  id: number;
  name: string;
  displayName: string;
  email: string;
  avatarUrl: string;
}

export interface ChannelRoomNewMessageDto{
    channelRoomId: number;
    assistanceId: number;
    externalRoomId: string;
    channel: Channels;
    advisor: AdvisorAssigned;
    status: ChatStatus;
    attachments: MessageAttachment[];
    message: NewMessage;
    unreadCount?: number;
    botStatus: BotStatus;
}


export interface MessageAttachment
{
  id?: number;
  size?: number;
  type: 'file' | 'image';
  content: string;
  extension: string
}
export interface AdvisorAssigned{
    id: number;
    name: string;
}
export interface ChannelRoomViewStatusDto{
    channelRoomId: number;
    channel: Channels;
    readCount: number;
}

export interface AdvisorChangedDto {
  channelRoomId: number;
  id: number;
  name: string;
  displayName?: string;
}

export interface BotStatusChangedDto {
  channelRoomId: number;
  botReplies: boolean;
}


export interface NewMessage{
    id: number;
    channelRoomId: number;
    assistanceId: number;
    externalMessageId: string;
    message: string;
	  sender: ChannelUser;
    attachments: MessageAttachment[]
    status: 'read' | 'unread';
    time: string;
    fromMe: boolean;
}

export interface ChannelUser {
    id: number;
    alias?: string;
    fullName?: string;
    avatar?: string;
    isAgent?: boolean;
    fromCitizen?: boolean;
    email?: string;
    phone?: string;
    lastSeen?: string;
    isActive?: boolean;
}
