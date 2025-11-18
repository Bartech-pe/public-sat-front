import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ColorPickerModule } from 'primeng/colorpicker';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { DialogService } from 'primeng/dynamicdialog';

import { MessageGlobalService } from '@services/generic/message-global.service';
import { FormPredefinedComponent } from './form-predefined/form-predefined.component';
import { PredefinedResponsesStore } from '@stores/predefined.store';
import { PredefinedResponses } from '@models/predefined-response.model';
import { CommonModule } from '@angular/common';
import { ButtonSaveComponent } from '@shared/buttons/button-save/button-save.component';
import { CategoryChannelStore } from '@stores/category-channel.store';
import { CategoryChannel } from '@models/category-channel.model';
import { TabsModule } from 'primeng/tabs';
import { PredefinedResponsesService } from '@services/predefined.service';
import { CompleteTableComponent } from '@shared/table/complete-table/complete-table.component';
import { ColumnDefinition, SortField } from '@models/column-table.models';

@Component({
  selector: 'app-predefined-responses',
  imports: [
    CommonModule,
    TabsModule,
    TableModule,
    InputTextModule,
    ColorPickerModule,
    ButtonModule,
    FormsModule,
    BreadcrumbModule,
    CompleteTableComponent,
    ButtonSaveComponent,
  ],
  templateUrl: './predefined-responses.component.html',
  styles: ``,
})
export class PredefinedResponsesComponent implements OnInit {
  title: string = 'Respuestas predefinidas';
  descripcion: string =
    'Las respuestas predefinidas son plantillas preconfiguradas que le ayudan a responder rápidamente a una conversación';

  createButtonLabel: string = 'Nueva Respuesta';

  openModal: boolean = false;

  private readonly msg = inject(MessageGlobalService);

  private readonly dialogService = inject(DialogService);

  readonly categoryChannelStore = inject(CategoryChannelStore);

  readonly store = inject(PredefinedResponsesStore);

  readonly service = inject(PredefinedResponsesService);

  cols!: ColumnDefinition[];

  orderBy: SortField[] = [
    {
      name: 'Nombre',
      field: 'name',
      type: 'string',
    },
  ];

  get listCategoryChannels(): CategoryChannel[] {
    return this.categoryChannelStore.items().filter((item) => item.id !== 1);
  }

  activeTab: number = 2;

  limit = signal(10);
  offset = signal(0);

  get totalItems(): number {
    return this.store.totalItems();
  }

  get dataTable(): PredefinedResponses[] {
    return this.store.items();
  }

  private resetOnSuccessEffect = effect(() => {
    const error = this.store.error();
    const action = this.store.lastAction();

    // Manejo de errores
    if (!this.openModal && error) {
      console.log('error', error);
      this.msg.error(
        error ??
          '¡Ups, ocurrió un error inesperado al eliminar la respuesta predefinida!'
      );
      return; // Salimos si hay un error
    }

    // Si se ha creado o actualizado correctamente
    if (action === 'deleted') {
      this.msg.success('¡Respuesta predefinida eliminada exitosamente!');
      this.store.clearAll();
      this.loadData();
      return;
    }
  });

  ngOnInit(): void {
    this.cols = [
      {
        fields: [
          { field: 'title' },
          { field: 'description', textClass: 'text-xs font-light italic' },
        ],
        header: 'Título',
        align: 'start',
      },
      {
        field: 'content',
        type: 'html',
        header: 'Contenido',
        align: 'start',
      },
      {
        field: 'status',
        type: 'boolean',
        header: 'Estado',
        align: 'center',
        trueText: 'Activo',
        falseText: 'Inactivo',
        isTag: true,
        widthClass: '!w-32',
      },
      {
        header: '',
        type: 'custom-buttons',
        buttons: [
          {
            component: 'button-edit',
            onClick: 'edit',
          },
          {
            component: 'btn-delete',
            onClick: 'remove',
          },
          {
            component: 'button-split',
            menuItems: [
              {
                label: 'Copia para canales',
                icon: 'fluent:copy-arrow-right-16-regular',
                action: (item: PredefinedResponses) => {
                  console.log("item", item)
                  this.service
                    .copyToOtherChannels(item.id)
                    .subscribe((response) => {
                      if (!response?.success) {
                        this.msg.warn(
                          'No se pudo copiar esta respuesta predefinida',
                          'Respuestas predefinidas',
                          3000
                        );
                        return;
                      }
                      this.msg.success(
                        response.message,
                        'Respuestas predefinidas',
                        3000
                      );
                      this.loadData();
                    });
                },
              },
            ],
          },
        ],
        widthClass: '!w-28',
      },
    ];

    this.loadCategories();
    this.loadData();
  }

  loadCategories() {
    this.categoryChannelStore.loadAll();
  }

  loadData(q?: Record<string, any>) {
    this.store.loadAll(this.limit(), this.offset(), {
      ...q,
      categoryId: this.activeTab,
    });
  }

  searchChange({
    limit,
    offset,
    q,
  }: {
    limit: number;
    offset: number;
    q: Record<string, any>;
  }) {
    this.limit.set(limit);
    this.offset.set(offset);
    this.loadData(q);
  }

  onTableAction(event: { action: string; item: any }) {
    const { action, item } = event;

    switch (action) {
      case 'edit':
        this.edit(item);
        break;
      case 'remove':
        this.remove(item);
        break;
      default:
        console.warn(`Acción no manejada: ${action}`);
    }
  }

  addNew() {
    this.openModal = true;
    this.store.clearSelected();
    const ref = this.dialogService.open(FormPredefinedComponent, {
      header: 'Nueva Respuesta Predefinida ',
      styleClass: 'modal-lg',
      modal: true,
      dismissableMask: false,
      closable: true,
    });

    ref.onClose.subscribe((res) => {
      this.openModal = false;
      if (res) {
        this.loadData();
      }
    });
  }

  edit(state: any) {
    this.store.loadById(state.id);
    this.openModal = true;
    const ref = this.dialogService.open(FormPredefinedComponent, {
      header: 'Editar respuesta predefinida - ' + state.title,
      styleClass: 'modal-lg',
      modal: true,
      dismissableMask: false,
      closable: true,
    });

    ref.onClose.subscribe((res) => {
      this.openModal = false;
      if (res) {
        this.loadData();
      }
    });
  }

  remove(state: any) {
    this.msg.confirm(
      `<div class='px-4 py-2'>
        <p class='text-center'> ¿Está seguro de eliminar la respuesta <span class='uppercase font-bold'>${state.title}</span>? </p>
        <p class='text-center'> Esta acción no se puede deshacer. </p>
      </div>`,
      () => {
        this.store.delete(state.id);
      }
    );
  }
}
