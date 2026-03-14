import { Component } from '@angular/core';

@Component({
  selector: 'example-index',
  template: `
    <div class="index-container">
      <h1>PrimeNG Examples</h1>
      <p>Select an example from the navigation or use direct links in documentation.</p>

      <div class="example-links">
        <h2>Available Examples</h2>
        <ul>
          <li>Input</li>
          <li>Textarea</li>
          <li>Select</li>
          <li>Checkbox</li>
          <li>Toggle</li>
          <li>Radio</li>
          <li>Multi-checkbox</li>
          <li>Datepicker</li>
          <li>Slider</li>
          <li>Button</li>
          <li>Complete Form</li>
        </ul>
      </div>
    </div>
  `,
  styles: [
    `
      .index-container {
        max-width: 800px;
        margin: 0 auto;
      }

      h1 {
        margin-bottom: 1rem;
      }

      .example-links {
        margin-top: 2rem;
      }

      ul {
        list-style: disc;
        padding-left: 2rem;
      }

      li {
        padding: 0.5rem 0;
      }
    `,
  ],
})
export default class IndexComponent {}
