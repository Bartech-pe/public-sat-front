import {
  Component,
  Inject,
  PLATFORM_ID,
  ElementRef,
  ViewChild,
  OnInit,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import createStudioEditor from '@grapesjs/studio-sdk';

@Component({
  selector: 'app-grapes-editor',
  template: `<div class="cnt">
    <div class="cnt-nav">
      Nueva Plantilla <span>SAT</span>
      <button
        (click)="obtenerHtml()"
        class="ml-4 bg-blue-500 text-white px-4 py-1 rounded text-sm"
      >
        Guardar Plantilla
      </button>
    </div>
    <div class="cnt-body">
      <div #editorEl class="editor"></div>
    </div>
  </div>`,
  styles: [
    `
      .cnt {
        display: flex;
        flex-direction: column;
        height: 100vh;
      }
      .cnt-nav {
        padding: 10px;
        background-color: #020420;
        color: #ef6974;
      }
      .cnt-body {
        flex-grow: 1;
      }
      .editor {
        height: 100%;
      }
    `,
  ],
})
export class GrapesEditorComponent implements OnInit {
  @ViewChild('editorEl', { static: true }) editorEl!: ElementRef;

  editor!: any;
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      createStudioEditor({
        licenseKey: 'YOUR_LICENSE_KEY',
        root: this.editorEl.nativeElement,
        project: {
          default: {
            pages: [
              {
                name: 'Home',
                component: `<h1 style="padding: 2rem; text-align: center">
                Hello Studio 👋
              </h1>`,
              },
            ],
          },
        },
      }).then(() => {
        // ✅ Esperamos al evento de carga del editor
        document.addEventListener('editor:load', (e: any) => {
          this.editor = e.detail?.editor;
          console.log('Editor cargado correctamente:', this.editor);
        });
      });
    }
  }

  // async ngOnInit(): Promise<void> {
  //   console.log('📌 root DOM:', this.editorEl?.nativeElement);
  //   if (isPlatformBrowser(this.platformId)) {
  //     try {
  //       this.editor = await createStudioEditor({
  //         licenseKey: '9964a90c02f6490085bd3b46180f5c227e53f99f01b549e48bb44ac4e0133009',
  //         root: this.editorEl.nativeElement,
  //         project: {
  //           default: {
  //             pages: [
  //               {
  //                 name: 'Home',
  //                 component: `<h1 style="padding: 2rem; text-align: center">
  //               Hello Studio 👋
  //             </h1>`,
  //               },
  //             ],
  //           },
  //         },
  //       });
  //       console.log('Editor cargado', this.editor);
  //     } catch (error) {
  //       console.error('Error creando el editor: ', error);
  //     }
  //   }
  // }

  // obtenerHtml(): void {
  //   console.log('click', this.editorEl.nativeElement);
  // if (this.editor) {
  // const html = this.editor.Page.getSelected()?.Component.toHTML();
  // console.log('HTML actual:', html);

  // Aquí podrías hacer:
  // this.miServicio.guardar(html);
  // }
  // }

obtenerHtml(): void {
  if (!this.editor) {
    console.warn('Editor aún no está listo');
    return;
  }

  const html = this.editor.getHtml();
  const css = this.editor.getCss();

  console.log('HTML generado:', html);
  console.log('CSS generado:', css);
}

}
