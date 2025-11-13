import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, inject, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UnifiedQuerySistemComponent } from '@features/main/adviser/unified-query-system/unified-query-system.component';
import { IBaseResponseDto } from '@interfaces/commons/base-response.interface';
import { PhoneFormatPipe } from '@pipes/phone-format.pipe';
import { ChannelAttentionService } from '@services/channel-attention.service';
import { ChannelCitizenService, IChannelCitizen } from '@services/channel-citizen.service';
import { CitizenInfo, ExternalCitizenService } from '@services/externalCitizen.service';
import { DialogService, DynamicDialogModule } from 'primeng/dynamicdialog';

// Interface para el tipo de datos del contacto

@Component({
  selector: 'app-citizen-information',
  imports: [
    CommonModule,
    DynamicDialogModule,
    PhoneFormatPipe
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [DialogService],
  templateUrl: './citizen-information.component.html',
  styles: `
    :host {
      display: block;
      height: 100%;
    }
  `
})
export class CitizenInformationComponent implements OnInit {
  contactData: CitizenInfo | null = null;
  isLoading: boolean = false;
  channelCitizen: IChannelCitizen | null = null;
  channelRoomId: number | null = null;
  // private readonly dialogService = inject(DialogService);
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dialogService: DialogService,
    private readonly externalCitizenService: ExternalCitizenService,
    private readonly channelCitizenService: ChannelCitizenService
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      if (!params.get('channelRoomId') || !params.get('assistanceId')) {
        this.contactData = null
        return;
      }
      const channelRoomId = params.get('channelRoomId');
      this.channelRoomId = Number(channelRoomId);
      this.channelCitizenService.getCitizenInformationByChannelRoomAssigned(Number(channelRoomId)).subscribe((response: IBaseResponseDto<IChannelCitizen>) =>{
        if(response.success && response?.data)
        {
          this.channelCitizen = response.data
          this.getContactData()
        }
      })
    });

  }

  getContactData()
  {
    if(this.channelCitizen?.documentNumber)
    {
      this.externalCitizenService.getCitizenInformation({
        piValPar1: 2,
        psiTipConsulta: 2,
        pvValPar2: this.channelCitizen?.documentNumber
      }).subscribe((response : CitizenInfo[]) => {
        if(response.length)
        {
          this.contactData = response[0];
        }else{
          this.contactData = {
            vdocIde: this.channelCitizen?.documentNumber?? '',
            vcontacto: this.channelCitizen?.fullName?? '',
            vnumTel: this.channelCitizen?.phoneNumber?? '',
            vtipDoc: this.channelCitizen?.documentType?? '',
            email: this.channelCitizen?.email?? ''
          }
        }
      })
    }
  }

  getFormattedPhone(): string {
    return this.contactData?.vnumTel ? `${this.contactData.vnumTel}` : '';
  }

  getContactType(): string {
    if (!this.contactData?.vtipDoc) return 'Contacto';
    return this.contactData.vtipDoc === 'RUC' ? 'Empresa' : 'Persona Natural';
  }

  getBusinessCategory(): string {
    if (!this.contactData?.vcontacto) return 'Servicios Empresariales';
    const name = this.contactData.vcontacto.toLowerCase();

    if (name.includes('contratista') || name.includes('construccion')) {
      return 'Construcción Profesional';
    }
    return 'Servicios Empresariales';
  }

  // Métodos para acciones
  onReloadData(): void {
    this.getContactData()
  }

  onDocumentClick(): void {
    const ref = this.dialogService.open(UnifiedQuerySistemComponent, {
          header: 'Sistema de Consulta Unificada',
          styleClass: 'modal-6xl',
          data:{
            documentToSearch: this.channelCitizen?.documentNumber
          },
          modal: true,
          focusOnShow: false,
          dismissableMask: false,
          closable: true,
        });

  }

  onPhoneClick(): void {
    if (this.contactData?.vnumTel) {
      window.open(`tel:+51${this.contactData.vnumTel}`, '_self');
    }
  }

  onWhatsAppClick(): void {
    if (this.contactData?.vnumTel) {
      const message = encodeURIComponent(`Hola ${this.contactData.vcontacto}`);
      window.open(`https://wa.me/51${this.contactData.vnumTel}?text=${message}`, '_blank');
    }
  }

  onLocationClick(): void {
    console.log('Location clicked');
  }

  onStatusClick(): void {
    console.log('Status clicked');
  }

  onTypeClick(): void {
    console.log('Type clicked');
  }
}
