import { Injectable, signal } from '@angular/core';
import { Channel } from '@models/channel.model';



@Injectable({ providedIn: 'root' })
export class StepperSignalState {
    currentStep = signal<number>(1);
    selectedWidget = signal<Channel | undefined>(undefined);
    enabledSteps = signal<number[]>([1]);
    stepsCompleted = signal<number[]>([]);

    enableStep(step: number) {
      if (!this.enabledSteps().includes(step)) {
        let model = this.enabledSteps();
        model.push(step);
        this.enabledSteps.set(model);
      }
    }

    next(indexStep: number, widget ?: Channel) {
      if(widget){
        this.selectedWidget.set(widget)
      }
      this.currentStep.set(indexStep);
    }

    checkStep(indexStep: number)
    {
      if (!this.stepsCompleted().includes(indexStep)) {
        let model = this.stepsCompleted();
        model.push(indexStep);
        this.stepsCompleted.set(model);
      }
    }
}
