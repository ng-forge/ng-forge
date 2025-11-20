import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig } from '@ng-forge/dynamic-form';

/**
 * Navigation with Validation Test Component
 * Tests page navigation with required field validation
 */
@Component({
  selector: 'examplevalidation-navigation',
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
export class ValidationNavigationComponent {
  testId = 'validation-navigation';
  title = 'Navigation with Validation';
  config = {
    fields: [
      // Page 1: Required fields
      {
        key: 'page1',
        type: 'page',
        fields: [
          {
            key: 'page1-title',
            type: 'text',
            label: 'Required Information',
            col: 12,
          },
          {
            key: 'requiredField',
            type: 'input',
            label: 'Required Field',
            props: {
              placeholder: 'This field is required',
            },
            required: true,
            col: 12,
          },
          {
            key: 'emailField',
            type: 'input',
            label: 'Email',
            props: {
              type: 'email',
              placeholder: 'Enter valid email',
            },
            email: true,
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
      // Page 2: Optional fields
      {
        key: 'page2',
        type: 'page',
        fields: [
          {
            key: 'page2-title',
            type: 'text',
            label: 'Additional Details',
            col: 12,
          },
          {
            key: 'optionalField',
            type: 'input',
            label: 'Optional Field',
            props: {
              placeholder: 'This field is optional',
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
            key: 'submitValidation',
            type: 'submit',
            label: 'Submit Form',
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
