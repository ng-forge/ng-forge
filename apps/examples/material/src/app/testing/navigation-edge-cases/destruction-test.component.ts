import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig } from '@ng-forge/dynamic-form';

/**
 * Form Destruction Test Component
 * Tests form destruction and reconstruction
 */
@Component({
  selector: 'example-destruction-test',
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
export class DestructionTestComponent {
  testId = 'destruction-test';
  title = 'Form Destruction Test';
  description = 'Testing form destruction and reconstruction';

  config = {
    fields: [
      {
        key: 'destructPage1',
        type: 'page',
        fields: [
          { key: 'page-1-title', type: 'text', label: 'Page 1 title' },
          {
            key: 'destructData1',
            type: 'input',
            label: 'Data Before Destruction',
            col: 12,
          },
        ],
      },
      {
        key: 'destructPage2',
        type: 'page',
        fields: [
          { key: 'page-2-title', type: 'text', label: 'Page 2 title' },
          {
            key: 'destructData2',
            type: 'input',
            label: 'Data After Reconstruction',
            col: 12,
          },
          {
            key: 'submitDestruct',
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
