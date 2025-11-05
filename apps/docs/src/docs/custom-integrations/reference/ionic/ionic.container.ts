import { Component, ChangeDetectionStrategy } from '@angular/core';

/**
 * Container component that isolates Ionic styling.
 * Wraps Ionic-based examples to prevent style pollution.
 */
@Component({
  selector: 'app-ionic-container',
  template: `<div class="ionic-integration"><ng-content /></div>`,
  styles: [
    `
      .ionic-integration {
        /* Isolated Ionic styles */
        font-family: -apple-system-font, 'Helvetica Neue', 'Roboto', sans-serif;

        /* Ionic color palette variables */
        --ion-color-primary: #3880ff;
        --ion-color-secondary: #3dc2ff;
        --ion-color-tertiary: #5260ff;
        --ion-color-success: #2dd36f;
        --ion-color-warning: #ffc409;
        --ion-color-danger: #eb445a;

        /* Layout and spacing */
        display: block;
        padding: 1rem;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IonicDesignContainer {}
