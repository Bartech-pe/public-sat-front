import { Pipe, PipeTransform, ChangeDetectorRef, NgZone } from '@angular/core';
import { interval, Subscription } from 'rxjs';

@Pipe({
  name: 'timeElapsed',
  pure: false, // importante: para que el pipe se actualice automáticamente
})
export class TimeElapsedPipe implements PipeTransform {
  private lastValue: string = '';
  private timerSub?: Subscription;
  private startTime?: Date;

  constructor(private cd: ChangeDetectorRef, private ngZone: NgZone) {}

  transform(startDate: Date | string | number): string {
    if (!startDate) return '00:00:00';

    // Inicializa una sola vez
    if (!this.startTime) {
      this.startTime = new Date(startDate);
      this.startTimer();
    }

    return this.lastValue;
  }

  private startTimer(): void {
    this.ngZone.runOutsideAngular(() => {
      this.timerSub = interval(1000).subscribe(() => {
        const diff = Date.now() - this.startTime!.getTime();

        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);

        const formatted = [
          hours.toString().padStart(2, '0'),
          minutes.toString().padStart(2, '0'),
          seconds.toString().padStart(2, '0'),
        ].join(':');

        this.ngZone.run(() => {
          this.lastValue = formatted;
          this.cd.markForCheck();
        });
      });
    });
  }

  ngOnDestroy(): void {
    this.timerSub?.unsubscribe();
  }
}
