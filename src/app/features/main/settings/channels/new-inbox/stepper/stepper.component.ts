import { CommonModule } from '@angular/common';
import { Component, computed, CUSTOM_ELEMENTS_SCHEMA, OnDestroy, OnInit, Signal} from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { StepperModule } from 'primeng/stepper';
import { CardModule } from 'primeng/card';
import { BadgeModule } from 'primeng/badge';
import { OverlayBadgeModule } from 'primeng/overlaybadge';
import { DividerModule } from 'primeng/divider';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { StepperSignalState } from '../../../../../../core/signals/settings/inboxes/components/stepper-signal.state';
import { filter, Subject } from 'rxjs';

@Component({
	selector: 'app-stepper',
	imports: [
    StepperModule,
    ButtonModule,
    RouterModule,
    CommonModule,
    CardModule,
    BadgeModule,
    OverlayBadgeModule,
    DividerModule
  ],
	templateUrl: './stepper.component.html',
	schemas: [CUSTOM_ELEMENTS_SCHEMA],
	styles: `
      :root .step{
        z-index: 10 !important;
        position: relative;
      }
      .step::before{
          content: "";
          background: var(--color-sky-200);
          position: absolute;
          top: 1.5rem;
          z-index: 0 !important;
          height: 100%;
          width: .125rem;
      }
      .step::after{
          content: "";
          background: var(--color-sky-200);
          position: absolute;
          top: 2.5rem;
          z-index: 0 !important;
          height: 100%;
          width: .125rem;
      }

      .stepper:last-of-type .step::after {
          width: 0;
      }
      .stepper:last-of-type .step::before {
          width: 0;
      }

      .stepper.active .step  {
        background-color: var(--color-sky-600) !important;
      }

      .stepper.current h3  {
        color: var(--color-sky-600)
      }

      .stepper.completed .step  {
        background-color: var(--color-sky-600) !important;
        &::after {
            background-color: var(--color-sky-600) !important;
        }
        &::before {
            background-color: var(--color-sky-600) !important;
        }
      }
  `
})
export class StepperComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  currentStep: Signal<number>
  enabledSteps: Signal<number[]>
  completedSteps: Signal<number[]>

  steps = [
    {
      id: 1,
      title: 'Elegir un canal',
      description: 'Elija el canal que desee integrar a la bandeja de entrada.',
      header: "Elija un canal",
      completed: false,
      route: "channels"
    },
    {
      id: 2,
      title: 'bandeja de entrada',
      description:
        'Autenticación y configuración del canal asociado a la bandeja de entrada.',
      completed: false,
      header: "Canal API",
      route: "configure"
    },
    {
      id: 3,
      title: 'Asignar agentes',
      description: 'Asignar agentes al canal creado.',
      completed: false,
      header: "Asignar agentes",
      route: "agents"
    },
    {
      id: 4,
      title: 'Finalizar',
      description: '¡Proceso terminado!',
      completed: false,
      header: "Finalizado",
      route: "completed"
    }
  ];

 constructor(
    private stepperSignal: StepperSignalState,
    private router: Router,
  ) {
      this.currentStep = computed(() => this.stepperSignal.currentStep());
      this.completedSteps = computed(() => this.stepperSignal.stepsCompleted());
      this.enabledSteps = computed(() => {
        return this.stepperSignal.enabledSteps()
      });
  }

  ngOnInit(): void {
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd)
      )
      .subscribe(() => {
        const found = this.steps.find(item => this.router.url.includes(item.route));
        if (found) {
          this.stepperSignal.next(found.id);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onStepChange(nextStep: number) {
    if (this.enabledSteps().includes(nextStep)) {
      this.stepperSignal.next(nextStep);
    }
  }

  enableStep(step: number) {
    if (!this.enabledSteps().includes(step)) {
      this.enabledSteps().push(step);
    }
  }
}
