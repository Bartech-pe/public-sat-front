import { QuickResponseService } from '@services/quick-response.service';
import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { QuickResponseItem } from '@models/QuickResponse.model';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { RadioButtonModule } from 'primeng/radiobutton';
import { TextareaModule } from 'primeng/textarea';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-quick-response-delete',
  templateUrl: './quick-response-delete.component.html',
  standalone:true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [DialogModule,ButtonModule ,TooltipModule,
     ReactiveFormsModule, FormsModule, RadioButtonModule,InputTextModule,CommonModule,
    InputIconModule,TextareaModule ,
        IconFieldModule,  ]
})
export class QuickResponseDeleteComponent implements OnInit {
   @Input() item!:QuickResponseItem
   @Input() visible!:boolean;
   @Output() reload = new EventEmitter<void>();
   @Output() visibleChange = new EventEmitter<boolean>();


  constructor(private QuickResponseService:QuickResponseService) {
    console.log("pdsamnas") 
  }

  ngOnInit() {
    console.log("pdsamnas",this.item) 
  }



  onClose() {
  this.visible = false;
  this.visibleChange.emit(false); 
  }
  delete(){
    this.QuickResponseService.delete(this.item.quickResponseId).subscribe((response:any)=>{
       this.visible = false;
    this.visibleChange.emit(false);
    this.reload.emit(); 
    })
  }

}
