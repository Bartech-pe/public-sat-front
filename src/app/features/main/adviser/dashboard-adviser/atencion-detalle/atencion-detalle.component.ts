import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CalendarModule } from 'angular-calendar';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { ChipModule } from 'primeng/chip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { PaginatorModule } from 'primeng/paginator';
import { SelectButtonModule } from 'primeng/selectbutton';
import { SplitButtonModule } from 'primeng/splitbutton';
import { TableModule } from 'primeng/table';
import { TabsModule } from 'primeng/tabs';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-atencion-detalle',
  imports: [
    TableModule,
    SplitButtonModule,
    SelectButtonModule,
    CalendarModule,
    DialogModule,
    TableModule,
    InputTextModule,
    PaginatorModule,
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    MultiSelectModule,
    TableModule,
    TagModule,
    CheckboxModule,
    IconFieldModule,
    InputIconModule,
    DropdownModule,
    ToastModule,
    ConfirmDialogModule,
    ChipModule,
    ButtonModule,
    TabsModule,
  ],
  templateUrl: './atencion-detalle.component.html',
  styles: ``,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AtencionDetalleComponent implements OnInit {
  formularioActividades: FormGroup;
  formularioNotas: FormGroup;
  formularioArchivo: FormGroup;
  formularioComenterio: FormGroup;
  formularioTicket: FormGroup;
  formularioCredencialCliente: FormGroup;
  formularioTransferencia: FormGroup;
  formularioTarjeta: FormGroup;
  formularioCrypto: FormGroup;
  formularioPago: FormGroup;
  formularioPerdido: FormGroup;
  formularioCuentaCliente: FormGroup;

  listadofasePipeline: any[] = [];
  items: MenuItem[] = [];
  deal: any = {};
  listadocuentaClientes: any = [];
  listadoTicketClientes: any = [];
  listadoCredencialesCliente: any = [];
  displayDialogArchivo: boolean = false;
  listadoetadoDeal = [
    { id: 50, nombre: 'Nuevo' },
    { id: 51, nombre: 'Esperando al contacto' },
    { id: 52, nombre: 'Cerrado' },
  ];
  listadoEstadoTicket: any;
  listadoTipoTransferencias: any;
  listadoMoneda: any;
  listadoClienteNotas: any;
  listadoTipoCuenta: any;
  listadoTipoTicket: any;
  listadoComentariosDeal: any;
  listadoModedaCryto: any;
  listadoActividades: any;
  listadoActividadesLead: any;
  displayDialogCredencialCliente: boolean = false;
  displayDialogTicket: boolean = false;
  displayDialogNota: boolean = false;
  displayDialogActividad: boolean = false;
  displayDialogpago: boolean = false;
  displayDialogperdido: boolean = false;

  value: number = 0;

  constructor(private fb: FormBuilder) {
    this.formularioActividades = this.fb.group({
      id: null,
      titulo: ['', Validators.required],
      descripcion: ['', Validators.required],
      fecha: null,
      hora: null,
      ubicacionMeet: null,
      idDeal: null,
      recordatorio: [false],
      idActividad: ['', Validators.required],
    });

    this.formularioNotas = this.fb.group({
      id: null,
      descripcion: ['', Validators.required],
      fecha: null,
      hora: null,
      recordatorio: [false],
      idDeal: null,
    });

    this.formularioArchivo = this.fb.group({
      id: null,
      nombre: ['', Validators.required],
      archivo: [null, Validators.required],
      idDeal: null,
    });

    this.formularioComenterio = this.fb.group({
      id: null,
      descripcion: ['', Validators.required],
      idPersonal: null,
      rating: ['', Validators.required],
      idDeal: null,
    });

    this.formularioTicket = this.fb.group({
      id: null,
      monto: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
      comentario: null,
      demo: [false],
      idTipoTransferencia: null,
      idTipoTicket: null,
      idMoneda: ['', [Validators.required]],
      idMedioPago: null,
      idCliente: null,
      idBankTransfer: null,
      bankTransfer: null,
      idCardTransfer: null,
      cryptoTransfer: null,
      idCryptoTransfer: null,
      idCuentaCliente: ['', [Validators.required]],
    });

    this.formularioCredencialCliente = this.fb.group({
      id: null,
      usuario: ['', Validators.required],
      password: ['', Validators.required],
      idTipoCuenta: ['', Validators.required],
      idMoneda: ['', Validators.required],
      idCliente: null,
      estado: false,
    });

    this.formularioTransferencia = this.fb.group({
      cantidad: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      nombre_beneficiario: ['', Validators.required],
      num_cuenta_bancaria: ['', Validators.required],
      id_tipo_banco: ['', Validators.required],
      codigo_banco: ['', Validators.required],
      pais: [''],
      ciudad: [''],
    });

    this.formularioTarjeta = this.fb.group({
      cantidad: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      pais: [''],
      ciudad: [''],
      num_tarjeta: ['', Validators.required],
      titular_tarjeta: ['', Validators.required],
    });

    this.formularioCrypto = this.fb.group({
      cantidad: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      pais: [''],
      ciudad: [''],
      red: ['', Validators.required],
      id_moneda_crypto: ['', Validators.required],
      direccion_wallet: ['', Validators.required],
    });

    this.formularioPago = this.fb.group({
      id: null,
      valorGanado: ['', Validators.required],
      fechaCierre: [null, Validators.required],
    });

    this.formularioPerdido = this.fb.group({
      id: null,
      razonPerdida: ['', Validators.required],
      fechaCierre: [null, Validators.required],
    });

    this.formularioCuentaCliente = this.fb.group({
      id: null,
      alias: null,
      saldo: [0, Validators.required],
      idMoneda: [null, Validators.required],
    });
  }

  ngOnInit(): void {}

  selectedFases(payload: any) {
    // const request = {
    //   id: this.idDeal,
    //   idFasePipeline: payload.id,
    // };
    // this.dealService.updateDeal(request.id, request).subscribe((response) => {
    //   this.msg.success('Creado correctamente');
    //   this.obtenerActividades(this.idDeal);
    //   this.mostrasFasesDeal();
    // });
  }

  agregarEtiquetas(item: any) {
    // const ref = this.dialogService.open(FormEtiquetaComponent, {
    //   showHeader: false,
    //   dismissableMask: true,
    //   data: { id: item.id, etiquetas: item.etiquetas },
    //   styleClass: 'modal-crm-xs pt-6 rounded-t-lg',
    //   position: 'top',
    // });
    // ref.onClose.subscribe(() => {
    //   //this.getFases();
    // });
  }

  filtrarOperacionesPorCuenta(event: any) {
    // this.cuentaSimbolo = event.value.moneda.simbolo;
    // this.montoTotal = event.value.saldo;
  }

  getEtiquetas(deal: any) {
    // return deal.etiquetas ? deal.etiquetas : [];
  }

  ocultarcontenedor = false;

  ocultarDiv() {
    this.ocultarcontenedor = false;
  }

  ocultarMostraoDiv() {
    this.ocultarcontenedor = true;
  }

  onFileSelected(event: any) {}

  getActividadesPorId(idActividad: any) {
    return this.listadoActividadesLead.filter(
      (lead: any) => lead.idActividad === idActividad
    );
  }
}
