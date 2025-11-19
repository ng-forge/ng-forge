import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig } from '@ng-forge/dynamic-form';

/**
 * Rapid Navigation Test Component
 * Tests rapid navigation clicks and race conditions
 */
@Component({
  selector: 'example-rapid-navigation-test',
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
export class RapidNavigationTestComponent {
  testId = 'rapid-navigation';
  title = 'Rapid Navigation Test';
  description = 'Testing rapid navigation clicks and race conditions';

  config = {
    fields: [
      {
        key: 'rapidPage1',
        type: 'page',
        fields: [
          { key: 'page-1-title', type: 'text', label: 'Page 1 title' },
          {
            key: 'rapidData1',
            type: 'input',
            label: 'Rapid Test Data 1',
            col: 12,
          },
        ],
      },
      {
        key: 'rapidPage2',
        type: 'page',
        fields: [
          { key: 'page-2-title', type: 'text', label: 'Page 2 title' },
          {
            key: 'rapidData2',
            type: 'input',
            label: 'Rapid Test Data 2',
            col: 12,
          },
        ],
      },
      {
        key: 'rapidPage3',
        type: 'page',
        fields: [
          { key: 'page-3-title', type: 'text', label: 'Page 3 title' },
          {
            key: 'rapidData3',
            type: 'input',
            label: 'Rapid Test Data 3',
            col: 12,
          },
          {
            key: 'submitRapid',
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
