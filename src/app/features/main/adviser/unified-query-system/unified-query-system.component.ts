import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  inject,
  Input,
  OnInit,
  signal,
} from '@angular/core';
import { ButtonModule } from 'primeng/button';
import {
  DialogService,
  DynamicDialogConfig,
  DynamicDialogModule,
} from 'primeng/dynamicdialog';
import { CommonModule } from '@angular/common';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { SelectModule } from 'primeng/select';
import {
  CitizenInfo,
  ExternalCitizenService,
} from '@services/externalCitizen.service';
import { TextareaModule } from 'primeng/textarea';
import { FieldsetModule } from 'primeng/fieldset';
import { TableModule } from 'primeng/table';
import { OmnicanalidadService } from '@services/api-sat/omnicanalidad.service';
import { SaldomaticoService } from '@services/api-sat/saldomatico.service';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { TabsModule } from 'primeng/tabs';
import { CitizenAssistanceService } from '@services/citizen-assistance.service';
import { CitizenAssistance } from '@models/citizen-assistance.model';
import { BtnCustomComponent } from '@shared/buttons/btn-custom/btn-custom.component';
import { pauseCodeAgent } from '@constants/pause-code-agent.constant';
import { CardModule } from 'primeng/card';
import { ConsultTypeStore } from '@stores/consult-type.store';
import { TypeIdeDocStore } from '@stores/type-ide-doc.store';
import { ConsultType } from '@models/consult-type.modal';
import { TypeIdeDoc } from '@models/type-ide-doc.model';
import { ChannelAssistanceService } from '@services/channel-assistance.service';
import { ChannelCitizenService } from '@services/channel-citizen.service';
import { IAttentionRecord } from '@interfaces/features/main/unified-query-system/attentionRecord.interface';
import { QueryHistoryComponent } from '@shared/modal/query-history/query-history.component';
import { MessageGlobalService } from '@services/generic/message-global.service';
import { CategoryChannelStore } from '@stores/category-channel.store';
import { CategoryChannel } from '@models/category-channel.model';
import { GenericAssistanceService } from '@services/generic-assistance.service';

