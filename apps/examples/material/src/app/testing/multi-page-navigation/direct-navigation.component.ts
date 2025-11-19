import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig } from '@ng-forge/dynamic-form';

/**
 * Direct Page Navigation Test Component
 * Tests ability to jump directly to specific pages
 */
@Component({
  selector: 'example-direct-navigation',
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
export class DirectNavigationComponent {
  testId = 'direct-navigation';
  title = 'Direct Page Navigation';
  config = {
    fields: [
      {
        key: 'intro',
        type: 'page',
        fields: [
          {
            key: 'intro-title',
            type: 'text',
            label: 'Introduction',
            col: 12,
          },
          {
            key: 'introText',
            type: 'input',
            label: 'Introduction',
            props: {
              placeholder: 'Introduction text',
            },
            col: 12,
          },
        ],
      },
      {
        key: 'details',
        type: 'page',
        fields: [
          {
            key: 'details-text',
            type: 'text',
            label: 'Details',
            col: 12,
          },
          {
            key: 'detailText',
            type: 'input',
            label: 'Details',
            props: {
              placeholder: 'Detail text',
            },
            col: 12,
          },
        ],
      },
      {
        key: 'summary',
        type: 'page',
        fields: [
          {
            key: 'summary-title',
            type: 'text',
            label: 'Summary',
            col: 12,
          },
          {
            key: 'summaryText',
            type: 'input',
            label: 'Summary',
            props: {
              placeholder: 'Summary text',
            },
            col: 12,
          },
          {
            key: 'submitDirect',
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
