export interface SmsCampaign {
  id: number;
  name: string;
  totalRegistered: number;
  // senderId: string;
  // contact: string;
  // message: string;
  // createdAt: string;
  // nombre: string;
  // id_estado_campania: number;
  // id_area_campania: number;
  // countryCode?: boolean | null;
  // excelData?: Record<string, any> | null;
  campaignStatus: number;
  showheaders?: ShowHeader[] | null;
}
export interface MessagePreview {
  rows: any[];

  message: string;

  contact: string;
}
export interface ShowHeader {
  label: string;
  value: string;
}
