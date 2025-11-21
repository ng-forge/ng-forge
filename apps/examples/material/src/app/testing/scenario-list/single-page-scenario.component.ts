import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig } from '@ng-forge/dynamic-forms';

/**
 * Single Page Scenario Component
 * Test scenario for a basic single-page form
 */
@Component({
  selector: 'example-single-page-scenario',
  standalone: true,
  imports: [DynamicForm, JsonPipe],
  template: `
    <section class="test-scenario" [attr.data-testid]="testId">
      <h2>{{ title }}</h2>
      <dynamic-form [config]="config" [(value)]="value" (submitted)="onSubmitted($event)" />

      <details class="debug-output">
        <summary>Debug Output</summary>
        <pre [attr.data-testid]="'form-value-' + testId">{{ value() | json }}</pre>
      </details>
    </section>
  `,
  styleUrl: '../test-styles.scss',
})
export class SinglePageScenarioComponent {
  testId = 'single-page-scenario';
  title = 'Single Page Form';

  config = {
    fields: [
      {
        key: 'name',
        type: 'input',
        label: 'Name',
        required: true,
      },
      {
        key: 'email',
        type: 'input',
        label: 'Email',
        props: { type: 'email' },
        required: true,
      },
      {
        key: 'description',
        type: 'textarea',
        label: 'Description',
        props: {
          rows: 4,
        },
      },
      {
        key: 'submit',
        type: 'submit',
        label: 'Submit',
      },
    ],
  } as const satisfies FormConfig;

  value = signal<Record<string, unknown>>({});

  onSubmitted(value: Record<string, unknown> | undefined): void {
    if (!value) return;

    const submission = {
      timestamp: new Date().toISOString(),
      testId: this.testId,
      data: value,
    };

    window.dispatchEvent(new CustomEvent('formSubmitted', { detail: submission }));
  }
}
