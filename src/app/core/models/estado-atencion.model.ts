export interface EstadoAtencion {
  id: number;
  nombre: string;
  descripcion: string;
  tipo: boolean;
  color: string;
  createdAt?: Date;
  updatedAt?: Date;
}
