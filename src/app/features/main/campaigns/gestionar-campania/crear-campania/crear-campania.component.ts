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
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AreaCampania } from '@models/area-campania.model';
import { EstadoCampania } from '@models/estado-campania.model';
import { TipoCampania } from '@models/tipo-campania.model';
import { User } from '@models/user.model';
import { MessageGlobalService } from '@services/message-global.service';
import { GeneralServicio } from '@services/servicioGeneral.service';
import { VicidialService } from '@services/vicidial.service';
import { ButtonCancelComponent } from '@shared/buttons/button-cancel/button-cancel.component';
import { AreaCampaniaStore } from '@stores/area-campania.store';
import { AuthStore } from '@stores/auth.store';
import { EstadoCampaniaStore } from '@stores/estado-campania.store';
import { GestionCampaniaStore } from '@stores/gestion-campania.store';
import { TipoCampaniaStore } from '@stores/tipo-campania.store';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ButtonModule } from 'primeng/button';
import { DatePicker } from 'primeng/datepicker';
import { DropdownModule } from 'primeng/dropdown';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FieldsetModule } from 'primeng/fieldset';
import { InputTextModule } from 'primeng/inputtext';
import { RadioButton } from 'primeng/radiobutton';
import { TableModule } from 'primeng/table';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { HorarioService } from '@services/horario.service';
import { IDayWeek, IUpdateHorario } from '@models/horario.model';

@Component({
  selector: 'app-crear-campania',
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
    RadioButton,
    FieldsetModule,
    ButtonCancelComponent,
    CalendarModule,
    CheckboxModule
  ],
  templateUrl: './crear-campania.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  styles: ``,
})
export class CrearCampaniaComponent {
  public readonly ref: DynamicDialogRef = inject(DynamicDialogRef);
  formData!: FormGroup;

  id!: number;
  listArea: AreaCampania[] = [];

  readonly areaCampaniaStore = inject(AreaCampaniaStore);
  readonly tipoCampaniaStore = inject(TipoCampaniaStore);
  readonly gestionCampaniaStore = inject(GestionCampaniaStore);
  readonly estadoCampaniaStore = inject(EstadoCampaniaStore);

  readonly generalServicio = inject(GeneralServicio);

  get estadoCampanias(): EstadoCampania[] {
    return this.estadoCampaniaStore.items()!;
  }

  get areaCampanias(): AreaCampania[] {
    return this.areaCampaniaStore.items()!;
  }

  get tiposCampanias(): TipoCampania[] {
    return this.tipoCampaniaStore.items()!;
  }

  limit = signal(100);
  offset = signal(0);

