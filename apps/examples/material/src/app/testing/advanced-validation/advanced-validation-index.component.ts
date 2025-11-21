import { Component } from '@angular/core';
import { CustomValidatorTestComponent } from './custom-validator-test.component';
import { CrossFieldValidatorTestComponent } from './cross-field-validator-test.component';
import { RangeValidationTestComponent } from './range-validation-test.component';
import { ConditionalValidatorTestComponent } from './conditional-validator-test.component';
import { MultipleValidatorsTestComponent } from './multiple-validators-test.component';

/**
 * Advanced Validation Index Component
 * Renders all validation test scenarios on a single page for E2E testing
 */
@Component({
  selector: 'example-advanced-validation-index',
  imports: [
    CustomValidatorTestComponent,
    CrossFieldValidatorTestComponent,
    RangeValidationTestComponent,
    ConditionalValidatorTestComponent,
    MultipleValidatorsTestComponent,
  ],
  template: `
    <div class="test-page-container">
      <h1 class="page-title">Advanced Validation Tests</h1>
      <p class="page-subtitle">All validation test scenarios</p>

      <div class="test-scenarios">
        <example-custom-validator-test />
        <example-cross-field-validator-test />
        <example-range-validation-test />
        <example-conditional-validator-test />
        <example-multiple-validators-test />
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
export class AdvancedValidationIndexComponent {}
