import { Component } from '@angular/core';
import { environment } from '@envs/environments';

@Component({
  selector: 'app-footer',
  imports: [],
  template: ` <footer
    class="w-full h-full px-6 text-xs text-gray-500 flex justify-between items-center"
  >
    <div class="flex items-center gap-1 flex-wrap">
      Copyright <span>&copy; {{ year }}</span>
      <span class="text-cyan-500 font-medium">SAT.</span>
      <span> Todos los derechos reservados.</span>
    </div>
    <div class="text-gray-400 tracking-wide">V. {{ version }}</div>
  </footer>`,
  styles: ``,
})
export class FooterComponent {
  version = environment.version;
  year = environment.year;
  currentYear: number = new Date().getFullYear();
}
