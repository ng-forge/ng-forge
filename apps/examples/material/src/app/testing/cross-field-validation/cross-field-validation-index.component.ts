import { Component } from '@angular/core';
import { ConditionalFieldsTestComponent } from './conditional-fields.component';
import { DependentFieldsTestComponent } from './dependent-fields.component';
import { EnableDisableTestComponent } from './enable-disable.component';
import { PasswordValidationTestComponent } from './password-validation.component';

/**
 * Cross Field Validation Index Component
 * Renders all test scenarios on a single page for E2E testing
 */
@Component({
  selector: 'example-cross-field-validation-index',
  imports: [ConditionalFieldsTestComponent, DependentFieldsTestComponent, EnableDisableTestComponent, PasswordValidationTestComponent],
  template: `
    <div class="test-page-container">
      <h1 class="page-title">Cross Field Validation Tests</h1>
      <p class="page-subtitle">All test scenarios</p>

      <div class="test-scenarios">
        <example-conditional-fields-test />
        <example-dependent-fields-test />
        <example-enable-disable-test />
        <example-password-validation-test />
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
export class CrossFieldValidationIndexComponent {}
