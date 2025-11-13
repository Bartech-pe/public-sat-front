import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ChannelStore } from '@stores/channel.store';
import { Channel } from '@models/channel.model';
import { StepperSignalState } from '@signals/settings/inboxes/components/stepper-signal.state';
import { ChannelIconComponent } from '@shared/channel-icon/channel-icon.component';

@Component({
  selector: 'app-channels',
  imports: [RouterModule, ChannelIconComponent],
  templateUrl: './channels.component.html',
  styles: ``,
})
export class ChannelsComponent implements OnInit {
  @Output() channelChange = new EventEmitter<Channel>();

  readonly store = inject(ChannelStore);

  get channels(): Channel[] {
    return this.store.items();
  }

  constructor(private stepperSignal: StepperSignalState) {}

  ngOnInit(): void {
    this.store.loadAll(undefined);
  }

  goNext(channel: Channel) {
    this.channelChange.emit(channel);
    this.store.loadById(channel.id!);
    // this.stepperSignal.checkStep(1);
    // this.stepperSignal.enableStep(2);
    // this.stepperSignal.next(2, channel);
  }
}
