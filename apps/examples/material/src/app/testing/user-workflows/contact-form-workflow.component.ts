import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm } from '@ng-forge/dynamic-form';

/**
 * Contact Form Workflow Test Component
 * Tests complex form with multiple field types
 */
@Component({
  selector: 'app-contact-form-workflow',
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
  styleUrl: '../test-component.styles.scss',
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
  };

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
