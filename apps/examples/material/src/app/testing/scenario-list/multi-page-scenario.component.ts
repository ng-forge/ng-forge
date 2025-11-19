import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig } from '@ng-forge/dynamic-form';

/**
 * Multi-Page Scenario Component
 * Test scenario for a multi-page form with groups
 */
@Component({
  selector: 'example-multi-page-scenario',
  standalone: true,
  imports: [DynamicForm, JsonPipe],
  template: `
    <section class="test-scenario" [attr.data-testid]="testId">
      <h2>{{ title }}</h2>
      <dynamic-form [config]="config" [(value)]="value" (submitted)="onSubmitted($event)" />

      <details class="debug-output">
        <summary>Debug Output</summary>
        <pre [attr.data-testid]="'form-value-' + testId">{{ value() | json }}</pre>
      </details>
    </section>
  `,
  styleUrl: '../test-styles.scss',
})
export class MultiPageScenarioComponent {
  testId = 'multi-page-scenario';
  title = 'Multi-Page Form';

  config = {
    fields: [
      {
        key: 'page1',
        type: 'group',
        fields: [
          {
            key: 'page-1-title',
            type: 'text',
            label: 'Page 1: Basic Info',
          },
          {
            key: 'firstName',
            type: 'input',
            label: 'First Name',
            required: true,
          },
          {
            key: 'lastName',
            type: 'input',
            label: 'Last Name',
            required: true,
          },
        ],
      },
      {
        key: 'page2',
        type: 'group',
        fields: [
          {
            key: 'page-2-title',
            type: 'text',
            label: 'Page 2: Contact Info',
          },
          {
            key: 'email',
            type: 'input',
            label: 'Email',
            props: { type: 'email' },
            required: true,
          },
          {
            key: 'phone',
            type: 'input',
            label: 'Phone',
            props: { type: 'tel' },
          },
        ],
      },
      {
        key: 'submit',
        type: 'submit',
        label: 'Submit',
      },
    ],
  } as const satisfies FormConfig;

  value = signal<Record<string, unknown>>({});

  onSubmitted(value: Record<string, unknown> | undefined): void {
    if (!value) return;

    const submission = {
      timestamp: new Date().toISOString(),
      testId: this.testId,
      data: value,
    };

    window.dispatchEvent(new CustomEvent('formSubmitted', { detail: submission }));
  }
}
