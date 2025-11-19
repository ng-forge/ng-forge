import { Component, resource, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig, HttpCustomValidator } from '@ng-forge/dynamic-form';
import type { FieldContext } from '@angular/forms/signals';
import { firstValueFrom, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';

// Mock database of taken product codes
const TAKEN_PRODUCT_CODES = ['PROD-001', 'PROD-002', 'PROD-123'];

// Resource-based async validator (simulates database lookup)
const checkProductCode: HttpCustomValidator = {
  params: (ctx: FieldContext<string>) => ({ productCode: ctx.value() }),
  factory: (params: any) => {
    return resource({
      loader: async () => {
        const paramsValue = params();
        if (!paramsValue?.productCode) return false;
        // Simulate async database lookup with 500ms delay

        return await firstValueFrom(
          of(paramsValue.productCode).pipe(
            delay(500),
            map((code) => TAKEN_PRODUCT_CODES.includes(code)),
          ),
        );
      },
    });
  },
  onSuccess: (result: any, ctx: FieldContext<string>) => {
    // If product code is found in the taken list, return error
    return result ? { kind: 'productCodeTaken' } : null;
  },
  onError: (error: any, ctx: FieldContext<string>) => {
    console.error('Product code check failed:', error);
    return null; // Don't block form on errors
  },
};

/**
 * Async Resource Validator Test Component
 * Tests async validation using resource-based validators (e.g., database lookups)
 */
@Component({
  selector: 'example-async-resource-validator-test',
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
  styleUrl: '../test-styles.scss',
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
  } as const satisfies FormConfig;

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
