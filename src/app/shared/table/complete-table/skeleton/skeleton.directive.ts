import {
  Directive,
  ViewContainerRef,
  Input,
  OnInit,
  ComponentRef,
  inject,
  runInInjectionContext,
  effect,
} from '@angular/core';
import { SkeletonComponent } from './skeleton.component';

@Directive({
  selector: '[appSkeleton]',
  standalone: true,
})
export class SkeletonDirective implements OnInit {
  private vcr = inject(ViewContainerRef);
  private injector = this.vcr.injector;

  @Input('appSkeleton') context!: {
    loading: boolean | (() => boolean);
    numCols: number;
    numRows?: number;
  };

  ngOnInit() {
    const compRef: ComponentRef<SkeletonComponent> =
      this.vcr.createComponent(SkeletonComponent);

    this.vcr.createEmbeddedView(compRef.instance.templateRef);

    // Ejecutamos el efecto reactivo dentro del contexto de inyección
    runInInjectionContext(this.injector, () => {
      effect(() => {
        const resolve = <T>(v: T | (() => T)): T =>
          typeof v === 'function' ? (v as () => T)() : v;

        compRef.instance.loading = resolve(this.context.loading);
        compRef.instance.numCols = this.context.numCols;
        compRef.instance.numRows = resolve(this.context.numRows ?? 4);
      });
    });
  }
}
