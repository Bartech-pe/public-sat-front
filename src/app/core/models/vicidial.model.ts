export interface Vicidiallists {
 list_id:number;
 list_name:string;
 list_description:string;
 campaign_id:string;
 active:string;
 dtoList:VicidialLead[];
}

export interface VicidialLead {
 status:string;
 first_name:string;
 last_name?:string;
 phone_number:string;
 list_id?:string;
}