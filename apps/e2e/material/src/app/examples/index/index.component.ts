import { Component } from '@angular/core';

@Component({
  selector: 'example-index',
  imports: [],
  template: `
    <div class="index-container">
      <h1>Material Examples</h1>
      <p>Select an example from the navigation or use direct links in documentation.</p>

      <div class="info-box">
        <p>Examples will be accessible through the documentation navigation.</p>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        --index-primary: #1976d2;
        --index-bg: #f5f5f5;
        --index-text: inherit;
      }

      :host-context(.dark) {
        --index-primary: #90caf9;
        --index-bg: #2d2d2d;
        --index-text: #f0f0f0;
      }

      .index-container {
        padding: 2rem;
        max-width: 800px;
        margin: 0 auto;
        color: var(--index-text);
      }

      h1 {
        margin-bottom: 1rem;
        color: var(--index-primary);
      }

      .info-box {
        padding: 1rem;
        background: var(--index-bg);
        border-radius: 4px;
        border-left: 4px solid var(--index-primary);
      }
    `,
  ],
})
export default class IndexComponent {}
