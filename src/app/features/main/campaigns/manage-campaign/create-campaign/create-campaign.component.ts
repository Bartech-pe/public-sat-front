import { CommonModule } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  effect,
  Inject,
  inject,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { User } from '@models/user.model';
import { MessageGlobalService } from '@services/generic/message-global.service';
import { VicidialService } from '@services/vicidial.service';
import { ButtonCancelComponent } from '@shared/buttons/button-cancel/button-cancel.component';
import { AuthStore } from '@stores/auth.store';
import { CampaignStateStore } from '@stores/campaign-state.store';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ButtonModule } from 'primeng/button';
import { DatePicker } from 'primeng/datepicker';
import { DropdownModule } from 'primeng/dropdown';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FieldsetModule } from 'primeng/fieldset';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { ScheduleService } from '@services/schedule.service';
import { IDayWeek } from '@models/schedule.model';
import { Department } from '@models/department.model';
import { DepartmentStore } from '@stores/department.store';
import { CampaignTypeStore } from '@stores/campaign-type.store';
import { CampaignState } from '@models/campaign-state.model';
import { CampaignType } from '@models/campaign-type.model';
import { CampaignStore } from '@stores/campaign.store';
import { KeyFilterModule } from 'primeng/keyfilter';

@Component({
  selector: 'app-create-campaign',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    FormsModule,
    TableModule,
    InputTextModule,
    BreadcrumbModule,
    DatePicker,
    DropdownModule,
    FieldsetModule,
    ButtonCancelComponent,
    CalendarModule,
    KeyFilterModule,
    CheckboxModule,
  ],
  templateUrl: './create-campaign.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  styles: ``,
})
export class CreateCampaignComponent {
  public readonly ref: DynamicDialogRef = inject(DynamicDialogRef);

