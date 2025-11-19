import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm } from '@ng-forge/dynamic-form';

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
        title: 'Rapid Navigation Page 1',
        fields: [
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
        title: 'Rapid Navigation Page 2',
        fields: [
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
        title: 'Rapid Navigation Page 3',
        fields: [
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
