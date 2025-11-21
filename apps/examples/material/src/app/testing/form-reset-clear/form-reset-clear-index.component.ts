import { Component } from '@angular/core';
import { ClearAllTestComponent } from './clear-all-test.component';
import { ClearCheckboxTestComponent } from './clear-checkbox-test.component';
import { ClearSelectTestComponent } from './clear-select-test.component';
import { MultipleCyclesTestComponent } from './multiple-cycles-test.component';
import { RequiredResetClearTestComponent } from './required-reset-clear-test.component';
import { ResetCheckboxTestComponent } from './reset-checkbox-test.component';
import { ResetDefaultsTestComponent } from './reset-defaults-test.component';
import { ResetNestedTestComponent } from './reset-nested-test.component';
import { ResetSelectTestComponent } from './reset-select-test.component';
import { ResetValidationTestComponent } from './reset-validation-test.component';
import { ResetVsClearTestComponent } from './reset-vs-clear-test.component';

/**
 * Form Reset Clear Index Component
 * Renders all test scenarios on a single page for E2E testing
 */
@Component({
  selector: 'example-form-reset-clear-index',
  imports: [
    ClearAllTestComponent,
    ClearCheckboxTestComponent,
    ClearSelectTestComponent,
    MultipleCyclesTestComponent,
    RequiredResetClearTestComponent,
    ResetCheckboxTestComponent,
    ResetDefaultsTestComponent,
    ResetNestedTestComponent,
    ResetSelectTestComponent,
    ResetValidationTestComponent,
    ResetVsClearTestComponent,
  ],
  template: `
    <div class="test-page-container">
      <h1 class="page-title">Form Reset Clear Tests</h1>
      <p class="page-subtitle">All test scenarios</p>

      <div class="test-scenarios">
        <example-clear-all-test />
        <example-clear-checkbox-test />
        <example-clear-select-test />
        <example-multiple-cycles-test />
        <example-required-reset-clear-test />
        <example-reset-checkbox-test />
        <example-reset-defaults-test />
        <example-reset-nested-test />
        <example-reset-select-test />
        <example-reset-validation-test />
        <example-reset-vs-clear-test />
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
export class FormResetClearIndexComponent {}
