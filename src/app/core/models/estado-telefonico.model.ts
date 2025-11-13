export interface EstadoTelefonico {
  id: number;
  nombre: string;
  descripcion?: string;
  tipo: boolean;
  categoria?: number;
  color: string;
  createdAt?: Date;
  updatedAt?: Date;
}
