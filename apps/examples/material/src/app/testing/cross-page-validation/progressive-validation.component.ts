import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig } from '@ng-forge/dynamic-form';

/**
 * Progressive Cross-Page Validation Scenario
 * Tests increasing validation requirements across multiple pages
 */
@Component({
  selector: 'example-progressive-validation',
  imports: [DynamicForm, JsonPipe],
  template: `
    <div class="test-page">
      <h1>Progressive Cross-Page Validation</h1>

      <section class="test-scenario" data-testid="progressive-validation">
        <h2>Progressive Cross-Page Validation</h2>
        <dynamic-form [config]="config" [(value)]="value" (submitted)="onSubmitted($event)" />

        <details class="debug-output">
          <summary>Debug Output</summary>
          <pre [attr.data-testid]="'form-value-progressive-validation'">{{ value() | json }}</pre>
        </details>
      </section>
    </div>
  `,
  styleUrl: '../test-styles.scss',
})
export class ProgressiveValidationComponent {
  value = signal<Record<string, unknown>>({});

  config = {
    fields: [
      // Page 1: Basic validation
      {
        key: 'basicPage',
        type: 'page',
        fields: [
          {
            key: 'basic-page-title',
            type: 'text',
            label: 'Basic Information',
          },
          {
            key: 'username',
            type: 'input',
            label: 'Username',
            props: {
              placeholder: 'Minimum 3 characters',
            },
            required: true,
            minLength: 3,
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
      // Page 2: Enhanced validation
      {
        key: 'enhancedPage',
        type: 'page',
        fields: [
          {
            key: 'enhanced-page-title',
            type: 'text',
            label: 'Enhanced Security',
          },
          {
            key: 'password',
            type: 'input',
            label: 'Password',
            props: {
              type: 'password',
              placeholder: 'Minimum 8 characters',
            },
            required: true,
            minLength: 8,
            col: 12,
          },
          {
            key: 'securityQuestion',
            type: 'select',
            label: 'Security Question',
            options: [
              { value: 'pet', label: "What was your first pet's name?" },
              { value: 'school', label: 'What was your first school?' },
              { value: 'city', label: 'In what city were you born?' },
            ],
            required: true,
            col: 12,
          },
          {
            key: 'securityAnswer',
            type: 'input',
            label: 'Security Answer',
            props: {
              placeholder: 'Answer to security question',
            },
            required: true,
            minLength: 2,
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
      // Page 3: Final validation
      {
        key: 'finalValidationPage',
        type: 'page',
        fields: [
          {
            key: 'final-page-title',
            type: 'text',
            label: 'Final Verification',
          },
          {
            key: 'confirmUsername',
            type: 'input',
            label: 'Confirm Username',
            props: {
              placeholder: 'Re-enter your username',
            },
            required: true,
            col: 12,
          },
          {
            key: 'verificationCode',
            type: 'input',
            label: 'Verification Code',
            props: {
              placeholder: 'Enter 6-digit code',
            },
            pattern: '^[0-9]{6}$',
            required: true,
            col: 12,
          },
          {
            key: 'previousToPage2',
            type: 'previous',
            label: 'Previous',
            col: 6,
          },
          {
            key: 'submitProgressive',
            type: 'submit',
            label: 'Complete Verification',
            col: 6,
          },
        ],
      },
    ],
  } as const satisfies FormConfig;

  onSubmitted(value: Record<string, unknown> | undefined): void {
    if (!value) return;

    const submission = {
      timestamp: new Date().toISOString(),
      testId: 'progressive-validation',
      data: value,
    };

    window.dispatchEvent(new CustomEvent('formSubmitted', { detail: submission }));
  }
}
