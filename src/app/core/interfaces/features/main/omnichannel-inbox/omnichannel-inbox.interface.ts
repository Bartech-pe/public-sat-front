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
    identity_verification = 'cuida:warning-outline',
    in_progress = 'cuida:warning-outline',
    priority = 'nonicons:error-16',
    closed = 'icon-park-outline:check-one',
}



export enum ChannelStatusTag  {
    pendiente = 'warning',
    prioridad = 'danger',
    completado = 'success'
}

export enum ChannelAttentionStatusTag  {
    identity_verification = 'Identificación',
    priority = 'Prioridad',
    closed = 'Cerrado',
    in_progress = 'En proceso'
}


export enum ChannelAttentionStatusReverse  {
    pendiente = 'in_progress',
    prioridad = 'priority',
    completado = 'closed'
}

export enum ChannelAttentionStatusReverseTag  {
    in_progress= 'pendiente',
    identity_verification= 'pendiente',
    priority= 'prioridad',
    closed= 'completado'
}

export enum ChannelAttentionStatusTagType  {
    identity_verification = 'info',
    closed = 'success',
    priority = 'danger',
    in_progress = 'warning'
}


export type ChannelStatusWithExtraStatuses = 'all' | ChatStatus;

export type ChatStatus = 'pendiente' | 'prioridad' | 'completado';
export type ChannelAttentionStatus = 'identity_verification' | 'closed' | 'in_progress' | 'priority';
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
  attention: ChannelAttentionSummariesDTO;
  externalRoomId: string;
  channel: Channels;
  status: ChatStatus
  citizen: ChannelCitizenSummariesDto;
  botStatus: BotStatus;
  agentAssigned?: ChannelAgent | null;
  messages: ChannelMessage[];
  hasMore?: boolean
}

export interface ChannelCitizenSummariesDto
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
    time?: string;
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
    id?: number | null;
    name?: string | null;
    alias?: string | null;
    phoneNumber?: string | null;
    email?: string | null;
}

export interface LastMessageReceived
{
    id : number;
    channelRoomId?: number;
    attention?: ChannelAttentionSummariesDTO;
    externalMessageId : string;
    hasAttachment?: boolean;
    message: string;
    status: MessageStatus;
    citizen: channelCitizen;
    time: Date;
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
    attention: ChannelAttentionSummariesDTO;
    externalRoomId: string;
    channel: Channels;
    status: ChatStatus;
    advisor?: AdvisorAssigned | null;
    lastMessage: LastMessageReceived;
    unreadCount: number;
    botStatus: BotStatus;
}

export interface ChannelAttentionSummariesDTO{
  id: number;
  status: ChannelAttentionStatus;
  endDate?: Date | null;
  consultTypeId?: number | null;
  attentionDetail?: string |  null;
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
    attention: ChannelAttentionSummariesDTO;
    externalRoomId: string;
    channel: Channels;
    advisor: AdvisorAssigned | null;
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
    id?: number | null;
    name?: string | null;
}
export interface ChannelRoomViewStatusDto{
    channelRoomId: number;
    channel: Channels;
    readCount: number;
}

export interface AdvisorChangedDto {
  channelRoomId: number;
  attentionId: number;
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
    time: Date;
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
