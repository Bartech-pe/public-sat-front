// advisor.component.ts - VERSIÓN SIMPLIFICADA
import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { getAdvisorsResponseDto } from '@interfaces/features/main/omnichannel-inbox/omnichannel-inbox.interface';
import { User } from '@models/user.model';
import { ChannelRoomService } from '@services/channel-room.service';
import { GlobalService } from '@services/global-app.service';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
interface TransferToAdvisorResponseDto{
  message: string;
}
@Component({
  selector: 'app-advisor',
  imports: [
    DialogModule,
    CommonModule,
    FormsModule,
    DropdownModule,
    AvatarModule,
    ButtonModule
  ],
  templateUrl: './advisor.component.html',
  styles: ``
})
export class AdvisorComponent {
  @Input() visible: boolean = false;
  @Input() advisors: getAdvisorsResponseDto[] = [];
  @Input() channelRoomId:any;
  @Output() visibleChange = new EventEmitter<string>();

  advisorSelected: getAdvisorsResponseDto | null = null;


  constructor(private channelRoomService: ChannelRoomService){}


  onReasignar() {
    if (this.advisorSelected) {


      this.channelRoomService.transferToAdvisor(this.channelRoomId, this.advisorSelected.id).subscribe((response: TransferToAdvisorResponseDto) =>{
          console.log("anyresponses", response);

          if(response){
            this.closeModal(response.message);
          }
      });

    }
  }

  logging(evt:any){
    console.log("closed", evt)
  }
  closeModal(message: string = "") {
    this.visible = false;
    this.visibleChange.emit(message);
    this.advisorSelected = null;
  }

  fallbackAvatar(name: string): string {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff`;
  }
}
