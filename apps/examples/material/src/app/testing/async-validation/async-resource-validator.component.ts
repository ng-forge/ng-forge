import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import type { AsyncCustomValidator } from '@ng-forge/dynamic-form';
import { DynamicForm } from '@ng-forge/dynamic-form';
import { of } from 'rxjs';
import { delay, map } from 'rxjs/operators';

// Mock database of taken product codes
const TAKEN_PRODUCT_CODES = ['PROD-001', 'PROD-002', 'PROD-123'];

// Resource-based async validator (simulates database lookup)
const checkProductCode: AsyncCustomValidator = (ctx) => {
  const productCode = ctx.value() as string;

  // Simulate async database lookup with 500ms delay
  return of(productCode).pipe(
    delay(500),
    map((code) => {
      if (TAKEN_PRODUCT_CODES.includes(code)) {
        return { kind: 'productCodeTaken' };
      }
      return null;
    }),
  );
};

/**
 * Async Resource Validator Test Component
 * Tests async validation using resource-based validators (e.g., database lookups)
 */
@Component({
  selector: 'app-async-resource-validator-test',
  standalone: true,
  imports: [DynamicForm, JsonPipe],
  template: `
    <div class="test-page">
      <h1>Async Resource Validator Test</h1>

      <section class="test-scenario" data-testid="async-resource-validator-test">
        <h2>Check Product Code Availability</h2>
        <dynamic-form [config]="config" [(value)]="formValue" (submitted)="onSubmitted($event)" />

        <details class="debug-output">
          <summary>Debug Output</summary>
          <pre [attr.data-testid]="'form-value-async-resource-validator-test'">{{ formValue() | json }}</pre>
        </details>
      </section>
    </div>
  `,
  styleUrl: '../test-component.styles.scss',
})
export class AsyncResourceValidatorTestComponent {
  formValue = signal<Record<string, unknown>>({});

  config = {
    fields: [
      {
        key: 'productCode',
        type: 'input',
        label: 'Product Code',
        required: true,
        validators: [
          {
            type: 'customAsync',
            functionName: 'checkProductCode',
          },
        ],
        validationMessages: {
          productCodeTaken: 'This product code is already in use',
        },
        col: 12,
      },
      {
        key: 'submit',
        type: 'submit',
        label: 'Submit',
        col: 12,
      },
    ],
    signalFormsConfig: {
      asyncValidators: {
        checkProductCode,
      },
    },
  };

  submissionLog = signal<Array<{ timestamp: string; testId: string; data: Record<string, unknown> }>>([]);

  onSubmitted(value: Record<string, unknown> | undefined): void {
    if (!value) return;

    const submission = {
      timestamp: new Date().toISOString(),
      testId: 'async-resource-validator-test',
      data: value,
    };

    this.submissionLog.update((log) => [...log, submission]);

    window.dispatchEvent(new CustomEvent('formSubmitted', { detail: submission }));
  }
}
