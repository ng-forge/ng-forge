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
      .index-container {
        padding: 2rem;
        max-width: 800px;
        margin: 0 auto;
      }

      h1 {
        margin-bottom: 1rem;
        color: #1976d2;
      }

      .info-box {
        padding: 1rem;
        background: #f5f5f5;
        border-radius: 4px;
        border-left: 4px solid #1976d2;
      }
    `,
  ],
})
export class IndexComponent {}
