export interface ICreateHorario {
}
export interface IUpdateHorario {

    hora_inicio: Date

    hora_fin: Date
  
    dia_inicio: number;
   
    dia_fin: number;
   
    feriado: boolean
}
export interface IDayWeek{
    number:number;
    day:string
}

