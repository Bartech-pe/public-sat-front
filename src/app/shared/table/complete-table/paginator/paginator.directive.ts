import {
  Directive,
  ViewContainerRef,
  Input,
  ComponentRef,
  inject,
  OnInit,
  runInInjectionContext,
  effect,
} from '@angular/core';
import { PaginatorComponent } from './paginator.component';

@Directive({
  selector: '[appPaginator]',
  standalone: true,
})
export class PaginatorDirective implements OnInit {
  private vcr = inject(ViewContainerRef);
  private injector = this.vcr.injector;

  @Input('appPaginator') context!: {
    totalItems: number | (() => number);
    limit: number | (() => number);
    offset: number | (() => number);
    position: 'start' | 'end' | 'center';
    limitOptions: number[] | (() => number[]);
    pageChange: (event: { limit: number; offset: number }) => void;
  };

  ngOnInit() {
    const compRef: ComponentRef<PaginatorComponent> =
      this.vcr.createComponent(PaginatorComponent);

    compRef.instance.pageChange.subscribe(this.context.pageChange);
    this.vcr.createEmbeddedView(compRef.instance.templateRef);

    // 🧠 Ejecutamos el efecto dentro del contexto de inyección
    runInInjectionContext(this.injector, () => {
      effect(() => {
        const getVal = (v: number | (() => number)) =>
          typeof v === 'function' ? v() : v;

        const getArrVal = (v: number[] | (() => number[])) =>
          typeof v === 'function' ? v() : v;

        compRef.instance.totalItems = getVal(this.context.totalItems);
        compRef.instance.limit = getVal(this.context.limit);
        compRef.instance.offset = getVal(this.context.offset);
        compRef.instance.limitOptions = getArrVal(this.context.limitOptions);
      });
    });
  }
}
