import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, Output } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { AvatarModule } from "primeng/avatar";
import { ButtonModule } from "primeng/button";
import { DialogModule } from "primeng/dialog";
import { DropdownModule } from "primeng/dropdown";

interface PriorityOption {
  label: string;
  value: string;
  icon?: string;
  color?: string;
}

@Component({
  selector: 'app-channel-room-statuses',
  imports: [
    DialogModule,
    CommonModule,
    FormsModule,
    DropdownModule,
    ButtonModule
  ],
  templateUrl: './channel-room-statuses.component.html',
  styles: `
    .priority-completado { color: #059669; }
    .priority-pendiente { color: #d97706; }
    .priority-prioridad { color: #dc2626; }
  `
})
export class ChannelRoomStatusesComponent {
  currentItemId: any;
  currentPriority = '';
  prioritySelected: PriorityOption | null = null;
  @Input() visible: boolean = false;
  @Output() visibleChange = new EventEmitter<string>();

  priorityOptions: PriorityOption[] = [
    {
      label: 'Completado',
      value: 'completado',
      icon: 'pi pi-check-circle',
      color: '#059669'
    },
    {
      label: 'Pendiente',
      value: 'pendiente',
      icon: 'pi pi-clock',
      color: '#d97706'
    },
    {
      label: 'Prioridad',
      value: 'prioridad',
      icon: 'pi pi-exclamation-triangle',
      color: '#dc2626'
    }
  ];

  openPriorityModal(itemId: any, currentPriority: string = '') {
    this.currentItemId = itemId;
    this.currentPriority = currentPriority;

    if (currentPriority) {
      this.prioritySelected = this.priorityOptions.find(
        option => option.value === currentPriority
      ) || null;
    }

    this.visible = true;
  }

  onEstablecerPrioridad() {
    if (this.prioritySelected) {
      const event = {
        priority: this.prioritySelected.value,
        itemId: this.currentItemId,
        message: `Prioridad establecida como: ${this.prioritySelected.label}`
      };
      this.onPriorityChanged(event);
    }
  }

  onPriorityChanged(event: {priority: string, itemId: any, message?: string}) {
    this.visibleChange.emit(event.priority);
    console.log('Nueva prioridad:', event.priority);
    console.log('Para el item:', event.itemId);
    console.log('Mensaje:', event.message);

    // AQUÍ VA TU SERVICIO
    // this.yourService.updatePriority(event.itemId, event.priority).subscribe(...)

    this.closeModal();
  }

  closeModal() {
    this.visible = false;
    this.prioritySelected = null;
    this.currentItemId = null;
    this.currentPriority = '';
  }

  getPriorityClass(value: string): string {
    return `priority-${value}`;
  }
}
