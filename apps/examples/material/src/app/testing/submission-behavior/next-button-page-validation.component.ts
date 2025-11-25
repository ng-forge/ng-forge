import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig } from '@ng-forge/dynamic-forms';

/**
 * Next Button Page Validation Test Component
 * Tests that next button is disabled based on current page validity
 */
@Component({
  selector: 'example-next-button-page-validation',
  imports: [DynamicForm, JsonPipe],
  template: `
    <div class="test-page">
      <h1>{{ title }}</h1>

      <section class="test-scenario" [attr.data-testid]="testId">
        <h2>{{ title }}</h2>
        <p class="scenario-description">
          Tests that the next button is disabled when the current page has invalid fields. Fill the required field on page 1 to enable the
          next button.
        </p>

        <dynamic-form [config]="config" [(value)]="value" (submitted)="onSubmitted($event)" />

        <details class="debug-output">
          <summary>Debug Output</summary>
          <pre [attr.data-testid]="'form-value-' + testId">{{ value() | json }}</pre>
        </details>
      </section>

      <section class="test-scenario" [attr.data-testid]="testId2">
        <h2>Next Button Never Disabled</h2>
        <p class="scenario-description">
          Tests that form options can disable the page validation behavior. This next button should never be auto-disabled based on page
          validity.
        </p>

        <dynamic-form [config]="config2" [(value)]="value2" (submitted)="onSubmitted2($event)" />

        <details class="debug-output">
          <summary>Debug Output</summary>
          <pre [attr.data-testid]="'form-value-' + testId2">{{ value2() | json }}</pre>
        </details>
      </section>
    </div>
  `,
  styleUrl: '../test-styles.scss',
})
export class NextButtonPageValidationComponent {
  testId = 'next-button-page-validation';
  testId2 = 'next-button-never-disabled';
  title = 'Next Button Page Validation';

  value = signal<Record<string, unknown>>({});
  value2 = signal<Record<string, unknown>>({});

  // Config 1: Default behavior - next disabled when page invalid
  config: FormConfig = {
    fields: [
      {
        key: 'page1',
        type: 'page',
        fields: [
          {
            key: 'page1Title',
            type: 'text',
            label: 'Page 1 - Required Field',
            col: 12,
          },
          {
            key: 'requiredField',
            type: 'input',
            label: 'Required Field',
            props: { placeholder: 'Fill this to enable Next button' },
            required: true,
            col: 12,
          },
          {
            key: 'nextToPage2',
            type: 'next',
            label: 'Next (disabled when page invalid)',
            col: 12,
          },
        ],
      },
      {
        key: 'page2',
        type: 'page',
        fields: [
          {
            key: 'page2Title',
            type: 'text',
            label: 'Page 2 - You made it!',
            col: 12,
          },
          {
            key: 'optionalField',
            type: 'input',
            label: 'Optional Field',
            props: { placeholder: 'This is optional' },
            col: 12,
          },
          {
            key: 'previousToPage1',
            type: 'previous',
            label: 'Previous',
            col: 6,
          },
          {
            key: 'submitPageValidation',
            type: 'submit',
            label: 'Submit',
            col: 6,
          },
        ],
      },
    ],
  };

  // Config 2: Custom options - next never auto-disabled
  config2: FormConfig = {
    fields: [
      {
        key: 'page1b',
        type: 'page',
        fields: [
          {
            key: 'page1bTitle',
            type: 'text',
            label: 'Page 1 - Next Always Enabled',
            col: 12,
          },
          {
            key: 'requiredField2',
            type: 'input',
            label: 'Required Field (but next still enabled)',
            props: { placeholder: 'This is required but next stays enabled' },
            required: true,
            col: 12,
          },
          {
            key: 'nextToPage2b',
            type: 'next',
            label: 'Next (never auto-disabled)',
            col: 12,
          },
        ],
      },
      {
        key: 'page2b',
        type: 'page',
        fields: [
          {
            key: 'page2bTitle',
            type: 'text',
            label: 'Page 2 - You made it (even with invalid page 1)!',
            col: 12,
          },
          {
            key: 'previousToPage1b',
            type: 'previous',
            label: 'Previous',
            col: 6,
          },
          {
            key: 'submitNeverDisabled',
            type: 'submit',
            label: 'Submit',
            col: 6,
          },
        ],
      },
    ],
    options: {
      nextButton: {
        disableWhenPageInvalid: false,
      },
    },
  };

  onSubmitted(value: Record<string, unknown> | undefined): void {
    if (!value) return;
    window.dispatchEvent(
      new CustomEvent('formSubmitted', {
        detail: { testId: this.testId, data: value },
      }),
    );
  }

  onSubmitted2(value: Record<string, unknown> | undefined): void {
    if (!value) return;
    window.dispatchEvent(
      new CustomEvent('formSubmitted', {
        detail: { testId: this.testId2, data: value },
      }),
    );
  }
}
