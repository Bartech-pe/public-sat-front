import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
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
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { CallService } from '@services/call.service';
import { CallItem, IAdvisor, ICallStates } from '@models/call.model';
import { CallStateService } from '@services/call-state.service';
import { AmiService } from '@services/ami.service';
import { CommonModule } from '@angular/common';
import { DurationPipe } from '@pipes/duration.pipe';
import { merge, tap } from 'rxjs';
import { SocketService } from '@services/socket.service';
import { PaginatorComponent } from '@shared/paginator/paginator.component';
import { AloSatService } from '@services/alo-sat.service';

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

  private readonly aloSatService = inject(AloSatService);

  private readonly callService = inject(CallService);

  items = signal<CallItem[]>([]);

  states = signal<
    { statusId: string; statusName: string; campaignId: string }[]
  >([]);

  advisors = signal<IAdvisor[]>([]);
  total = signal<ICallStates[]>([]);
  activeSearch = signal<string | undefined>(undefined);
  limit = signal<number>(50);
  offset = signal<number>(0);
  totalItems?: number = 0;

  activeStartDateFilter = signal<Date | undefined>(undefined);
  activeEndDateFilter = signal<Date | undefined>(undefined);
  activeStateFilter = signal<string | undefined>(undefined);
  activeAdvisorFilter = signal<number | undefined>(undefined);
  activeDateFilter = signal<Date | undefined>(undefined);

  ngOnInit() {
    this.getAdvisors();
    this.loadData();
    this.loadDispositions();
    merge(
      this.socketService.onUserPhoneStateRequest(),
      this.socketService.onRequestPhoneCallSubject()
    )
      .pipe(tap((data) => console.log('Socket event', data)))
      .subscribe(() => {
        this.loadData();
      });
  }

  getTotals(request: Record<string, any>) {
    this.callService.getStateStatus(request).subscribe((response) => {
      // this.total.set(response)
      console.log(response);
      this.total.set(response);
    });
  }

  getCalls(limit?: number, offset?: number, q?: Record<string, any>) {
    this.callService.getQuickResponses(limit, offset, q).subscribe((res) => {
      this.items.set(res.data);
      this.totalItems = res.total;
    });
  }

  getAdvisors() {
    this.callService.getAdvisors().subscribe((response: any) => {
      this.advisors.set(response);
    });
  }

  search() {
    this.offset.set(0);
    this.loadData();
  }

  clear() {
    this.offset.set(0);
    this.activeSearch.set(undefined);
    this.activeAdvisorFilter.set(undefined);
    this.activeStateFilter.set(undefined);
    this.activeEndDateFilter.set(undefined);
    this.activeStartDateFilter.set(undefined);
    this.loadData();
  }

  loadData() {
    const userId = this.activeAdvisorFilter();
    const request: Record<string, any> = {
      search: this.activeSearch() || undefined,
      userIds: !!userId ? [userId] : undefined,
      startDate: this.activeStartDateFilter() || undefined,
      endDate: this.activeEndDateFilter() || undefined,
      stateId: this.activeStateFilter() || undefined,
    };
    this.getCalls(this.limit(), this.offset(), request);
    this.getTotals(request);
  }

  loadDispositions() {
    this.aloSatService.findAllCallDisposition().subscribe({
      next: (data) => {
        this.states.set(data);
      },
    });
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
