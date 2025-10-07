export interface ICallFilter {
  limit: number;
  offset: number;
  search?: string;
  advisor?: string | null;  // Cambió de advisorId a advisor
  startDate?: Date | null;  // Cambió de start_date a startDate
  endDate?: Date | null;    // Cambió de end_date a endDate
  stateId?: number;         // Si lo usas más adelante
}
export interface ICallStates {
    name:string;
    icon:string;
    total:number;
    style:string;
}

export interface CallItem {
  recording_id: number;
  full_name: string;
  user: string;
  lead_id: number;
  filename: string;
  location: string;
  start_time: string; // ISO date string
  length_in_sec: number;
  phone_number: string;
  list_id: number;
}

export interface ICallStateItem {
   callStateId:number;
   name:string;
}
export interface IAdvisor {
  id:number,
  displayName:string;
}
