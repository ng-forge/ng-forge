import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig } from '@ng-forge/dynamic-form';

/**
 * Page Transition Testing Component
 * Tests smooth transitions between pages with large data sets
 */
@Component({
  selector: 'examplepage-transitions',
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
export class PageTransitionsComponent {
  testId = 'page-transitions';
  title = 'Page Transition Testing';
  config = {
    fields: [
      {
        key: 'loadingPage1',
        type: 'page',
        fields: [
          {
            key: 'loadingPage1-title',
            type: 'text',
            label: 'Page 1',
            col: 12,
          },
          {
            key: 'data1',
            type: 'textarea',
            label: 'Large Data Field',
            props: {
              placeholder: 'Enter large amount of data',
              rows: 5,
            },
            col: 12,
          },
          {
            key: 'nextToPage2',
            type: 'next',
            label: 'Next',
            col: 12,
          },
        ],
      },
      {
        key: 'loadingPage2',
        type: 'page',
        fields: [
          {
            key: 'loadingPage2-title',
            type: 'text',
            label: 'Page 2',
            col: 12,
          },
          {
            key: 'data2',
            type: 'textarea',
            label: 'More Data',
            props: {
              placeholder: 'Enter more data',
              rows: 5,
            },
            col: 12,
          },
          {
            key: 'previousToPage1',
            type: 'previous',
            label: 'Previous',
            col: 6,
          },
          {
            key: 'submitTransition',
            type: 'submit',
            label: 'Submit',
            col: 6,
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
