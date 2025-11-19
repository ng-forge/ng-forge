import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm } from '@ng-forge/dynamic-form';

/**
 * Network Interruption Test Component
 * Tests form behavior during network issues
 */
@Component({
  selector: 'example-network-interruption-test',
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
export class NetworkInterruptionTestComponent {
  testId = 'network-interruption';
  title = 'Network Interruption Test';
  description = 'Testing form behavior during network issues';

  config = {
    fields: [
      {
        key: 'networkPage1',
        type: 'page',
        title: 'Network Test Page 1',
        fields: [
          {
            key: 'networkData1',
            type: 'textarea',
            label: 'Large Data Field',
            props: {
              placeholder: 'Enter large amount of data',
              rows: 5,
            },
            col: 12,
          },
        ],
      },
      {
        key: 'networkPage2',
        type: 'page',
        title: 'Network Test Page 2',
        fields: [
          {
            key: 'networkData2',
            type: 'textarea',
            label: 'More Large Data',
            props: {
              placeholder: 'More data that might be affected by network',
              rows: 5,
            },
            col: 12,
          },
          {
            key: 'submitNetwork',
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
