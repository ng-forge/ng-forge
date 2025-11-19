import { Component } from '@angular/core';
import { HttpGetValidatorTestComponent } from './http-get-validator.component';
import { HttpPostValidatorTestComponent } from './http-post-validator.component';
import { AsyncResourceValidatorTestComponent } from './async-resource-validator.component';
import { HttpErrorHandlingTestComponent } from './http-error-handling.component';
import { MultipleValidatorsTestComponent } from './multiple-validators.component';

/**
 * Consolidated Async Validation Test Page
 * Displays all async validation test scenarios on a single page for E2E testing
 */
@Component({
  selector: 'example-async-validation-page',
  standalone: true,
  imports: [
    HttpGetValidatorTestComponent,
    HttpPostValidatorTestComponent,
    AsyncResourceValidatorTestComponent,
    HttpErrorHandlingTestComponent,
    MultipleValidatorsTestComponent,
  ],
  template: `
    <div class="async-validation-test-page">
      <div class="page-header">
        <h1>Async Validation Tests</h1>
        <p class="description">
          Comprehensive testing suite for asynchronous validation including HTTP validators, resource-based validators, error handling, and
          multiple validator combinations.
        </p>
      </div>

      <div class="test-scenarios">
        <example-http-get-validator-test />
        <example-http-post-validator-test />
        <example-async-resource-validator-test />
        <example-http-error-handling-test />
        <example-multiple-validators-test />
      </div>
    </div>
  `,
  styles: [
    `
      .async-validation-test-page {
        max-width: 1200px;
        margin: 0 auto;
        padding: 2rem;
      }

      .page-header {
        text-align: center;
        margin-bottom: 3rem;
      }

      .page-header h1 {
        color: #1976d2;
        margin-bottom: 1rem;
        font-size: 2.5rem;
      }

      .description {
        color: #666;
        font-size: 1.1rem;
        max-width: 800px;
        margin: 0 auto;
      }

      .test-scenarios {
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      .test-scenarios > * {
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        padding: 1.5rem;
        background: #fff;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      @media (max-width: 768px) {
        .async-validation-test-page {
          padding: 1rem;
        }

        .page-header h1 {
          font-size: 2rem;
        }

        .description {
          font-size: 1rem;
        }
      }
    `,
  ],
})
export class AsyncValidationPageComponent {}
