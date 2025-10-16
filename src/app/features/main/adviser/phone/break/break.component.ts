import { CommonModule } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  effect,
  inject,
  OnInit,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { TagModule } from 'primeng/tag';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { MessageGlobalService } from '@services/generic/message-global.service';
import {
  pauseCodeAgent,
  VicidialPauseCode,
} from '@constants/pause-code-agent.constant';
import { AloSatService } from '@services/alo-sat.service';

@Component({
  selector: 'app-break',
  imports: [
    ToggleSwitchModule,
    ButtonModule,
    SelectModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    TagModule,
  ],
  templateUrl: './break.component.html',
  styles: ``,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class BreakComponent implements OnInit {
  formData = new FormGroup({
    pauseCode: new FormControl<string | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  private readonly msg = inject(MessageGlobalService);

  public readonly ref: DynamicDialogRef = inject(DynamicDialogRef);

  private readonly aloSatService = inject(AloSatService);

  listaMotivos = pauseCodeAgent.filter(
    (p) =>
      ![VicidialPauseCode.WRAPUP, VicidialPauseCode.WRAP].includes(
        p.code as VicidialPauseCode
      )
  ).sort((a, b) => a.name.localeCompare(b.name));;

  submited: boolean = false;

  ngOnInit(): void {}

  onSubmit() {
    this.submited = true;
    const { pauseCode } = this.formData.value;

    this.aloSatService.pauseAgent(pauseCode as VicidialPauseCode).subscribe({
      next: (data) => {
        this.msg.success('¡Estado pausado activado!');
        this.ref.close(true);
        this.resetForm();
      },
    });
  }

  resetForm() {
    this.formData.reset({
      pauseCode: undefined,
    });
  }

  onCancel() {
    this.ref.close();
    this.formData.reset();
  }
}
