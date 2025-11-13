import { Component, inject, OnInit } from '@angular/core';
import { MessageGlobalService } from '@services/message-global.service';
import { ButtonSaveComponent } from '@shared/buttons/button-save/button-save.component';
import { DialogService } from 'primeng/dynamicdialog';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-mail',
  imports: [TableModule, ButtonSaveComponent],
  templateUrl: './mail.component.html',
  styles: ``,
})
export class MailComponent implements OnInit {
  private readonly msg = inject(MessageGlobalService);
  private readonly dialogService = inject(DialogService);
  listaCampaniasSMS: any[] = [];

  ngOnInit(): void {
    this.loadData();
  }

  openNew() {
    // this.openModal = true;
    // const ref = this.dialogService.open(FormSmsComponent, {
    //   header: 'Crear Campaña SMS - Excel',
    //   styleClass: 'modal-6xl',
    //   modal: true,
    //   dismissableMask: false,
    //   closable: true,
    // });
    // ref.onClose.subscribe((res) => {
    //   this.openModal = false;
    // });
  }

  private loadData() {
    this.listaCampaniasSMS = [
      {
        id: 5210,
        nombre: 'PREDAVENCIDO240625',
        plantilla: 'HTML',
        base: 'Depurado',
        arte: '',
        formato: '',
        opcional: '',
        registros: 1500,
        cargada: '25/06/2025',
        estado: 'Aprobado',
      },
      {

      }
    ];
  }
}
