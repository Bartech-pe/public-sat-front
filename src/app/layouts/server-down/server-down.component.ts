import { Component, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-server-down',
  imports: [RouterModule],
  templateUrl: './server-down.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  styles: ``,
})
export class ServerDownComponent {
  private readonly router = inject(Router);

  reload() {
    const previousUrl = sessionStorage.getItem('previousUrl');

    console.log('reload', previousUrl);

    if (previousUrl && previousUrl != '/server-down') {
      this.router.navigateByUrl(previousUrl);
    } else {
      this.router.navigate(['/']); // o a una ruta por defecto
    }
  }
}