@Component({
  selector: 'app-unified-query-system',
  imports: [
    CommonModule,
    BreadcrumbModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    SelectModule,
    TextareaModule,
    FieldsetModule,
    TableModule,
    TabsModule,
    SelectModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    ButtonModule,
    CardModule,
    BtnCustomComponent,
    DynamicDialogModule,
  ],
  providers: [DialogService],
  templateUrl: './unified-query-system.component.html',
  styles: ``,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class UnifiedQuerySistemComponent implements OnInit {
  _documentToSearch?: string;
  @Input() set documentToSearch(val: string) {
    this._documentToSearch = val;
    this.search();
  }

  get documentToSearch(): string | undefined {
    return this._documentToSearch;
  }

  openModal: boolean = false;

  showConfigDialog: boolean = false;
  showInfoDialog: boolean = false;

  public readonly config = inject(DynamicDialogConfig, { optional: true });

  private readonly dialogService = inject(DialogService);

  private readonly msg = inject(MessageGlobalService);

  private readonly citizenAssistanceService = inject(CitizenAssistanceService);

  private readonly channelAssistanceService = inject(ChannelAssistanceService);

  private readonly genericAssistanceService = inject(GenericAssistanceService);

  private readonly channelCitizenService = inject(ChannelCitizenService);

  private readonly omnicanalidadService = inject(OmnicanalidadService);

  private readonly saldomaticoService = inject(SaldomaticoService);

  private readonly externalCitizenService = inject(ExternalCitizenService);

  private readonly categoryChannelStore = inject(CategoryChannelStore);

  private readonly consultTypeStore = inject(ConsultTypeStore);

  private readonly typeIdeDocStore = inject(TypeIdeDocStore);

  formData = new FormGroup({
    idCampaign: new FormControl<string | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  get listCategoryChannels(): CategoryChannel[] {
    return this.categoryChannelStore
      .items()
      .concat(...[{ id: 0, name: 'Otros' }]);
  }

  get consultTypeList(): ConsultType[] {
    return this.consultTypeStore.items();
  }

  get typeIdeDocList(): TypeIdeDoc[] {
    return this.typeIdeDocStore.items();
  }

  getPauseCodeValue(code: string): string {
    return pauseCodeAgent.find((p) => p.code === code)?.name!;
  }

  tabSelected = 0;

  listtypeDeuda = [
    {
      code: 3,
      label: 'Multas administrativas',
    },
    {
      code: 1,
      label: 'Deudas tributarias',
    },
    {
      code: 2,
      label: 'Deudas no tributarias',
    },
  ];

  listtypeTributo = [
    {
      code: 1,
      label: 'Impuesto predial',
    },
    {
      code: 2,
      label: 'Impuesto vehicular',
    },
  ];

  typeDeuda = 3;
  typeTributo = 1;

  tableDeudas: any[] = [];

  tableImpuestoPredial: any[] = [];

  tableImpuestoVehicular: any[] = [];

  tablePapeletas: any[] = [];

  tableTramites: any[] = [];

  searchText?: string;

  channelSelected?: number = 1;

  tableComunicaciones: CitizenAssistance[] = [];

  tableChannelAllAttentions: IAttentionRecord[] = [];

  get tableChannelAttentionsFiltered(): IAttentionRecord[] {
    return [
      ...this.tableChannelAllAttentions,
      ...this.tableChannelAssistances,
      ...this.tableGenericAssistances.map((x) => ({
        ...x,
        categoryChannel: { id: 0 },
      })),
    ].filter((x) => x.categoryChannel?.id == this.channelSelected);
  }

  tableChannelAssistances: IAttentionRecord[] = [];

  tableGenericAssistances: IAttentionRecord[] = [];

  ngOnInit(): void {
    const doc = this.config?.data?.documentToSearch;
    this.categoryChannelStore.loadAll();
    if (doc) {
      this.searchText = doc;
      this.search();
    }
  }

  ngOnDestroy(): void {}

  getAtenciones(doc?: string) {
    if (doc) {
      this.citizenAssistanceService.findByDocIde(doc).subscribe({
        next: (data) => {
          this.tableComunicaciones = data;
        },
      });
      this.channelAssistanceService.findByDocIdentityTyped(doc).subscribe({
        next: (data) => {
          if (!data) return;
          this.tableChannelAssistances = data;
        },
      });

      this.genericAssistanceService.findByDocIdentityTyped(doc).subscribe({
        next: (data) => {
          if (!data) return;
          this.tableGenericAssistances = data;
        },
      });

      this.channelCitizenService.getAssistancesByDocumentNumber(doc).subscribe({
        next: (response) => {
          if (response?.success && response?.data && response.data.length) {
            let channelAttentions: IAttentionRecord[] = response.data.map(
              (attention) => {
                return {
                  categoryChannel: {
                    id: attention?.categoryChannelId,
                    name: attention?.channel,
                  },
                  method: 'CHAT',
                  createdByUser: {
                    displayName: attention?.advisorIntervention
                      ? attention.user
                      : 'BOT',
                  },
                  citizen: {
                    name: attention?.email,
                  },
                  createdAt: attention?.startDate,
                  result: 'Contacto',
                  consultType: {
                    name: attention?.type,
                  },
                  queryHistory: attention.queryHistory,
                };
              }
            );

            this.tableChannelAllAttentions = [
              ...this.tableChannelAllAttentions,
              ...channelAttentions,
            ];
          }
        },
      });
    }
  }

  showQueryHistory(item: IAttentionRecord) {
    const ref = this.dialogService.open(QueryHistoryComponent, {
      header: 'Historial de Consultas',
      styleClass: 'modal-3xl',
      modal: true,
      data: {
        queryHistory: item.queryHistory,
      },
      focusOnShow: false,
      dismissableMask: true,
      closable: true,
    });
  }

  getCitizenSelected(doc?: string) {
    if (doc) {
      this.loadingCitizen = true;
      this.externalCitizenService
        .getCitizenInformation({
          psiTipConsulta: 2,
          piValPar1: !isNaN(Number.parseInt(doc)) && doc.length == 8 ? 2 : 1,
          pvValPar2: doc,
        })
        .subscribe({
          next: (res) => {
            this.citizen = res[0];
            this.existCitizen = res.length != 0;
            this.loadingCitizen = false;
          },
          error: (e) => {
            this.msg.error(
              e?.error?.message ||
                'No se pudo encontrar los datos del ciudadano'
            );
          },
        });
    }
  }

  getChannelAssistances(doc?: string) {
    if (doc) {
      this.citizenAssistanceService.findByDocIde(doc).subscribe({
        next: (data) => {
          this.tableComunicaciones = data;
        },
      });
    }
  }

  getImpuestoPredial(doc?: string) {
    if (doc) {
      this.saldomaticoService
        .impuestoPredialInfo(
          !isNaN(Number.parseInt(doc)) && doc.length == 8
            ? 2
            : doc.length == 7
            ? 5
            : 1,
          doc
        )
        .subscribe({
          next: (data) => {
            this.tableImpuestoPredial = data;
          },
        });
    }
  }

  getImpuestoVehicular(code?: string) {
    const doc = this.documentToSearch || this.searchText;

    if (doc) {
      this.saldomaticoService
        .impuestoVehicularInfo(
          !isNaN(Number.parseInt(doc)) && doc.length == 8
            ? 2
            : doc.length == 7
            ? 5
            : 1,
          doc
        )
        .subscribe({
          next: (data) => {
            this.tableImpuestoVehicular = data;
          },
        });
    }
  }

  getPapeletaInfo(doc?: string) {
    if (doc) {
      this.omnicanalidadService
        .consultarPapeleta(
          !isNaN(Number.parseInt(doc)) && doc.length == 8 ? 2 : 1,
          doc
        )
        .subscribe({
          next: (data) => {
            this.tablePapeletas = data;
          },
        });
    }
  }

  getMultaAdm(doc?: string) {
    if (doc) {
      console.log('getMultaAdm', doc);
      this.omnicanalidadService
        .consultarMultaAdm(
          !isNaN(Number.parseInt(doc)) && doc.length == 8 ? 2 : 1,
          doc
        )
        .subscribe({
          next: (data) => {
            this.tableDeudas = data;
          },
        });
    }
  }

  getTramites(doc?: string) {
    if (doc) {
      this.omnicanalidadService
        .consultarTramite(
          !isNaN(Number.parseInt(doc)) && doc.length == 8 ? 2 : 1,
          doc
        )
        .subscribe({
          next: (data) => {
            this.tableTramites = data;
          },
        });
    }
  }

  search() {
    const doc = this.documentToSearch || this.searchText;
    this.clear(false);
    this.getCitizenSelected(doc);
    this.getMultaAdm(doc);
    this.getImpuestoPredial(doc);
    this.getImpuestoVehicular(doc);
    this.getPapeletaInfo(doc);
    this.getTramites(doc);
    this.getAtenciones(doc);
    this.getChannelAssistances(doc);
  }

  clear(force: boolean = true) {
    if (force) this.searchText = undefined;
    this.existCitizen = false;
    this.citizen = undefined;
    this.tableDeudas = [];
    this.tableImpuestoPredial = [];
    this.tablePapeletas = [];
    this.tableTramites = [];
    this.tableComunicaciones = [];
    this.tableChannelAllAttentions = [];
    this.tableChannelAssistances = [];
  }

  loadingCitizen: boolean = false;

  citizen?: CitizenInfo;

  existCitizen: boolean = false;
}
