import { Component, ElementRef, Input, ViewChild } from '@angular/core';

@Component({
  selector: 'app-mail-viewer',
  imports: [],
  template: `<iframe
    #emailFrame
    width="100%"
    style="border:none;display:block; height: 16px;"
  ></iframe>`,
  styles: ``,
})
export class MailViewerComponent {
  @Input() safeMailHtml: string = ''; // HTML del correo (ya sanitizado)
  @ViewChild('emailFrame', { static: true })
  iframe!: ElementRef<HTMLIFrameElement>;

  styles = `
        <style>
          body {
            font-family: 'Inter', sans-serif;
            font-size: 14px;
            color: #222;
            margin: 1rem;
          }
          img {
            max-width: 100%;
            height: auto;
          }

          /* Contenedor de la cita (bloque del mensaje anterior) */
          .gmail_quote {
            
            margin: 0.8ex 0px 0px 1ex;
            padding-left: 1ex;
            color: #555;
            white-space: normal;
          }

          /* Contenedor padre que Gmail añade a veces */
          .gmail_quote_container {
            margin-top: 20px;
            margin-bottom: 20px;
          }

          /* Contenedor padre que Gmail añade a veces */
          .gmail_quote_block {
            border-left: 1px solid #ccc;
            padding-left: 2ex;
            margin-top: 8px;
          }

          /* Cabecera con el texto "El [fecha] [nombre] escribió:" */
          .gmail_attr {
            color: #777;
            margin-bottom: 4px;
          }

          /* Gmail usa esto para texto citado en modo plano */
          blockquote.gmail_quote {
            border-left: 1px solid #ccc;
            margin: 0.8ex 0px 0px 1ex;
            padding-left: 1ex;
            color: #555;
          }

          /* Gmail suele limpiar estilos internos para que no hereden formato */
          .gmail_quote * {
            font-family: inherit !important;
            color: #555 !important;
          }

          /* Si quieres simular el "Mostrar contenido oculto" de Gmail */
          .gmail_quote_collapsed {
            display: none;
          }
          .gmail_quote_toggle {
            cursor: pointer;
            color: #1a73e8;
            margin-top: 4px;
            padding: 6px::
          }

        </style>
      `;

  ngAfterViewInit() {
    const iframeEl = this.iframe.nativeElement;
    const doc = iframeEl.contentDocument || iframeEl.contentWindow?.document;

    if (doc) {
      doc.open();
      doc.write(`
        <html>
          <head>${this.styles}</head>
          <body>${this.safeMailHtml}</body>
        </html>
      `);
      doc.close();

      // Esperar a que el contenido se procese
      setTimeout(() => this.adjustHeight(iframeEl), 50);

      // Reajustar cuando las imágenes terminen de cargar
      iframeEl.contentWindow?.addEventListener('load', () =>
        this.adjustHeight(iframeEl)
      );
    }
  }

  private adjustHeight(iframeEl: HTMLIFrameElement) {
    const doc = iframeEl.contentDocument || iframeEl.contentWindow?.document;
    if (doc?.body) {
      // Obtener la altura real del contenido
      const height = Math.max(
        doc.body.scrollHeight,
        doc.documentElement.scrollHeight,
        0
      );

      // Si el contenido es muy corto, el navegador no ajusta bien => forzamos altura mínima visual de 20px
      iframeEl.style.height = (height > 20 ? height : 20) + 'px';
    }
  }
}
