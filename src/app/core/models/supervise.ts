export interface SuperviseItem {
 advisor:string;
 state:string;
 stateCode:string;
 duration:string;
 phoneNumber:string;
}
export interface ActualStateCall {
  state: string;
  style: string;
  icon: string;
}
export interface ActualCall {
 channel?:string;
  phoneNumber?: string;
  advisorName: string;
  agent:string;
  agentChannel:string;
  duration: number;
  actualState: ActualStateCall;
  personal:boolean;
  extension:string;
}
export interface CallDTO {
  agent: string;
  client: string;
}
export interface InterferCallDTO {
  agent: string;
  client: string;
  extension:string
}
export interface SpyDTO {
  admin: string;
  destiny: string;
  volume?:number;
}
export interface RecordingDTO {
  channel: string;
  agent: string;
}
export interface EndDTO {
  channel: string;
}



export interface AMIFilter {
  
  limit: number;
  
  offset: number;
 
  state?: string;
  
  search?: string;
 
  alert?: boolean;
  
}