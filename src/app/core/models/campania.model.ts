export interface Campania {
  id: number;
  nombre: string;
  descripcion: string;
  id_tipo_campania: number;
  id_area_campania: number;
  id_estado_campania: number;
  fecha_inicio?: Date;
  fecha_fin?: Date;
  fecha_vigencia?: Date;
  createUser?: number;
  status?: boolean;
  campaniaId?: string;
  deletedAt?: Date
  copiado?: boolean;

  horario_inicio?: string; // formato "HH:mm"
  horario_fin?: string;    // formato "HH:mm"
  feriado: boolean; // Se puede cambiar
  dia_inicio?:number;
  dia_fin?:number;
}