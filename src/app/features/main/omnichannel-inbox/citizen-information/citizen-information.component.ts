import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, Input, OnInit } from '@angular/core';

// Interface para el tipo de datos del contacto
interface ContactData {
  vcontacto: string;
  vnumTel: string;
  vtipDoc: string;
  vdocIde: string;
}

@Component({
  selector: 'app-citizen-information',
  imports: [CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './citizen-information.component.html',
  styles: `
    :host {
      display: block;
      height: 100%;
    }
  `
})
export class CitizenInformationComponent implements OnInit {

  // Datos del contacto
  @Input() contactData: ContactData | null = null;

  // Estado de carga
  @Input() isLoading: boolean = false;

  constructor() {}

  ngOnInit(): void {
    console.log('Contact data loaded:', this.contactData);
  }

  // Métodos simplificados
  getShortName(fullName: string): string {
    if (!fullName) return 'Empresa';
    const words = fullName.split(' ');
    return words.length <= 3 ? fullName : words.slice(0, 3).join(' ');
  }

  getSubtitle(fullName: string): string {
    if (!fullName) return 'Sin información';
    const words = fullName.split(' ');
    return words.length <= 3 ? 'EMPRESA' : words.slice(3).join(' ');
  }

  getFormattedPhone(): string {
    return this.contactData?.vnumTel ? `+51 ${this.contactData.vnumTel}` : '';
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
    console.log('Reload data clicked');
  }

  onDocumentClick(): void {
    console.log('Document clicked');
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
