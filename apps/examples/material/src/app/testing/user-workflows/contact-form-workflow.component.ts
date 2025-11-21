import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig } from '@ng-forge/dynamic-forms';

/**
 * Contact Form Workflow Test Component
 * Tests complex form with multiple field types
 */
@Component({
  selector: 'example-contact-form-workflow',
  standalone: true,
  imports: [DynamicForm, JsonPipe],
  template: `
    <div class="test-page">
      <section class="test-scenario" data-testid="contact-form">
        <h2>Complex Form Workflow</h2>
        <dynamic-form [config]="config" [(value)]="value" (submitted)="onSubmitted($event)" />

        <details class="debug-output">
          <summary>Debug Output</summary>
          <pre [attr.data-testid]="'form-value-contact-form'">{{ value() | json }}</pre>
        </details>
      </section>
    </div>
  `,
  styleUrl: '../test-styles.scss',
})
export class ContactFormWorkflowComponent {
  config = {
    fields: [
      {
        key: 'name',
        type: 'input',
        label: 'Full Name',
        required: true,
      },
      {
        key: 'email',
        type: 'input',
        label: 'Email',
        required: true,
        email: true,
        props: {
          type: 'email',
        },
      },
      {
        key: 'message',
        type: 'textarea',
        label: 'Message',
        required: true,
        props: {
          rows: 5,
          placeholder: 'Enter your message here...',
        },
      },
      {
        key: 'submit',
        type: 'submit',
        label: 'Send Message',
      },
    ],
  } as const satisfies FormConfig;

  value = signal<Record<string, unknown>>({});

  onSubmitted(formValue: Record<string, unknown> | undefined): void {
    if (!formValue) return;

    const submission = {
      timestamp: new Date().toISOString(),
      testId: 'contact-form',
      data: formValue,
    };

    window.dispatchEvent(new CustomEvent('formSubmitted', { detail: submission }));
  }
}
