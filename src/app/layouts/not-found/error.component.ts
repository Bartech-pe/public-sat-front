import { Component } from "@angular/core";

@Component({
  selector: 'app-error',
  template: `<div class="flex flex-col items-center justify-center h-screen text-center px-4">
  <!-- Imagen ilustrativa -->
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
        <path fill="#000" d="M12 2c5.5 0 10 4.5 10 10s-4.5 10-10 10S2 17.5 2 12S6.5 2 12 2m0 2c-1.9 0-3.6.6-4.9 1.7l11.2 11.2c1-1.4 1.7-3.1 1.7-4.9c0-4.4-3.6-8-8-8m4.9 14.3L5.7 7.1C4.6 8.4 4 10.1 4 12c0 4.4 3.6 8 8 8c1.9 0 3.6-.6 4.9-1.7" />
    </svg>

    <!-- Texto principal -->
    <h1 class="text-2xl font-semibold mb-2">Hubo un error al conectar a Gmail :c</h1>

    <!-- Botón para volver -->
    <a
    routerLink="/"
    class="mt-6 bg-[#375f95] hover:bg-[#5b7fc2] active:bg-[#2c4872] text-white font-medium py-2 px-6 rounded-full transition-all duration-300 cursor-pointer"
    >
    Volver a la página principal</a>

</div>
`
})
export class ErrorComponent {}
