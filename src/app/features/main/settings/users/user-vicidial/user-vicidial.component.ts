import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { VicidialUser } from '@models/user.model';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FieldsetModule } from 'primeng/fieldset';
import { InputTextModule } from 'primeng/inputtext';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { ButtonModule } from 'primeng/button';
import { BtnCustomComponent } from '@shared/buttons/btn-custom/btn-custom.component';

@Component({
  selector: 'app-user-vicidial',
  imports: [
    CommonModule,
    FormsModule,
    FieldsetModule,
    InputTextModule,
    InputGroupModule,
    InputGroupAddonModule,
    BtnCustomComponent,
  ],
  templateUrl: './user-vicidial.component.html',
  styles: ``,
})
export class VicidialUserComponent implements OnInit {
  public readonly ref: DynamicDialogRef = inject(DynamicDialogRef);

  private readonly dialogService: DialogService = inject(DialogService);

  listLevel = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  vicidial!: VicidialUser;

  showPassUser: boolean = false;
  showPassPhone: boolean = false;

  ngOnInit(): void {
    const instance = this.dialogService.getInstance(this.ref);

    this.vicidial = instance.data;
  }
}
