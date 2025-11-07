import { Component } from '@angular/core';

@Component({
  selector: 'bs-example-index',
  imports: [],
  template: `
    <div class="index-container">
      <h1>Bootstrap Examples</h1>
      <p>Select an example from the navigation or use direct links in documentation.</p>

      <div class="info-box">
        <p>Examples will be accessible through the documentation navigation.</p>
      </div>
    </div>
  `,
  styles: [
    `
      .index-container {
        padding: 2rem;
        max-width: 800px;
        margin: 0 auto;
      }

      h1 {
        margin-bottom: 1rem;
        color: #0d6efd;
      }

      .info-box {
        padding: 1rem;
        background: #f8f9fa;
        border-radius: 0.375rem;
        border-left: 4px solid #0d6efd;
      }
    `,
  ],
})
export class IndexComponent {}
