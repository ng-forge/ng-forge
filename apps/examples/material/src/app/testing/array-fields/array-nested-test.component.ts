import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { AddArrayItemEvent, DynamicForm, FormConfig } from '@ng-forge/dynamic-forms';

class AddUsersEvent extends AddArrayItemEvent {
  constructor() {
    super('users', {
      key: 'user',
      type: 'group',
      fields: [
        {
          key: 'firstName',
          type: 'input',
          label: 'First Name',
          col: 6,
        },
        {
          key: 'lastName',
          type: 'input',
          label: 'Last Name',
          col: 6,
        },
        {
          key: 'role',
          type: 'select',
          label: 'Role',
          options: [
            { value: 'admin', label: 'Admin' },
            { value: 'user', label: 'User' },
          ],
        },
      ],
    });
  }
}

/**
 * Array Nested Test Component
 * Tests nested group fields within array fields
 */
@Component({
  selector: 'example-array-nested-test',
  imports: [DynamicForm, JsonPipe],
  styleUrl: '../test-styles.scss',
  template: `
    <div class="test-page">
      <h1>Nested Fields</h1>
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
export class ArrayNestedTestComponent {
  testId = 'array-nested';
  title = 'Nested Fields';
  description = 'Test nested group fields within array fields';
  config = {
    fields: [
      {
        key: 'users',
        type: 'array',
        fields: [
          {
            key: 'userRow',
            type: 'row',
            fields: [
              {
                key: 'user',
                type: 'group',
                fields: [
                  {
                    key: 'firstName',
                    type: 'input',
                    label: 'First Name',
                    col: 6,
                  },
                  {
                    key: 'lastName',
                    type: 'input',
                    label: 'Last Name',
                    col: 6,
                  },
                  {
                    key: 'role',
                    type: 'select',
                    label: 'Role',
                    options: [
                      { value: 'admin', label: 'Admin' },
                      { value: 'user', label: 'User' },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        key: 'addUserButton',
        type: 'addArrayItem',
        arrayKey: 'users',
        label: 'Add User',
        className: 'array-add-button',
      },
    ],
  } as const satisfies FormConfig;
  value = signal<Record<string, unknown>>({
    users: [{ user: { firstName: '', lastName: '', role: '' } }], // Start with one empty item (group key preserved)
  });
  submissionLog = signal<Array<{ timestamp: string; testId: string; data: Record<string, unknown> }>>([]);

  onSubmitted(value: Record<string, unknown> | undefined): void {
    if (!value) return;
    const submission = { timestamp: new Date().toISOString(), testId: this.testId, data: value };
    this.submissionLog.update((log) => [...log, submission]);
    window.dispatchEvent(new CustomEvent('formSubmitted', { detail: submission }));
  }
}
