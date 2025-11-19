import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig } from '@ng-forge/dynamic-form';

/**
 * Page Refresh Edge Case Test Component
 * Tests form behavior during page refresh
 */
@Component({
  selector: 'example-refresh-test',
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
export class RefreshTestComponent {
  testId = 'refresh-test';
  title = 'Page Refresh Edge Case';
  description = 'Testing form behavior during page refresh';

  config = {
    fields: [
      {
        key: 'refreshPage1',
        type: 'page',
        fields: [
          { key: 'page-1-title', type: 'text', label: 'Page 1 title' },
          {
            key: 'refreshData1',
            type: 'input',
            label: 'Data Before Refresh',
            props: {
              placeholder: 'This data should survive refresh',
            },
            required: true,
            col: 12,
          },
        ],
      },
      {
        key: 'refreshPage2',
        type: 'page',
        fields: [
          { key: 'page-2-title', type: 'text', label: 'Page 2 title' },
          {
            key: 'refreshData2',
            type: 'input',
            label: 'Data After Refresh',
            props: {
              placeholder: 'Enter data after refresh',
            },
            col: 12,
          },
          {
            key: 'submitRefresh',
            type: 'submit',
            label: 'Submit After Refresh',
            col: 12,
          },
        ],
      },
    ],
  } as const satisfies FormConfig;

  value = signal<Record<string, unknown>>({});
  submissionLog = signal<Array<{ timestamp: string; testId: string; data: Record<string, unknown> }>>([]);

  onSubmitted(formValue: Record<string, unknown> | undefined): void {
    if (!formValue) return;

    const submission = {
      timestamp: new Date().toISOString(),
      testId: this.testId,
      data: formValue,
    };

    this.submissionLog.update((log) => [...log, submission]);

    window.dispatchEvent(new CustomEvent('formSubmitted', { detail: submission }));
  }
}
