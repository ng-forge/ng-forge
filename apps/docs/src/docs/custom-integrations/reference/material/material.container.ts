import { Component, ChangeDetectionStrategy } from '@angular/core';

/**
 * Container component that isolates Material Design styling.
 * Wraps Material-based examples to prevent style pollution.
 */
@Component({
  selector: 'docs-material-container',
  template: `<div class="material-integration"><ng-content /></div>`,
  styles: [
    `
      .material-integration {
        /* Isolated Material Design styles */
        font-family: Roboto, 'Helvetica Neue', sans-serif;

        /* Material color palette variables */
        --mat-primary: #1976d2;
        --mat-accent: #ff4081;
        --mat-warn: #f44336;

        /* Layout and spacing */
        display: block;
        padding: 1rem;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MaterialDesignContainer {}
