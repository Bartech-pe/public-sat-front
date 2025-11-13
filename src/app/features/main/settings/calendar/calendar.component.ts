import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { Column } from '@models/column-table.models';
import { Subject } from 'rxjs';
import {
  CalendarEvent,
  CalendarModule,
  CalendarView,
  CalendarEventAction,
  CalendarEventTimesChangedEvent,
} from 'angular-calendar';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-calendar',
  imports: [CommonModule, CardModule, CalendarModule],
  templateUrl: './calendar.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CalendarComponent implements OnInit {
 title: string = 'Calendario';

  descripcion: string =
    'Configuración de fechas y feriados';

  icon: string = 'material-symbols:calendar-month-outline-rounded';

  view: CalendarView = CalendarView.Month;

  CalendarView = CalendarView;

  viewDate: Date = new Date();

  activeDayIsOpen: boolean = false;

  viewOptions: any[] = [
    {
      value: 'grid',
      icon: 'material-symbols:grid-view-outline-rounded',
      justify: 'Modo cuadrícula',
    },
    {
      value: 'list',
      icon: 'material-symbols:lists',
      label: 'Modo lista',
    },
  ];

  viewSelected: string = 'grid';

  events: CalendarEvent[] = [];

  refresh = new Subject<void>();

  loadingTable?: boolean = false;

  cols!: Column[];

  ngOnInit(): void {}

  cargarFeriados() {
    // this.feriadoService.findAllByMonth(this.viewDate).subscribe({
    //   next: (data) => {
    //     this.events = data.map((item) => ({
    //       id: item.id,
    //       title: item.title,
    //       start: new Date(item.start),
    //       end: item.end ? new Date(item.end) : undefined,
    //       color: { ...colors['blue'] },
    //       allDay: true,
    //     }));
    //   },
    // });
  }

  dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
    // if (isSameMonth(date, this.viewDate)) {
    //   if (
    //     (isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) ||
    //     events.length === 0
    //   ) {
    //     this.activeDayIsOpen = false;
    //   } else {
    //     this.activeDayIsOpen = true;
    //   }
    //   this.viewDate = date;
    // }
  }

  eventTimesChanged({
    event,
    newStart,
    newEnd,
  }: CalendarEventTimesChangedEvent): void {
    // this.events = this.events.map((iEvent) => {
    //   if (iEvent === event) {
    //     return {
    //       ...event,
    //       start: newStart,
    //       end: newEnd,
    //     };
    //   }
    //   return iEvent;
    // });
    // this.handleEvent('Dropped or resized', event);
  }

  handleEvent(action: string, event: CalendarEvent): void {
    // this.modalData = { event, action };
    // this.modal.open(this.modalContent, { size: 'lg' });
  }

  addEvent(): void {
    // const ref = this.dialogService.open(FormEventoComponent, {
    //   header: 'Nuevo feriado',
    //   styleClass: 'modal-md',
    //   position: 'center',
    //   modal: true,
    //   dismissableMask: false,
    //   closable: true,
    // });
    // ref.onClose.subscribe((res) => {
    //   if (res) {
    //     this.cargarFeriados();
    //   }
    // });
  }

  deleteEvent(item: CalendarEvent) {
    // console.log('eventToDelete', item);
    // this.msg.confirm(
    //   `<div class='px-4 py-2'>
    //     <p class='text-center'> ¿Está seguro de eliminar el evento <span class='uppercase font-bold'>${item?.title}</span>? </p>
    //     <p class='text-center'> Esta acción no se puede deshacer. </p>
    //   </div>`,
    //   () => {
    //     // this.events = this.events.filter((event) => event !== eventToDelete);
    //     this.feriadoService.delete(item.id as string).subscribe((res) => {
    //       this.msg.success('Feriado eliminado correctamente');
    //       this.cargarFeriados();
    //     });
    //     // this.store.delete(item.id);
    //   }
    // );
  }

  closeOpenMonthViewDay() {
    this.activeDayIsOpen = false;
    this.cargarFeriados();
  }
}
