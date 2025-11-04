import { Component, ChangeDetectionStrategy } from '@angular/core';

/**
 * Container component that isolates Bootstrap styling.
 * Wraps Bootstrap-based examples to prevent style pollution.
 */
@Component({
  selector: 'docs-bootstrap-container',
  template: `<div class="bootstrap-integration"><ng-content /></div>`,
  styles: [
    `
      .bootstrap-integration {
        /* Isolated Bootstrap styles */
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;

        /* Bootstrap color palette variables */
        --bs-primary: #0d6efd;
        --bs-secondary: #6c757d;
        --bs-success: #198754;
        --bs-danger: #dc3545;

        /* Layout and spacing */
        display: block;
        padding: 1rem;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BootstrapDesignContainer {}
