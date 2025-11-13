import { CommonModule } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TabsModule } from 'primeng/tabs';
import { TagModule } from 'primeng/tag';
import { TextareaModule } from 'primeng/textarea';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { DialogService } from 'primeng/dynamicdialog';
import { MessageGlobalService } from '@services/generic/message-global.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CitizenAssistance } from '@models/citizen-assistance.model';
import { CitizenAssistanceService } from '@services/citizen-assistance.service';
import { map } from 'rxjs';
import { TitleSatComponent } from '@shared/title-sat/title-sat.component';
import { PaginatorComponent } from '@shared/paginator/paginator.component';
import { ButtonSaveComponent } from '@shared/buttons/button-save/button-save.component';
import { RegisterAssistanceComponent } from './register-assistance/register-assistance.component';
import { IAttentionRecord } from '@interfaces/features/main/unified-query-system/attentionRecord.interface';
import { ChannelAssistanceService } from '@services/channel-assistance.service';
import { GenericAssistanceService } from '@services/generic-assistance.service';
import { ChannelCitizenService } from '@services/channel-citizen.service';

type ViewType = 'register' | 'list';

interface Atenciones {
  id?: string;
  nombre: string;
  pipeline: string;
  estado: string;
  fecha: string;
  prioridad: 'Alta' | 'Media' | 'Baja';
  propietario: string;
  fuente: string;
  abierto: boolean;
  resultado: string;
}

@Component({
  selector: 'app-dashboard-adviser',
  imports: [
    ToggleSwitchModule,
    ButtonModule,
    SelectModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    TagModule,
    TextareaModule,
    TableModule,
    SelectModule,
    BreadcrumbModule,
    TabsModule,
    InputIconModule,
    IconFieldModule,
    RouterModule,
    TitleSatComponent,
    RegisterAssistanceComponent,
    ButtonSaveComponent,
  ],
  templateUrl: './dashboard-adviser.component.html',
  styles: ``,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class DashboardAdviserComponent implements OnInit {
  title: string = 'Atención al ciudadano';

  descripcion: string = 'Lista de atenciones realizadas.';

  private readonly msg = inject(MessageGlobalService);

  private readonly dialogService = inject(DialogService);

  private readonly router = inject(Router);

  private readonly route = inject(ActivatedRoute);

  private readonly citizenAssistanceService = inject(CitizenAssistanceService);

  private readonly channelAssistanceService = inject(ChannelAssistanceService);

  private readonly genericAssistanceService = inject(GenericAssistanceService);

  private readonly channelCitizenService = inject(ChannelCitizenService);

  formData = new FormGroup({
    idtipoConsulta: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    description: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    resultado: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  openModal: boolean = false;

  listaTipoConsulta = [
    { id: 1, name: 'Papeletas' },
    { id: 2, name: 'Multas' },
    { id: 3, name: 'Tramites' },
    { id: 4, name: 'Otro' },
  ];

  activeTab: string = '0';

  tableComunicaciones: CitizenAssistance[] = [];

  tableChannelAllAttentions: IAttentionRecord[] = [];

  atenciones = [
    {
      fecha: '15/12/24',
      canal: 'Tel',
      tipo: 'Papeleta',
      estado: true,
    },
    {
      fecha: '10/12/24',
      canal: 'Chat',
      tipo: 'Multa',
      estado: true,
    },
    {
      fecha: '05/12/24',
      canal: 'Email',
      tipo: 'Trámite',
      estado: false,
    },
    {
      fecha: '02/12/24',
      canal: 'Tel',
      tipo: 'Reclamo',
      estado: true,
    },
    {
      fecha: '28/11/24',
      canal: 'Chat',
      tipo: 'Multa',
      estado: false,
    },
  ];
  limit = signal(10)
  offset  = signal(0)
  verifyPayment = signal<boolean | null>(null)
  totalRecords = signal(0)
  get tableChannelAttentionsFiltered(): IAttentionRecord[] {
    return [
      ...this.filteredMepecos,
      ...this.tableChannelAllAttentions,
      ...this.tableChannelAssistances,
      ...this.tableGenericAssistances.map((x) => ({
        ...x,
        categoryChannel: { id: 0 },
      })),
    ];
  }

  tableChannelAssistances: IAttentionRecord[] = [];

  tableGenericAssistances: IAttentionRecord[] = [];

  tickets: Atenciones[] = [];


  selectedAtencion!: Atenciones;

  originalRoute: string = '';

  viewValue = signal<ViewType>('list');

  ngOnInit(): void {
    this.getAtenciones();
    this.originalRoute = this.router.url.split('?')[0];
    console.log('Ruta original:', this.originalRoute);
    this.route.queryParams.subscribe((params) => {
      const view = params['view'] ?? 'list';
      this.viewValue.set(view);
    });
  }

  onSubmit() {
    if (this.formData.valid) {
      console.log(this.formData.value);
    } else {
      this.formData.markAllAsTouched();
    }
  }

  getAtenciones() {
    this.citizenAssistanceService
      .getAll(undefined, undefined, { byUser: true })
      .subscribe({
        next: (res) => {
          this.tableComunicaciones = res.data;
        },
      });
    this.channelAssistanceService
      .getAll(undefined, undefined, { byUser: true })
      .subscribe({
        next: (res) => {
          this.tableChannelAssistances = res.data;
        },
      });

    this.genericAssistanceService
      .getAll(undefined, undefined, { byUser: true })
      .subscribe({
        next: (res) => {
          this.tableGenericAssistances = res.data;
        },
      });

    // this.channelCitizenService.getAssistancesByDocumentNumber(doc).subscribe({
    //   next: (response) => {
    //     if (response?.success && response?.data && response.data.length) {
    //       let channelAttentions: IAttentionRecord[] = response.data.map(
    //         (attention) => {
    //           return {
    //             categoryChannel: {
    //               name: attention?.channel,
    //             },
    //             method: 'CHAT',
    //             createdByUser: {
    //               displayName: attention?.advisorIntervention
    //                 ? attention.user
    //                 : 'BOT',
    //             },
    //             citizen: {
    //               name: attention?.email,
    //             },
    //             createdAt: attention?.startDate,
    //             result: 'Contacto',
    //             consultType: {
    //               name: attention?.type,
    //             },
    //             queryHistory: attention.queryHistory,
    //           };
    //         }
    //       );

    //       console.log('channelAttentions', channelAttentions);

    //       this.tableChannelAllAttentions = [
    //         ...this.tableChannelAllAttentions,
    //         ...channelAttentions,
    //       ];
    //     }
    //   },
    // });
  }

  changeView(view: ViewType) {
    this.router.navigate([this.originalRoute], {
      queryParams: { view },
    });
  }

  get filteredMepecos(): IAttentionRecord[] {
    return this.tableComunicaciones
      .filter((item) => !item.verifyPayment)
      .map((attention) => {
        return {
          categoryChannel: {
            name: attention?.channel,
          },
          method: attention.method,
          createdByUser: attention.createdByUser,
          citizen: {
            name: attention?.portfolioDetail?.taxpayerName,
          },
          createdAt: attention?.createdBy,
          result: attention.result,
          consultType: {
            name: attention?.type,
          },
        } as IAttentionRecord;
      });
  }

  get filteredMepecosVerify() {
    return this.tableComunicaciones.filter((item) => item.verifyPayment);
  }

  onTabChange(event: string) {
    this.activeTab = event;
  }
}
