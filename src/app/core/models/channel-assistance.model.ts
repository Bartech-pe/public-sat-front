import { CitizenContact } from "./citizen.model";

export interface ChannelAssistance {
  id?: number;
  name?: string;
  observation?: string;
  categoryId?: number;
  consultTypeCode?: string;
  tipDoc?: string;
  docIde?: string;
  contact?: CitizenContact;
}
