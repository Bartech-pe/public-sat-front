// ===========================================
// Subtipos base
// ===========================================

import { ChannelQueryHistory } from "@models/citizen-query-history.model";

// Información del ciudadano (persona atendida)
export interface ICitizen {
  id?: number;
  tipDoc?: string;
  docIde?: string;
  name?: string;
  createdBy?: number | null;
  updatedBy?: number | null;
  createdAt?: string; // ISO date string desde el backend
  updatedAt?: string;
}

// Canal o categoría de atención (Ej: Chat, Email, Presencial)
export interface ICategoryChannel {
  id?: number;
  name?: string;
  icon?: string | null;
  status?: boolean;
  createdBy?: number | null;
  updatedBy?: number | null;
  createdAt?: string;
  updatedAt?: string;
}

// Tipo de consulta o atención (Ej: Predial, Tributaria, etc.)
export interface IConsultType {
  id?: number;
  name?: string;
  createdBy?: number | null;
  updatedBy?: number | null;
  createdAt?: string;
  updatedAt?: string;
}

// Usuario del sistema (asesor, bot, etc.)
export interface IUser {
  id?: number;
  username?: string;
  displayName?: string;
  email?: string;
  role?: string;
  createdAt?: string;
  updatedAt?: string;
}
export interface IAttentionRecord {
  id?: number;
  consultTypeId?: number;
  citizenId?: number;
  categoryId?: number;
  communicationId?: number;
  detail?: string;
  status?: boolean;
  createdBy?: number | null;
  updatedBy?: number | null;
  createdAt?: string | Date; // fecha ISO del backend
  updatedAt?: string;

  citizen?: ICitizen;
  categoryChannel?: ICategoryChannel;
  consultType?: IConsultType;
  createdByUser?: IUser | null;
  queryHistory?: ChannelQueryHistory[]
}
