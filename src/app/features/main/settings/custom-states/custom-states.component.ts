import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  effect,
  inject,
  signal,
} from '@angular/core';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ColorPickerModule } from 'primeng/colorpicker';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogService } from 'primeng/dynamicdialog';
import { StateFormComponent } from './state-form/state-form.component';
import { MessageGlobalService } from '@services/generic/message-global.service';
import { CardModule } from 'primeng/card';
import { TabsModule } from 'primeng/tabs';
import { AccordionModule } from 'primeng/accordion';
import { TagModule } from 'primeng/tag';
import { CommonModule } from '@angular/common';
import { BadgeModule } from 'primeng/badge';
import { AvatarModule } from 'primeng/avatar';
import { DialogModule } from 'primeng/dialog';
import { CampaignStateStore } from '@stores/campaign-state.store';
import { AssistanceStateStore } from '@stores/assistance-state.store';
import { ButtonSaveComponent } from '@shared/buttons/button-save/button-save.component';
import { BtnEditSquareComponent } from '@shared/buttons/btn-edit-square/btn-edit-square.component';
import { ChannelStateStore } from '@stores/channel-state.store';
import { CampaignState } from '@models/campaign-state.model';
import { AssistanceState } from '@models/assistance-state.model';
import { ChannelState } from '@models/channel-state.model';
import { CategoryChannelStore } from '@stores/category-channel.store';
import { CategoryChannel } from '@models/category-channel.model';
import { BtnDeleteComponent } from '@shared/buttons/btn-delete/btn-delete.component';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AssistanceStateFormComponent } from './assistance-state-form/assistance-state-form.component';
import { ChannelStateFormComponent } from './channel-state-form/channel-state-form.component';

type ViewType = 'channels' | 'assistances' | 'campaigns';

