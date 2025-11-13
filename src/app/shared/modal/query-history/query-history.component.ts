import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';

interface QueryHistory {
  id: number;
  queryType: string;
  documentType: string;
  attentionId: number;
  documentValue: string;
  status: boolean;
  createdAt: string;
  updatedAt: string;
}

@Component({
  selector: 'app-query-history',
  standalone: true,
  imports: [CommonModule, TableModule, TagModule],
  templateUrl: './query-history.component.html',
  styles: ``,
})
export class QueryHistoryComponent implements OnInit {
  public readonly ref: DynamicDialogRef = inject(DynamicDialogRef);
  public readonly config = inject(DynamicDialogConfig);

  queryHistory: QueryHistory[] = [];

  ngOnInit(): void {
    if (this.config.data?.queryHistory) {
      this.queryHistory = this.config.data.queryHistory;
    }
  }

  getQueryTypeLabel(queryType: string): string {
    const types: { [key: string]: string } = {
      tickets_by_ruc: 'Tickets por RUC',
      tickets_by_dni: 'Tickets por DNI',
      tickets_by_code: 'Tickets por Código',
      citizen_search: 'Búsqueda de Ciudadano',
      attention_detail: 'Detalle de Atención',
      tickets_by_plate: 'Papeletas por placa',
      infraction_code: 'Código de infracción',
      taxes_by_plate: 'Impuestos por placa',
      taxes_by_dni: 'Impuestos por DNI',
      taxes_by_ruc: 'Impuestos por RUC',
      taxes_by_taxpayer_code: 'Impuestos por código de contribuyente',
      capture_order_by_plate: 'Orden de captura por placa',
      procedure_by_number: 'Procedimiento por número',
    };
    return types[queryType] || queryType;
  }
  getDocumentTypeLabel(documentType: string): string {
    const types: { [key: string]: string } = {
      ruc: 'RUC',
      dni: 'DNI',
      plate: 'Placa',
      infraction_code: 'Código de infracción',
      taxpayer_code: 'Código de contribuyente',
      procedure_number: 'Número de procedimiento',
    };
    return types[documentType] || documentType.toUpperCase();
  }

  onClose(): void {
    this.ref.close();
  }
}
