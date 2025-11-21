import { Component } from '@angular/core';
import { ArrayAddTestComponent } from './array-add-test.component';
import { ArrayInitialValuesTestComponent } from './array-initial-values-test.component';
import { ArrayItemValidationTestComponent } from './array-item-validation-test.component';
import { ArrayMaxLengthTestComponent } from './array-max-length-test.component';
import { ArrayMinLengthTestComponent } from './array-min-length-test.component';
import { ArrayMultipleOpsTestComponent } from './array-multiple-ops-test.component';
import { ArrayNestedTestComponent } from './array-nested-test.component';
import { ArrayRemoveTestComponent } from './array-remove-test.component';
import { ArrayValuesTestComponent } from './array-values-test.component';

/**
 * Array Fields Index Component
 * Renders all test scenarios on a single page for E2E testing
 */
@Component({
  selector: 'example-array-fields-index',
  imports: [
    ArrayAddTestComponent,
    ArrayInitialValuesTestComponent,
    ArrayItemValidationTestComponent,
    ArrayMaxLengthTestComponent,
    ArrayMinLengthTestComponent,
    ArrayMultipleOpsTestComponent,
    ArrayNestedTestComponent,
    ArrayRemoveTestComponent,
    ArrayValuesTestComponent,
  ],
  template: `
    <div class="test-page-container">
      <h1 class="page-title">Array Fields Tests</h1>
      <p class="page-subtitle">All test scenarios</p>

      <div class="test-scenarios">
        <example-array-add-test />
        <example-array-initial-values-test />
        <example-array-item-validation-test />
        <example-array-max-length-test />
        <example-array-min-length-test />
        <example-array-multiple-ops-test />
        <example-array-nested-test />
        <example-array-remove-test />
        <example-array-values-test />
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
export class ArrayFieldsIndexComponent {}
