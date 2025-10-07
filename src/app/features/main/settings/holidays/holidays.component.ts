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
  }

  events: CalendarEvent[] = [];

  // getHolidays() {
  //   this.holidayService.getAll().subscribe((res) => {
  //     this.events = res.data.map((e: any) => ({
  //       ...e,
  //       start: new Date(e.start),
  //       end: e.end ? new Date(e.end) : undefined,
  //     }));
  //   });
  // }

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
  dayClicked(day: any) {
    console.log('Día clicado', day);

    // 🔴 forzar que no se abra la franja negra
    this.activeDayIsOpen = false;
    this.getdate(day.date);

    // abrir modal de nuevo holidays
    this.newHolidaysDate = day.date;
    this.newHolidaysTitle = '';
    this.newHolidaysDescription = '';
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
  // Guardar nuevo holidays
  // -------------------------
  saveHolidays() {
    /*if (this.newHolidaysDate && this.newHolidaysTitle.trim()) {
      this.events = [
        ...this.events,
        {
          start: this.newHolidaysDate,
          title: this.newHolidaysTitle,
          color: { primary: '#0d9488', secondary: '#ccfbf1' },
          meta: {
            description: this.newHolidaysDescription,
          },
        },
      ];
      this.refresh.next();
      this.displayDialog = false;
    }*/
    const create: Holiday = {
      startTime: this.newHolidaysDate ?? new Date(),
      title: this.newHolidaysTitle,
      description: this.newHolidaysDescription,
    };
    this.holidayService.create(create).subscribe((response) => {});
  }

  cancelDialog() {
    this.displayDialog = false;
  }
}
