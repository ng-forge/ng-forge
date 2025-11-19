import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { AddArrayItemEvent, DynamicForm } from '@ng-forge/dynamic-form';

class AddEmailsEvent extends AddArrayItemEvent {
  constructor() {
    super('emails', {
      key: 'email',
      type: 'input',
      label: 'Email',
      props: {
        type: 'email',
      },
    });
  }
}

/**
 * Array Add Test Component
 * Tests adding new items to array fields
 */
@Component({
  selector: 'example-array-add-test',
  imports: [DynamicForm, JsonPipe],
  styleUrl: '../test-styles.scss',
  template: `
    <div class="test-page">
      <h1>Add Array Items</h1>
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
})
export class ArrayAddTestComponent {
  testId = 'array-add';
  title = 'Add Array Items';
  description = 'Add new email addresses to the array field';
  config = {
    fields: [
      {
        key: 'emails',
        type: 'array',
        label: 'Email Addresses',
        fields: [
          {
            key: 'email',
            type: 'input',
            label: 'Email',
            props: { type: 'email' },
          },
        ],
      },
      {
        key: 'addEmailButton',
        type: 'button',
        label: 'Add Email',
        className: 'array-add-button',
        event: AddEmailsEvent,
        props: { color: 'primary' },
      },
    ],
  };
  value = signal<Record<string, unknown>>({});
  submissionLog = signal<Array<{ timestamp: string; testId: string; data: Record<string, unknown> }>>([]);

  onSubmitted(value: Record<string, unknown> | undefined): void {
    if (!value) return;
    const submission = { timestamp: new Date().toISOString(), testId: this.testId, data: value };
    this.submissionLog.update((log) => [...log, submission]);
    window.dispatchEvent(new CustomEvent('formSubmitted', { detail: submission }));
  }
}
