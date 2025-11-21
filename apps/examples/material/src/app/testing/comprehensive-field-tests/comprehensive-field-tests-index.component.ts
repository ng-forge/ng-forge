import { Component } from '@angular/core';
import { ComprehensiveFieldsTestComponent } from './comprehensive-fields.component';
import { GridLayoutTestComponent } from './grid-layout-test.component';
import { StateManagementTestComponent } from './state-management-test.component';
import { ValidationTestComponent } from './validation-test.component';

/**
 * Comprehensive Field Tests Index Component
 * Renders all test scenarios on a single page for E2E testing
 */
@Component({
  selector: 'example-comprehensive-field-tests-index',
  imports: [ComprehensiveFieldsTestComponent, GridLayoutTestComponent, StateManagementTestComponent, ValidationTestComponent],
  template: `
    <div class="test-page-container">
      <h1 class="page-title">Comprehensive Field Tests Tests</h1>
      <p class="page-subtitle">All test scenarios</p>

      <div class="test-scenarios">
        <example-comprehensive-fields-test />
        <example-grid-layout-test />
        <example-state-management-test />
        <example-validation-test />
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
export class ComprehensiveFieldTestsIndexComponent {}
