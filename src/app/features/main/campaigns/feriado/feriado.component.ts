import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  CalendarEvent,
  CalendarView,
  CalendarModule,
} from 'angular-calendar';
import { Subject } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { FeriadoService } from '@services/feriado.service';
import { ICreateFeriado } from '@models/feriado.model';

export interface Feriado {
  id: number;
  title: string;
  start: Date;
  description?: string;
}

@Component({
  selector: 'app-feriado',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,

    // PrimeNG
    DialogModule,
    ButtonModule,
    InputTextModule,
    TableModule,

    // Angular Calendar
    CalendarModule,
  ],
  templateUrl: './feriado.component.html',
  styles: ``,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class FeriadoComponent implements OnInit{
  CalendarView = CalendarView;
  view: CalendarView = CalendarView.Month;

  viewDate: Date = new Date();
  refresh: Subject<void> = new Subject();
  activeDayIsOpen: boolean = true;
  isloaded:boolean=false;

  viewSelected: 'grid' | 'list' = 'grid';

  constructor(private feriadoService:FeriadoService){}
  ngOnInit(): void {
    this.getFeriados()
  }

  events: CalendarEvent[] = [];
  getFeriados(){
    this.feriadoService.getAll().subscribe((res)=>{
       this.events = res.map((e: any) => ({
      ...e,
      start: new Date(e.start), 
      end: e.end ? new Date(e.end) : undefined
    }));
    })
  }

  cols = [
    { field: 'title', header: 'Nombre' },
    { field: 'start', header: 'Inicio' },
    { field: 'end', header: 'Fin' },
    { field: 'acciones', header: 'Acciones' },
  ];

  // -------------------------
  // Variables para el diálogo
  // -------------------------
  displayDialog = false;
  newFeriadoDate: Date | null = null;
  newFeriadoTitle: string = '';
  newFeriadoDescription: string = '';

  handleEvent(action: string, event: CalendarEvent): void {
    console.log(action, event);
  }
   getdate(day:Date){
     this.feriadoService.getByDate(day).subscribe((response)=>{
        if(response){
            this.newFeriadoDate = response.feriado_fecha
            this.newFeriadoTitle = response.feriado_titulo
            this.newFeriadoDescription = response.feriado_descripcion
            this.isloaded=true;
        }else{
          this.isloaded=false
        }
     })
   }
  dayClicked(day: any) {
    console.log('Día clicado', day);

    // 🔴 forzar que no se abra la franja negra
    this.activeDayIsOpen = false;
    this.getdate(day.date)

    // abrir modal de nuevo feriado
    this.newFeriadoDate = day.date;
    this.newFeriadoTitle = '';
    this.newFeriadoDescription = '';
    this.displayDialog = true;
  }

  eventTimesChanged(event: any) {
    console.log('Cambio en evento', event);
  }

  deleteEvent(eventToDelete: CalendarEvent) {
    this.events = this.events.filter((e) => e !== eventToDelete);
    this.refresh.next();
  }

  closeOpenMonthViewDay() {
    this.activeDayIsOpen = false;
  }

  // -------------------------
  // Guardar nuevo feriado
  // -------------------------
  saveFeriado() {
    /*if (this.newFeriadoDate && this.newFeriadoTitle.trim()) {
      this.events = [
        ...this.events,
        {
          start: this.newFeriadoDate,
          title: this.newFeriadoTitle,
          color: { primary: '#0d9488', secondary: '#ccfbf1' },
          meta: {
            description: this.newFeriadoDescription,
          },
        },
      ];
      this.refresh.next();
      this.displayDialog = false;
    }*/
   const create:ICreateFeriado={
     feriado_fecha: this.newFeriadoDate ?? new Date(),
     feriado_titulo: this.newFeriadoTitle,
     feriado_descripcion: this.newFeriadoDescription
   }
   this.feriadoService.postCreate(create).subscribe((response)=>{

   })
  }

  cancelDialog() {
    this.displayDialog = false;
  }
}