  // this.formData = this.fb.group({
  //     name: ['', Validators.required],
  //     description: [''],
  //     campaignTypeId: [null, Validators.required],
  //     departmentId: [null, Validators.required],
  //     campaignStateId: [null, Validators.required],
  //     startDate: [undefined],
  //     endDate: [undefined],
  //     validUntil: [undefined],
  //     createUser: [''],
  //     vdCampaignId: [
  //       { value: undefined, disabled: this.editarCampania },
  //       [Validators.pattern(/^[a-zA-Z0-9]+$/)],
  //     ],
  //     startTime: [''],
  //     endTime: [''],
  //     applyHoliday: [false],
  //     startDay: [null],
  //     endDay: [null],
  //   });
  formData = new FormGroup({
    name: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    description: new FormControl<string | undefined>(undefined, {
      nonNullable: true,
    }),
    campaignTypeId: new FormControl<number | undefined>(3, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    departmentId: new FormControl<number | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    campaignStateId: new FormControl<number | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    startDate: new FormControl<Date | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    endDate: new FormControl<Date | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    validUntil: new FormControl<Date | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    vdCampaignId: new FormControl<string | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required]
    }),
    startTime: new FormControl<Date | undefined>(undefined, {
      nonNullable: true,
      validators: [],
    }),
    endTime: new FormControl<Date | undefined>(undefined, {
      nonNullable: true,
      validators: [],
    }),
    startDay: new FormControl<number | undefined>(undefined, {
      nonNullable: true,
      validators: [],
    }),
    endDay: new FormControl<number | undefined>(undefined, {
      nonNullable: true,
      validators: [],
    }),
    applyHoliday: new FormControl<boolean>(true, {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  id!: number;

  readonly departmentStore = inject(DepartmentStore);
  readonly campaignTypeStore = inject(CampaignTypeStore);
  readonly campaignStore = inject(CampaignStore);
  readonly estadoCampaniaStore = inject(CampaignStateStore);

  // readonly campaignService = inject(CampaignService);

  get estadoCampanias(): CampaignState[] {
    return this.estadoCampaniaStore.items();
  }

  get departmentList(): Department[] {
    return this.departmentStore.items();
  }

  get tiposCampanias(): CampaignType[] {
    return this.campaignTypeStore.items();
  }

  readonly authStore = inject(AuthStore);
  get userCurrent(): User {
    return this.authStore.user()!;
  }
  editarCampania: boolean = true;
  private readonly scheduleService = inject(ScheduleService);

  constructor(
    public config: DynamicDialogConfig,
    private fb: FormBuilder,
    private msg: MessageGlobalService,
    private vicidialService: VicidialService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    if (this.config.data) {
      this.editarCampania = true;
    } else {
      this.editarCampania = false;
    }
  }

  ngOnInit(): void {
    this.loadData();
    this.getDaysWeek();
  }
  daysWeek = signal<IDayWeek[]>([]);
  isAudio = signal<boolean>(false);
  idCampain = 0;

  getDaysWeek() {
    this.scheduleService.getDays().subscribe((res) => {
      this.daysWeek.set(res);
    });
  }

  private resetOnSuccessEffect = effect(() => {
    const item = this.campaignStore.selectedItem();
    const error = this.campaignStore.error();
    const action = this.campaignStore.lastAction();

    // Manejo de errores
    if (error) {
      console.log('error', error);
      this.msg.error(
        error ?? '¡Ups, ocurrió un error inesperado al guardar el ¡¡Campaña!'
      );
      return; // Salimos si hay un error
    }

    // Si se ha creado o actualizado correctamente
    if (action === 'created' || action === 'updated') {
      this.msg.success(
        action === 'created'
          ? '¡Campaña creado exitosamente!'
          : '¡Campaña actualizado exitosamente!'
      );

      this.campaignStore.clearSelected();
      this.ref.close(true);
      return;
    }

    if (item) {
      this.id = item.id;
      this.editarCampania = true;
         console.log(item)
      this.scheduleService.getByCampain(this.id).subscribe((res) => {

        const startDate = item.startTime ? new Date(item.startTime) : null;
       const endDate = item.endTime ? new Date(item.endTime) : null;

        // this.idCampain = res.id;
        // item.startTime = res.startTime;
        // item.endTime = res.endTime;
        // item.startDay = res.startDay;
        // item.endDay = res.endDay;
        // item.applyHoliday = res.applyHoliday;
        this.formData.setValue({
          name: item.name,
          description: item.description,
          startDate: item.startDate ? new Date(item.startDate) : undefined,
          endDate: item.endDate ? new Date(item.endDate) : undefined,
          validUntil: item.validUntil ? new Date(item.validUntil) : undefined,
          campaignTypeId: item.campaignTypeId,
          campaignStateId: item.campaignStateId,
          departmentId: item.departmentId,
          vdCampaignId: item.vdCampaignId,
          startTime: startDate
            ? new Date(1970, 0, 1, startDate.getHours(), startDate.getMinutes())
            : undefined,
          endTime: endDate
            ? new Date(1970, 0, 1, endDate.getHours(), endDate.getMinutes())
            : undefined,
          applyHoliday: item.applyHoliday ?? false,
          startDay: item.startDay ?? 0,
          endDay: item.endDay ?? 0,
        });
      });
    }
  });

  loadData() {
    this.departmentStore.loadAll();
    this.campaignTypeStore.loadAll();
    this.estadoCampaniaStore.loadAll();
  }

  guardar() {
    console.log('form', this.formData.value);

    if (this.formData.valid) {
      const request = this.formData.getRawValue();
      //request.vdCampaignId = request.vdCampaignId?.toString() ?? '';


      if (this.id) {
        if (request.campaignTypeId == 3) {
          let requestVicidialEdit = {
            campaign_name: request.name,
          };

          this.vicidialService.editarCampania(request.vdCampaignId!, requestVicidialEdit)
            .subscribe((res) => {
              if (res) {
                if (res.status == 'not_found') {
                  this.msg.error(
                    'No existe una campaña con ese campaign_id : ' +
                      request.vdCampaignId
                  );
                } else {
                  this.msg.success(
                    'Campaña fue actualizada correctamente en Vicidial, con ID : ' +
                      res.data.campaign_id
                  );
                  this.campaignStore.update(this.id, {
                    id: this.id,
                    ...request,
                  });
                  // const updateBody: IUpdateSchedule = {
                  //   startTime: request.startTime,
                  //   endTime: request.endTime,
                  //   startDay: request.startDay,
                  //   endDay: request.endDay,
                  //   applyHoliday: request.applyHoliday,
                  // };
                  // this.ScheduleService
                  //   .putUpdate(this.idCampain, updateBody)
                  //   .subscribe((res) => {});
                }
              }
            });
        } else {
          this.campaignStore.update(this.id, {
            id: this.id,
            ...request,
          });
        }
      } else {
        if (request.campaignTypeId == 3) {
          if (!request.vdCampaignId) {
            this.msg.warn('Ingrese el ID VICIDIAL');
            return;
          }

          let requestVicidial = {
            campaign_id: request.vdCampaignId,
            campaign_name: request.name,
          };

          this.vicidialService
            .create(requestVicidial, 'central/campanias')
            .subscribe((res) => {
              if (res) {
                if (res.status == 'exists') {
                  this.msg.error(
                    'Ya existe una campaña con ese campaign_id : ' +
                      res.data.campaign_id
                  );
                } else {
                  this.msg.success(
                    'Campaña creada correctamente en Vicidial, con ID : ' +
                      res.data.campaign_id
                  );
                  this.campaignStore.create(request);
                }
              }
            });
        } else {
          this.campaignStore.create(request);
        }
      }
    }
  }

  onCancel() {
    this.ref.close();
  }
}
