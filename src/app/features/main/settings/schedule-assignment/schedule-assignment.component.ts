import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { Channel } from '@models/channel.model';
import { ChannelStore } from '@stores/channel.store';
@Component({
  selector: 'app-schedule-assignment',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DropdownModule,
    CalendarModule,
    InputTextModule,
    TextareaModule,
    ButtonModule,
  ],
  templateUrl: './schedule-assignment.component.html',
  styles: ``,

})
export class ScheduleAssignmentComponent {

  readonly store = inject(ChannelStore);

  get channels(): Channel[] {
    return this.store.items();
  }

  limit = signal(100);
  offset = signal(0);


  scheduleForm: FormGroup;
  configForm: FormGroup;
  supervisors = [
    { name: 'Whatsapp', value: 'sup1' },
    { name: 'Telegram ', value: 'sup2' },
    { name: 'Chatsat', value: 'sup3' }
  ];

  daysInMonth: number[] = [];

  constructor(private fb: FormBuilder, private http: HttpClient) {

      this.scheduleForm = this.fb.group({
        month: ['', Validators.required],
        supervisor: ['', Validators.required],
        days: this.fb.array([])
      });

      this.configForm = this.fb.group({
        contact: ['', Validators.required],
        phone: ['', [Validators.required, Validators.pattern('^[0-9]{7,15}$')]],
        email: ['', [Validators.required, Validators.email]],
        hours: ['', Validators.required],
        notes: ['']
      });
      
  }

  ngOnInit(): void {
        this.store.loadAll(undefined);

    this.scheduleForm.get('month')?.valueChanges.subscribe(month => {
      if (month) {
        this.updateDaysInMonth(month);
      }
    });
  }

  get daysFormArray(): FormArray {
    return this.scheduleForm.get('days') as FormArray;
  }

  updateDaysInMonth(month: Date) {
    const year = month.getFullYear();
    const monthIndex = month.getMonth();
    const days = new Date(year, monthIndex + 1, 0).getDate();
    this.daysInMonth = Array.from({ length: days }, (_, i) => i + 1);
    
    // Clear and repopulate FormArray
    this.daysFormArray.clear();
    this.daysInMonth.forEach(() => {
      this.daysFormArray.push(this.fb.group({
        startTime: [''],
        endTime: ['']
      }));
    });
  }

  assignSchedule() {
    if (this.scheduleForm.valid) {
        const payload = {
          month: this.scheduleForm.value.month,
          idChanel: this.scheduleForm.value.supervisor,
          days: JSON.stringify(this.scheduleForm.value.days.filter((day: any) => day.startTime || day.endTime)) 
        };
        this.http.post('http://localhost:3001/v1/schedule-assignment', payload).subscribe(
          response => console.log('Horario asignado:', response),
          error => console.error('Error al asignar horario:', error)
        );
    }
  }

  saveConfig() {
    if (this.configForm.valid) {
      this.http.post('/api/configure-outofhours', this.configForm.value).subscribe(
        response => console.log('Configuración guardada:', response),
        error => console.error('Error al guardar configuración:', error)
      );
    }
  }

}