  readonly authStore = inject(AuthStore);
  get userCurrent(): User {
    return this.authStore.user()!;
  }
  editarCampania: boolean = true;
    private readonly horarioService = inject(HorarioService)

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
    this.formData = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: [''],
      id_tipo_campania: [null, Validators.required],
      id_area_campania: [null, Validators.required],
      id_estado_campania: [null, Validators.required],
      fecha_inicio: [undefined],
      fecha_fin: [undefined],
      fecha_vigencia: [undefined],
      createUser: [''],
      campaniaId: [
        { value: null, disabled: this.editarCampania },
        [Validators.pattern(/^[a-zA-Z0-9]+$/)],
      ],
      horario_inicio: [''], 
      horario_fin: [''],
      feriado: [false],
      dia_inicio: [null],
      dia_fin:[null]
    });

    this.loadData();
    this.getDaysWeek()
  }
    daysWeek = signal<IDayWeek[]>([])
    isAudio = signal<boolean>(false)
    idCampain=0

  
    getDaysWeek(){
    this.horarioService.getDays().subscribe((res)=>{
      this.daysWeek.set(res)
    })
  }


  private resetOnSuccessEffect = effect(() => {
    const item = this.gestionCampaniaStore.selectedItem();
    const error = this.gestionCampaniaStore.error();
    const action = this.gestionCampaniaStore.lastAction();

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

      this.formData.reset({
        code: '',
        message: '',
      });

      this.gestionCampaniaStore.clearSelected();
      this.ref.close(true);
      return;
    }

    if (item) {
      this.id = item.id ?? null;
      this.editarCampania = true;
      this.horarioService.getByCampain(this.id).subscribe((res)=>{
         this.idCampain=res.id
         item.horario_inicio=res.hora_inicio;
         item.horario_fin=res.hora_fin;
         item.dia_inicio=res.dia_inicio;
         item.dia_fin=res.dia_fin;
         item.feriado=res.feriado;
          this.formData.setValue({
        nombre: item.nombre ?? '',
        descripcion: item.descripcion ?? '',
        fecha_inicio: item.fecha_inicio ? new Date(item.fecha_inicio) : null,
        fecha_fin: item.fecha_fin ? new Date(item.fecha_fin) : null,
        fecha_vigencia: item.fecha_vigencia
          ? new Date(item.fecha_vigencia)
          : null,
        id_tipo_campania: item.id_tipo_campania ?? '',
        id_estado_campania: item.id_estado_campania ?? '',
        id_area_campania: item.id_area_campania ?? '',
        createUser: this.config.data.createUser ?? '',
        campaniaId: item.campaniaId ?? null,
        horario_inicio: new Date(`1970-01-01T${item.horario_inicio }`)?? null,
        horario_fin:new Date(`1970-01-01T${item.horario_fin }`)  ?? null,
        feriado: item.feriado ?? false,
        dia_inicio: item.dia_inicio ?? 0,
        dia_fin: item.dia_fin ?? 0
      });
      })
     
    } else {
      // No hay item seleccionado, se resetea el formulario
      this.editarCampania = false;
      this.formData.reset({
        nombre: '',
        descripcion: '',
        id_estado_campania: '',
        fecha_fin: null,
        fecha_inicio: null,
        fecha_vigencia: null,
        id_tipo_campania: '',
        id_area_campania: '',
        horario_inicio: null, // 👈 corregido
        horario_fin: null,
        createUser: '',
        campaniaId: '',
        feriado: false,
        dia_inicio:null,
        dia_fin:null
      });
    }
  });

  loadData() {
    this.areaCampaniaStore.loadAll(this.limit(), this.offset());
    this.tipoCampaniaStore.loadAll(this.limit(), this.offset());
    this.estadoCampaniaStore.loadAll(this.limit(), this.offset());
  }

  guardar() {
    console.log('form',this.formData)
    
    if (this.formData.valid) {
      const request = this.formData.getRawValue();

    
      if (this.id) {
        if (request.id_tipo_campania == 3) {
          let requestVicidialEdit = {
            campaign_name: request.nombre,
          };

          this.vicidialService
            .editarCampania(request.campaniaId, requestVicidialEdit)
            .subscribe((res) => {
              if (res) {

                  if(res.status== "not_found"){
                      this.msg.error('No existe una campaña con ese campaign_id : ' + request.campaniaId);
                  }else{
                      this.msg.success('Campaña fue actualizada correctamente en Vicidial, con ID : ' +  res.data.campaign_id);
                      this.gestionCampaniaStore.update(this.id, { id: this.id,...request});
                      const updateBody:IUpdateHorario={
                        hora_inicio: request.horario_inicio,
                        hora_fin: request.horario_fin,
                        dia_inicio: request.dia_inicio,
                        dia_fin: request.dia_fin,
                        feriado: request.feriado
                      }
                      this.horarioService.putUpdate(this.idCampain,updateBody).subscribe((res)=>{})
                  }
              }
            });
        } else {
          this.gestionCampaniaStore.update(this.id, {
            id: this.id,
            ...request,
          });
        }
      } else {
        request.createUser = this.userCurrent.id;
        request.id_tipo_campania = Number(request.id_tipo_campania);
        request.fecha_inicio = request.fecha_inicio || null;
        request.fecha_fin = request.fecha_fin || null;
        request.fecha_vigencia = request.fecha_vigencia || null;

        if (request.id_tipo_campania == 3) {
          if (!request.campaniaId) {
            this.msg.warn('Ingrese el ID VICIDIAL');
            return;
          }

          let requestVicidial = {
            campaign_id: request.campaniaId,
            campaign_name: request.nombre,
          };

          this.vicidialService
            .create(requestVicidial, 'central/campanias')
            .subscribe((res) => {
              if (res) {
                 if(res.status== "exists"){
                    this.msg.error('Ya existe una campaña con ese campaign_id : ' + res.data.campaign_id);
                 }else{
                    this.msg.success(
                      'Campaña creada correctamente en Vicidial, con ID : ' +
                        res.data.campaign_id
                    );
                  this.gestionCampaniaStore.create(request);
                 }
              }
            });
        } else {
          this.gestionCampaniaStore.create(request);
        }
      }
    }
      
  }

  onCancel() {
    this.ref.close();
  }
}
