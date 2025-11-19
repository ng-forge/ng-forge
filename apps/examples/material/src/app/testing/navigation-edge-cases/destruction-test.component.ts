import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm } from '@ng-forge/dynamic-form';

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
        title: 'Destruction Test Page 1',
        fields: [
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
        title: 'Destruction Test Page 2',
        fields: [
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
  };

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
