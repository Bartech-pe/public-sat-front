import { Component, inject, OnInit } from '@angular/core';
import { InformacionCaso } from '@models/atencion-ciudadano.model';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-informacion-caso',
  imports: [],
  templateUrl: './informacion-caso.component.html',
  styles: ``,
})
export class InformacionCasoComponent implements OnInit {
  public readonly ref: DynamicDialogRef = inject(DynamicDialogRef);

  private readonly dialogService: DialogService = inject(DialogService);

  informacionCaso?: InformacionCaso;

  ngOnInit(): void {
    const instance = this.dialogService.getInstance(this.ref);

    this.informacionCaso = instance.data;
  }
}
