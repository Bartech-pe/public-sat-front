import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  effect,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { InputTextModule } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { TableModule, TablePageEvent } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { CallService } from '@services/call.service';
import {
  CallHistory,
  CallItem,
  IAdvisor,
  ICallFilter,
  ICallStateItem,
  ICallStates,
} from '@models/call.model';
import { CallStateService } from '@services/call-state.service';
import { AmiService } from '@services/ami.service';
import { CommonModule } from '@angular/common';
import { DurationPipe } from '@pipes/duration.pipe';
import { merge, tap } from 'rxjs';
import { SocketService } from '@services/socket.service';
import { PaginatorComponent } from '@shared/paginator/paginator.component';

@Component({
  selector: 'app-ended-calls',
  templateUrl: './ended-calls.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    TableModule,
    InputTextModule,
    ButtonModule,
    FormsModule,
    BreadcrumbModule,
    CommonModule,
    Select,
    DatePickerModule,
    CardModule,
    DurationPipe,
    PaginatorComponent,
  ],
})
export class EndedCallsComponent implements OnInit {
  private readonly socketService = inject(SocketService);

  constructor(
    private callService: CallService,
    private callStateService: CallStateService,
    private amiService: AmiService
  ) {
    effect(() => {
      const request: ICallFilter = {
        limit: this.limit(),
        offset: this.offset(),
        search: this.activeSearch() || undefined,
        advisor: this.activeAdvisorFilter() || undefined,
        startDate: this.activeStartDateFilter() || undefined,
        endDate: this.activeEndDateFilter() || undefined,
        stateId: this.activeStateFilter() || undefined,
      };
      this.getCalls(request);
      this.getTotals(request);
    });
  }
  items = signal<CallHistory[]>([]);
  states = signal<ICallStateItem[]>([]);
  advisors = signal<IAdvisor[]>([]);
  total = signal<ICallStates[]>([]);
  activeSearch = signal<string>('');
  limit = signal<number>(50);
  offset = signal<number>(0);
  totalItems?: number = 0;

  activeStartDateFilter = signal<Date | null>(null);
  activeEndDateFilter = signal<Date | null>(null);
  activeStateFilter = signal<number | null>(null);
  activeAdvisorFilter = signal<string | null>(null);
  activeDateFilter = signal<Date | null>(null);

  ngOnInit() {
    this.getStates();
    this.getAdvisors();
    merge(
      this.socketService.onUserPhoneStateRequest(),
      this.socketService.onRequestPhoneCallSubject()
    )
      .pipe(tap((data) => console.log('Socket event', data)))
      .subscribe(() => {
        this.loadData();
      });
  }

  getTotals(request: ICallFilter) {
    this.callService.getStateStatus(request).subscribe((response) => {
      // this.total.set(response)
      console.log(response);
      this.total.set(response);
    });
  }

  getCalls(request: ICallFilter) {
    this.callService.getQuickResponses(request).subscribe((res) => {
      this.items.set(res.data);
      this.totalItems = res.total;
    });
  }

  getStates() {
    this.callStateService.getCategories().subscribe((response) => {
      this.states.set(response);
    });
  }

  getAdvisors() {
    this.callService.getAdvisors().subscribe((response: any) => {
      response.push({ id: null, displayName: 'Todos' });
      this.advisors.set(response);
    });
  }

  loadData() {
    const request: ICallFilter = {
      limit: this.limit(),
      offset: this.offset(),
      search: this.activeSearch() || undefined,
      advisor: this.activeAdvisorFilter() || undefined,
      startDate: this.activeStartDateFilter() || undefined,
      endDate: this.activeEndDateFilter() || undefined,
      stateId: this.activeStateFilter() || undefined,
    };
    this.getCalls(request);
    this.getTotals(request);
  }

  onPageChange(event: { limit: number; offset: number }) {
    this.limit.set(event.limit);
    this.offset.set(event.offset);
    this.loadData();
  }

  download(url: string) {
    const a = document.createElement('a');
    a.href = url;
    // Extraemos el nombre del archivo desde la URL para usarlo en el atributo download
    const filename = url.substring(url.lastIndexOf('/') + 1);
    a.download = filename;
    a.target = '_blank'; // Para evitar problemas en algunos navegadores
    document.body.appendChild(a); // necesario para Firefox
    a.click();
    document.body.removeChild(a);
  }
}
