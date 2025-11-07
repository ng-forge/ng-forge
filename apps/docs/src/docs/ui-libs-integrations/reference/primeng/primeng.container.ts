import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Container component that isolates PrimeNG styling.
 * Wraps PrimeNG-based examples to prevent style pollution.
 */
@Component({
  selector: 'app-primeng-container',
  template: `<div class="primeng-integration"><ng-content /></div>`,
  styles: [
    `
      .primeng-integration {
        /* Isolated PrimeNG styles */
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;

        /* PrimeNG color palette variables */
        --primary-color: #3b82f6;
        --surface-0: #ffffff;
        --surface-50: #f8f9fa;
        --surface-100: #f3f4f6;

        /* Layout and spacing */
        display: block;
        padding: 1rem;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrimeNGDesignContainer {}
