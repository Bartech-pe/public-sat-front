import { Injectable } from '@angular/core';
import { BehaviorSubject, interval, Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CallTimerService {
  private startTime!: number; // Tiempo inicial en ms
  private elapsedMs: number = 0; // Tiempo acumulado en ms
  private running: boolean = false;
  private timerSub?: Subscription;

  // Observable para que los componentes puedan escuchar el cambio de tiempo
  private timeSubject = new BehaviorSubject<string>('00:00:00');
  public time$ = this.timeSubject.asObservable();

  /** Inicia o reanuda el timer */
  start(entryDate?: string | Date): void {
    if (this.running) return;
    this.running = true;

    if (entryDate) {
      // Sincronizar con hora del backend
      const startDate =
        entryDate instanceof Date
          ? entryDate
          : new Date((entryDate as string).replace(' ', 'T'));
      this.startTime = startDate.getTime();
      this.elapsedMs = Date.now() - this.startTime;
    } else {
      // Reanudar desde donde se pausó
      this.startTime = Date.now() - this.elapsedMs;
    }

    this.timerSub = interval(1000).subscribe(() => {
      this.elapsedMs = Date.now() - this.startTime;
      this.timeSubject.next(this.formatElapsedTime(this.elapsedMs));
    });
  }

  /** Pausa el timer */
  pause(): void {
    if (!this.running) return;
    this.running = false;
    this.timerSub?.unsubscribe();
  }

  /** Reinicia el timer */
  reset(seconds: number = 0): void {
    this.pause();
    this.timeSubject.next(this.secondsToTime(seconds));
  }

  private secondsToTime(seconds: number): string {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return [hrs, mins, secs].map((v) => String(v).padStart(2, '0')).join(':');
  }

  private formatElapsedTime(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      seconds.toString().padStart(2, '0'),
    ].join(':');
  }
}
