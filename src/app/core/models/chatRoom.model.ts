import { User } from "./user.model";

export interface  ChatRoom{
  id: number;
  name: string;
  isGroup?: boolean;
  status?:boolean,
  createdAt?:string;
  updatedAt?:string;
  users:User[]
  mensajesflotante?:[],
  minimized?:boolean,
}
