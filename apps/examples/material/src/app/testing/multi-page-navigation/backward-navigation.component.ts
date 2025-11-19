import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig } from '@ng-forge/dynamic-form';

/**
 * Backward Navigation Test Component
 * Tests ability to navigate backwards through multi-page form
 */
@Component({
  selector: 'example-backward-navigation',
  imports: [DynamicForm, JsonPipe],
  template: `
    <div class="test-page">
      <h1>{{ title }}</h1>

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
export class BackwardNavigationComponent {
  testId = 'backward-navigation';
  title = 'Backward Navigation Test';
  config = {
    fields: [
      {
        key: 'page1',
        type: 'page',
        fields: [
          {
            key: 'step-1-title',
            type: 'text',
            label: 'Step 1',
            col: 12,
          },
          {
            key: 'field1',
            type: 'input',
            label: 'Field 1',
            props: {
              placeholder: 'Enter data for step 1',
            },
            col: 12,
          },
        ],
      },
      {
        key: 'page2',
        type: 'page',
        fields: [
          {
            key: 'page2-title',
            type: 'text',
            label: 'Step 2',
            col: 12,
          },
          {
            key: 'field2',
            type: 'input',
            label: 'Field 2',
            props: {
              placeholder: 'Enter data for step 2',
            },
            col: 12,
          },
        ],
      },
      {
        key: 'page3',
        type: 'page',
        fields: [
          {
            key: 'page-3-title',
            type: 'text',
            label: 'Step 3',
            col: 12,
          },
          {
            key: 'field3',
            type: 'input',
            label: 'Field 3',
            props: {
              placeholder: 'Enter data for step 3',
            },
            col: 12,
          },
          {
            key: 'submitBackward',
            type: 'submit',
            label: 'Submit',
            col: 12,
          },
        ],
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
