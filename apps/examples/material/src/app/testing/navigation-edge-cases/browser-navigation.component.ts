import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig } from '@ng-forge/dynamic-form';

/**
 * Browser Navigation Edge Case Test Component
 * Tests browser back/forward navigation with multi-page forms
 */
@Component({
  selector: 'example-browser-navigation-test',
  imports: [DynamicForm, JsonPipe],
  template: `
    <div class="test-page">
      <h1>{{ title }}</h1>

      <section class="test-scenario" [attr.data-testid]="testId">
        <h2>{{ title }}</h2>
        <p class="scenario-description">{{ description }}</p>
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
export class BrowserNavigationTestComponent {
  testId = 'browser-navigation';
  title = 'Browser Navigation Edge Cases';
  description = 'Testing browser back/forward navigation with multi-page forms';

  config = {
    fields: [
      {
        key: 'page1',
        type: 'page',
        fields: [
          { key: 'page-1-title', type: 'text', label: 'Page 1 title' },
          { key: 'page-1-description', type: 'text', label: 'Testing browser navigation behavior' },
          {
            key: 'step1Data',
            type: 'input',
            label: 'Step 1 Data',
            props: {
              placeholder: 'Enter step 1 data',
            },
            required: true,
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
        key: 'page2',
        type: 'page',
        fields: [
          { key: 'page-2-title', type: 'text', label: 'Page 2 title' },
          {
            key: 'step2Data',
            type: 'input',
            label: 'Step 2 Data',
            props: {
              placeholder: 'Enter step 2 data',
            },
            required: true,
            col: 12,
          },
          {
            key: 'previousToPage1',
            type: 'previous',
            label: 'Previous',
            col: 6,
          },
          {
            key: 'nextToPage3',
            type: 'next',
            label: 'Next',
            col: 6,
          },
        ],
      },
      {
        key: 'page3',
        type: 'page',
        fields: [
          { key: 'page-3-title', type: 'text', label: 'Page 3 title' },
          {
            key: 'step3Data',
            type: 'input',
            label: 'Step 3 Data',
            props: {
              placeholder: 'Enter step 3 data',
            },
            col: 12,
          },
          {
            key: 'previousToPage2',
            type: 'previous',
            label: 'Previous',
            col: 6,
          },
          {
            key: 'submitBrowserNav',
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