@Component({
  selector: 'app-custom-states',
  imports: [
    CommonModule,
    RouterModule,
    TableModule,
    InputTextModule,
    ColorPickerModule,
    ButtonModule,
    FormsModule,
    CardModule,
    InputTextModule,
    ButtonModule,
    TabsModule,
    TagModule,
    AccordionModule,
    AvatarModule,
    BadgeModule,
    DialogModule,
    TableModule,
    ButtonSaveComponent,
    BtnEditSquareComponent,
    BtnDeleteComponent,
  ],
  providers: [DialogService],
  templateUrl: './custom-states.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CustomStatesComponent {
  home = { icon: 'pi pi-home', routerLink: '/' };

  openModal: boolean = false;

  value: number = 0;

  private readonly router = inject(Router);

  private readonly route = inject(ActivatedRoute);

  private readonly msg = inject(MessageGlobalService);

  private readonly dialogService = inject(DialogService);

  readonly categoryChannelStore = inject(CategoryChannelStore);

  readonly campaignStateStore = inject(CampaignStateStore);

  readonly assistanceStateStore = inject(AssistanceStateStore);

  readonly channelStateStore = inject(ChannelStateStore);

  originalRoute: string = '';

  get listCategoryChannels(): CategoryChannel[] {
    return this.categoryChannelStore.items();
  }

  get totalCampaignStateStore(): number {
    return this.campaignStateStore.totalItems();
  }

  get campaignStateList(): CampaignState[] {
    return this.campaignStateStore.items();
  }

  get assistanceStateList(): AssistanceState[] {
    return this.assistanceStateStore.items();
  }

  get channelStateList(): ChannelState[] {
    return this.channelStateStore.items();
  }

  getChannelState(category: number): ChannelState[] {
    return this.channelStateList.filter((m) => m.categoryId === category);
  }

  getAssistanceState(category: number): ChannelState[] {
    return this.assistanceStateList.filter((m) => m.categoryId === category);
  }

  private resetOnSuccessEffect = effect(() => {
    // CAMPANIA
    const errorCampaignState = this.campaignStateStore.error();
    const actionCampaignState = this.campaignStateStore.lastAction();

    if (!this.openModal && errorCampaignState) {
      this.msg.error(errorCampaignState ?? '¡Error al eliminar Campaña!');
      return;
    }

    if (actionCampaignState === 'deleted') {
      this.msg.success('¡Estado de Campaña eliminado exitosamente!');
      this.campaignStateStore.clearAll();
      this.campaignStateStore.loadAll();
      return;
    }

    // ATENCIÓN
    const errorAssistanceState = this.assistanceStateStore.error();
    const actionAssistanceState = this.assistanceStateStore.lastAction();

    if (!this.openModal && errorAssistanceState) {
      this.msg.error(errorAssistanceState ?? '¡Error al eliminar Atención!');
      return;
    }

    if (actionAssistanceState === 'deleted') {
      this.msg.success('¡Estado de Atención eliminado exitosamente!');
      this.assistanceStateStore.clearAll();
      this.assistanceStateStore.loadAll();
      return;
    }

    // CANAL
    const errorChannelState = this.channelStateStore.error();
    const actionChannelState = this.channelStateStore.lastAction();

    if (!this.openModal && errorChannelState) {
      this.msg.error(
        errorChannelState ?? '¡Error al eliminar Canal Telefónico!'
      );
      return;
    }

    if (actionChannelState === 'deleted') {
      this.msg.success('¡Estado Telefónico eliminado exitosamente!');
      this.channelStateStore.clearAll();
      this.channelStateStore.loadAll();
      return;
    }
  });

  viewValue = signal<ViewType>('channels');

  ngOnInit(): void {
    this.originalRoute = this.router.url.split('?')[0];
    console.log('Ruta original:', this.originalRoute);
    this.route.queryParams.subscribe((params) => {
      const view = params['view'] ?? 'channels';
      this.viewValue.set(view);
    });
    this.loadData();
  }

  loadData() {
    this.categoryChannelStore.loadAll();
    this.campaignStateStore.loadAll();
    this.assistanceStateStore.loadAll();
    this.channelStateStore.loadAll();
  }

  changeView(view: ViewType) {
    this.router.navigate([this.originalRoute], {
      queryParams: { view },
    });
  }

  openNew() {}

  nuevoCampaignState() {
    this.openModal = true;
    this.campaignStateStore.clearSelected();
    const ref = this.dialogService.open(StateFormComponent, {
      header: 'Nuevo Estado - Campaña',
      styleClass: 'modal-md',
      modal: true,
      dismissableMask: false,
      closable: true,
      data: 2,
    });

    ref.onClose.subscribe((res) => {
      this.openModal = false;
      if (res) {
        this.loadData();
      }
    });
  }

  EditarCampaignState(state: CampaignState) {
    this.campaignStateStore.loadById(state.id);
    this.openModal = true;
    const ref = this.dialogService.open(StateFormComponent, {
      header: 'Editar Estado - Campaña: ' + state.name,
      styleClass: 'modal-lg',
      modal: true,
      focusOnShow: false,
      dismissableMask: false,
      closable: true,
      data: 2,
    });

    ref.onClose.subscribe((res) => {
      this.openModal = false;
      if (res) {
        this.loadData();
      }
    });
  }

  eliminarCampaignState(state: any) {
    this.msg.confirm(
      `<div class='px-4 py-2'>
        <p class='text-center'> ¿Está seguro de eliminar el Estado <span class='uppercase font-bold'>${state.name}</span>? </p>
        <p class='text-center'> Esta acción no se puede deshacer. </p>
      </div>`,
      () => {
        this.campaignStateStore.delete(state.id);
      }
    );
  }

  newAssistanceState(categoryId: number) {
    this.openModal = true;
    this.assistanceStateStore.clearSelected();
    const ref = this.dialogService.open(AssistanceStateFormComponent, {
      header: 'Nuevo Estado de atención',
      styleClass: 'modal-md',
      modal: true,
      dismissableMask: false,
      closable: true,
      data: { categoryId },
    });

    ref.onClose.subscribe((res) => {
      this.openModal = false;
      if (res) {
        this.loadData();
      }
    });
  }

  editAssistanceState(state: AssistanceState) {
    this.assistanceStateStore.loadById(state.id);
    this.openModal = true;
    const ref = this.dialogService.open(AssistanceStateFormComponent, {
      header: `Editar estado de atención | ${state.name}`,
      styleClass: 'modal-lg',
      modal: true,
      dismissableMask: false,
      closable: true,
      data: { categoryId: state.categoryId },
    });

    ref.onClose.subscribe((res) => {
      this.openModal = false;
      if (res) {
        this.loadData();
      }
    });
  }

  deleteAssistanceState(state: AssistanceState) {
    console.log(state);
    this.msg.confirm(
      `<div class='px-4 py-2'>
        <p class='text-center'> ¿Está seguro de eliminar el Estado <span class='uppercase font-bold'>${state.name}</span>? </p>
        <p class='text-center'> Esta acción no se puede deshacer. </p>
      </div>`,
      () => {
        this.assistanceStateStore.delete(state.id);
      }
    );
  }

  newChannelState(categoryId: number) {
    this.openModal = true;
    this.channelStateStore.clearSelected();
    this.assistanceStateStore.clearSelected();
    const ref = this.dialogService.open(ChannelStateFormComponent, {
      header: 'Nuevo estado de canal',
      styleClass: 'modal-md',
      modal: true,
      dismissableMask: false,
      closable: true,
      data: { categoryId },
    });

    ref.onClose.subscribe((res) => {
      this.openModal = false;
      if (res) {
        this.loadData();
      }
    });
  }

  editChannelState(state: ChannelState) {
    this.channelStateStore.loadById(state.id);
    this.openModal = true;
    const ref = this.dialogService.open(ChannelStateFormComponent, {
      header: `Editar estado de canal | ${state.name}`,
      styleClass: 'modal-lg',
      modal: true,
      dismissableMask: false,
      closable: true,
      data: { categoryId: state.categoryId },
    });

    ref.onClose.subscribe((res) => {
      this.openModal = false;
      if (res) {
        this.loadData();
      }
    });
  }

  deleteChannelState(state: ChannelState) {
    this.msg.confirm(
      `<div class='px-4 py-2'>
        <p class='text-center'> ¿Está seguro de eliminar el Estado <span class='uppercase font-bold'>${state.name}</span>? </p>
        <p class='text-center'> Esta acción no se puede deshacer. </p>
      </div>`,
      () => {
        this.channelStateStore.delete(state.id);
      }
    );
  }
}
