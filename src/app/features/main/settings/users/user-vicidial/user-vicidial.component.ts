import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserVicidial } from '@models/user.model';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FieldsetModule } from 'primeng/fieldset';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';

@Component({
  selector: 'app-user-vicidial',
  imports: [CommonModule, FormsModule, FieldsetModule, InputTextModule],
  templateUrl: './user-vicidial.component.html',
  styles: ``,
})
export class UserVicidialComponent implements OnInit {
  public readonly ref: DynamicDialogRef = inject(DynamicDialogRef);

  private readonly dialogService: DialogService = inject(DialogService);

  listLevel = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  vicidial!: UserVicidial;

  ngOnInit(): void {
    const instance = this.dialogService.getInstance(this.ref);

    this.vicidial = instance.data;
  }
}
