export interface Citizen {
  id?: number;
  tipDoc: string;
  docIde: string;
  name: string;
  citizenContacts: CitizenContact[];
}

export interface CitizenContact {
  id?: number;
  tipDoc: string;
  docIde: string;
  contactType: string;
  label?: string;
  value: string;
  isAdditional: boolean;
  status?: boolean;
}
