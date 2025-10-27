import { User } from './user.model';

export interface ICallFilter {
  limit: number;
  offset: number;
  search?: string;
  userIds?: number[]; // Cambió de advisorId a advisor
  startDate?: Date | null; // Cambió de start_date a startDate
  endDate?: Date | null; // Cambió de end_date a endDate
  stateId?: string; // Si lo usas más adelante
}
export interface ICallStates {
  name: string;
  icon: string;
  total: number;
  style: string;
}

export interface CallItem {
  recordingId: number;
  user: User;
  leadId: number;
  filename: string;
  recordingLocation: string;
  callDate: Date; // ISO date string
  lengthInSec: number;
  phoneNumber: string;
}

export interface ICallStateItem {
  callStateId: number;
  name: string;
}
export interface IAdvisor {
  id: number;
  displayName: string;
}

export interface CallHistory {
  id: number;
  userId: number;
  user?: User;
  leadId: number;
  callerId: string;
  userCode: string;
  phoneNumber: string;
  channel: number;
  entryDate: Date;
  seconds: number;
  callStatus: string;
  callBasicInfo: string;
  callsToday: number;
  updatedAt: Date;
  callSateName?: string;
}
