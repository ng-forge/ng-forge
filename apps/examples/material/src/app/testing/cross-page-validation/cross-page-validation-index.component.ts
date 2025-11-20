import { Component } from '@angular/core';
import { BusinessFlowComponent } from './business-flow.component';
import { CascadeDependenciesComponent } from './cascade-dependencies.component';
import { ConditionalPagesComponent } from './conditional-pages.component';
import { EmailVerificationComponent } from './email-verification.component';
import { ProgressiveValidationComponent } from './progressive-validation.component';

/**
 * Cross Page Validation Index Component
 * Renders all test scenarios on a single page for E2E testing
 */
@Component({
  selector: 'example-cross-page-validation-index',
  imports: [
    BusinessFlowComponent,
    CascadeDependenciesComponent,
    ConditionalPagesComponent,
    EmailVerificationComponent,
    ProgressiveValidationComponent,
  ],
  template: `
    <div class="test-page-container">
      <h1 class="page-title">Cross Page Validation Tests</h1>
      <p class="page-subtitle">All test scenarios</p>

      <div class="test-scenarios">
        <example-business-flow />
        <example-cascade-dependencies />
        <example-conditional-pages />
        <example-email-verification />
        <example-progressive-validation />
      </div>
    </div>
  `,
  styles: [
    `
      .test-page-container {
        padding: 2rem;
        max-width: 1400px;
        margin: 0 auto;
      }

      .page-title {
        color: #1976d2;
        font-size: 2rem;
        margin-bottom: 0.5rem;
      }

      .page-subtitle {
        color: #666;
        font-size: 1.1rem;
        margin-bottom: 2rem;
      }

      .test-scenarios {
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }
    `,
  ],
})
export class CrossPageValidationIndexComponent {}
