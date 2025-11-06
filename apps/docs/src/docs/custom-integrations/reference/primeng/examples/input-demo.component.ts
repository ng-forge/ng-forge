import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  selector: 'app-input-demo',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="demo-container">
      <prime-input-example></prime-input-example>
    </div>
  `,
  styles: [
    `
      @import 'primeng/resources/themes/lara-light-blue/theme.css';
      @import 'primeng/resources/primeng.css';
      @import 'primeicons/primeicons.css';

      .demo-container {
        margin: 1rem 0;
      }
    `,
  ],
})
export class InputDemoComponent implements OnInit {
  async ngOnInit() {
    // Lazy load and register the web component
    const { registerPrimeExample } = await import('@ng-forge/examples-primeng');
    await registerPrimeExample('prime-input-example');
  }
}
