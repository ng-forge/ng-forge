import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { AddArrayItemEvent, DynamicForm, FormConfig } from '@ng-forge/dynamic-forms';

class AddMembersEvent extends AddArrayItemEvent {
  constructor() {
    super('members', {
      key: 'member',
      type: 'group',
      fields: [
        {
          key: 'name',
          type: 'input',
          label: 'Name',
          required: true,
        },
        {
          key: 'email',
          type: 'input',
          label: 'Email',
          required: true,
          email: true,
        },
      ],
    });
  }
}

/**
 * Array Item Validation Test Component
 * Tests validation rules on array item fields
 */
@Component({
  selector: 'example-array-item-validation-test',
  imports: [DynamicForm, JsonPipe],
  styleUrl: '../test-styles.scss',
  template: `
    <div class="test-page">
      <h1>Item Validation</h1>
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
export class ArrayItemValidationTestComponent {
  testId = 'array-item-validation';
  title = 'Item Validation';
  description = 'Test validation rules on array item fields';
  config = {
    fields: [
      {
        key: 'members',
        type: 'array',
        label: 'Team Members',
        fields: [
          {
            key: 'member',
            type: 'group',
            fields: [
              {
                key: 'name',
                type: 'input',
                label: 'Name',
                required: true,
              },
              {
                key: 'email',
                type: 'input',
                label: 'Email',
                required: true,
                email: true,
              },
            ],
          },
        ],
      },
      {
        key: 'addMemberButton',
        type: 'button',
        label: 'Add Member',
        className: 'array-add-button',
        event: AddMembersEvent,
      },
    ],
  } as const satisfies FormConfig;
  value = signal<Record<string, unknown>>({});
  submissionLog = signal<Array<{ timestamp: string; testId: string; data: Record<string, unknown> }>>([]);

  onSubmitted(value: Record<string, unknown> | undefined): void {
    if (!value) return;
    const submission = { timestamp: new Date().toISOString(), testId: this.testId, data: value };
    this.submissionLog.update((log) => [...log, submission]);
    window.dispatchEvent(new CustomEvent('formSubmitted', { detail: submission }));
  }
}
