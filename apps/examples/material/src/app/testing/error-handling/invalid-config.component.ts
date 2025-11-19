import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm } from '@ng-forge/dynamic-form';

/**
 * Invalid Configuration Test Component
 * Tests error handling for invalid field configurations
 */
@Component({
  selector: 'example-invalid-config',
  imports: [DynamicForm, JsonPipe],
  template: `
    <div class="test-page">
      <h1>Invalid Configuration Test</h1>

      <section class="test-scenario" [attr.data-testid]="testId">
        <h2>{{ title }}</h2>
        <dynamic-form [config]="config" [(value)]="value" (submitted)="onSubmitted($event)" />

        <details class="debug-output">
          <summary>Debug Output</summary>
          <pre [attr.data-testid]="'form-value-' + testId">{{ value() | json }}</pre>
        </details>
      </section>
    </div>
  `,
  styleUrl: '../test-styles.scss',
})
export class InvalidConfigComponent {
  testId = 'invalid-config';
  title = 'Invalid Configuration Test';

  config = {
    fields: [
      // Field with missing required properties
      {
        key: 'missingType',
        label: 'Field without type',
        // type property is missing
      },
      // Field with invalid type
      {
        key: 'invalidType',
        type: 'nonexistent-field-type',
        label: 'Invalid Field Type',
      },
      // Valid field for comparison
      {
        key: 'validField',
        type: 'input',
        label: 'Valid Field',
        props: {
          placeholder: 'This should work',
        },
      },
      {
        key: 'submitInvalid',
        type: 'submit',
        label: 'Submit Invalid Config',
      },
    ],
  } as any;

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
