import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig } from '@ng-forge/dynamic-forms';

/**
 * Range Validation Test Component
 * Tests that maximum value is greater than minimum value
 */
@Component({
  selector: 'example-range-validation-test',
  imports: [DynamicForm, JsonPipe],
  styleUrl: '../test-styles.scss',
  template: `
    <div class="test-page">
      <h1>Range Validation Test</h1>
      <section class="test-scenario" [attr.data-testid]="testId">
        <h2>{{ title }}</h2>
        <p class="scenario-description">{{ description }}</p>
        <dynamic-form [config]="config" [(value)]="value" (submitted)="onSubmitted($event)" />
        <details class="debug-output">
          <summary>Debug Output</summary>
          <pre [attr.data-testid]="'form-value-' + testId">{{ value() | json }}</pre>
        </details>
      </section>
    </div>
  `,
})
export class RangeValidationTestComponent {
  testId = 'range-validation-test';
  title = 'Range Validation Test';
  description = 'Maximum value must be greater than minimum value';

  config = {
    fields: [
      {
        key: 'minValue',
        type: 'input',
        label: 'Minimum Value',
        props: {
          type: 'number',
        },
        required: true,
        col: 6,
      },
      {
        key: 'maxValue',
        type: 'input',
        label: 'Maximum Value',
        props: {
          type: 'number',
        },
        required: true,
        validators: [
          {
            type: 'custom',
            expression: 'fieldValue && formValue.minValue && +fieldValue > +formValue.minValue',
            kind: 'greaterThanMin',
          },
        ],
        col: 6,
        validationMessages: {
          greaterThanMin: 'Maximum must be greater than minimum',
        },
      },
      {
        key: 'submit',
        type: 'submit',
        label: 'Submit',
        col: 12,
      },
    ],
  } as const satisfies FormConfig;

  value = signal<Record<string, unknown>>({});
  submissionLog = signal<Array<{ timestamp: string; testId: string; data: Record<string, unknown> }>>([]);

  onSubmitted(value: Record<string, unknown> | undefined): void {
    if (!value) return;

    const submission = {
      timestamp: new Date().toISOString(),
      testId: this.testId,
      data: value,
    };

    this.submissionLog.update((log) => [...log, submission]);

    window.dispatchEvent(new CustomEvent('formSubmitted', { detail: submission }));
  }
}
