import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Container component that isolates Bootstrap styling.
 * Wraps Bootstrap-based examples to prevent style pollution.
 */
@Component({
  selector: 'app-bootstrap-container',
  template: `<div class="theme-bootstrap"><ng-content /></div>`,
  styles: [
    `
      .theme-bootstrap {
        /* Isolated Bootstrap styles */
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;

        /* Bootstrap color palette variables */
        --bs-primary: #0d6efd;
        --bs-secondary: #6c757d;
        --bs-success: #198754;
        --bs-danger: #dc3545;
        --bs-warning: #ffc107;
        --bs-info: #0dcaf0;

        /* Layout and spacing */
        display: block;
        padding: 1rem;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BootstrapDesignContainer {}
