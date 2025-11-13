export interface MensajeAutomatico {
  id: number;
  nombre: string;
  descripcion?: string;
  tipo: number;
  estado: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
