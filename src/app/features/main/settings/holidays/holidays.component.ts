import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CalendarEvent, CalendarView, CalendarModule } from 'angular-calendar';
import { Subject } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { HolidayService } from '@services/holiday.service';
import { Holiday } from '@models/holiday.model';
import { da } from 'date-fns/locale';

export interface Holidays {
  id: number;
  title: string;
  start: Date;
  description?: string;
}

@Component({
  selector: 'app-holidays',
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
  templateUrl: './holidays.component.html',
  styles: ``,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class HolidaysComponent implements OnInit {
  CalendarView = CalendarView;
  view: CalendarView = CalendarView.Month;

  viewDate: Date = new Date();
  refresh: Subject<void> = new Subject();
  activeDayIsOpen: boolean = true;
  isloaded: boolean = false;

  viewSelected: 'grid' | 'list' = 'grid';

  constructor(private holidayService: HolidayService) {}

  ngOnInit(): void {
    this.getdate(new Date());
    this.getHolidays();
  }

  events: CalendarEvent[] = [];

  getHolidays() {
    this.holidayService.getAll().subscribe((res:any) => {
      this.events = res.map((e: any) => ({
        ...e,
        title: e.title,
        start: new Date(e.startTime),
        end:  new Date(e.endTime),
        meta: { id: e.id }
      }));
    });
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
  newHolidaysDate: Date | null = null;
  newHolidaysTitle: string = '';
  newHolidaysDescription: string = '';

  handleEvent(action: string, event: CalendarEvent): void {
    console.log(action, event);
  }

  getdate(day: Date) {
    this.holidayService.getByDate(day).subscribe((response) => {
        if (response) {
          this.newHolidaysDate = response.startTime;
          this.newHolidaysTitle = response.title;
          this.newHolidaysDescription = response.description;
          this.isloaded = true;
        } else {
          this.isloaded = false;
        }
    });
  }
  
  idCalendario:any;
  dayClicked({ date, events }: { date: Date; events: any[] }): void {
    // Cierra el día activo (por ejemplo, colapsa el calendario expandido)
    this.activeDayIsOpen = false;

    // Ejecuta alguna función personalizada si es necesario
    this.getdate(date);

    // Prepara el modal para crear/editar feriado
    this.newHolidaysDate = date;
    this.newHolidaysTitle = '';
    this.newHolidaysDescription = '';
    this.displayDialog = true;

    // Si hay eventos existentes en ese día, toma el primero
    if (events && events.length > 0) {
      const event = events[0];

      // Guarda el ID del evento (para editar o eliminar)
      this.idCalendario = event.meta?.id || event.id || '';

      // Si quieres también precargar el título o descripción:
      this.newHolidaysTitle = event.title || '';
      this.newHolidaysDescription = event.meta?.description || '';
    } else {
      // Si no hay eventos, resetea el ID
      this.idCalendario = '';
    }

  }

  eventTimesChanged(event: any) {
    console.log('Cambio en evento', event);
  }

  deleteEvent(eventToDelete: any) {
    console.log(eventToDelete);
    this.holidayService.delete(eventToDelete?.id).subscribe((response) => {
        this.cancelDialog(); this.getHolidays();
    });
    
    this.events = this.events.filter((e) => e !== eventToDelete);
    this.refresh.next();
  }

  closeOpenMonthViewDay() {
    this.activeDayIsOpen = false;
    
  }

  loadData() {
    
  }

  saveHolidays() {

    const create: Holiday = {
        startTime: this.newHolidaysDate ?? new Date(),
        title: this.newHolidaysTitle,
        description: this.newHolidaysDescription,
    };

    if(this.idCalendario){
       this.holidayService.update(this.idCalendario, { id: this.idCalendario, ...create }).subscribe((response) => {this.cancelDialog(); this.getHolidays();});
    }else{
       this.holidayService.create(create).subscribe((response) => {this.cancelDialog(); this.getHolidays();});
    }

   
  }

  cancelDialog() {
    this.displayDialog = false;
  }
}
