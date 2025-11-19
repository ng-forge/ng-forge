import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm } from '@ng-forge/dynamic-form';

/**
 * Make Fields Readonly Using Conditional Logic
 */
@Component({
  selector: 'app-readonly-logic-test',
  imports: [DynamicForm, JsonPipe],
  template: `
    <div class="test-page">
      <section class="test-scenario" data-testid="readonly-logic-test">
        <h2>Make Fields Readonly Using Conditional Logic</h2>
        <dynamic-form [config]="config" [(value)]="value" (submitted)="onSubmitted($event)" />

        <details class="debug-output">
          <summary>Debug Output</summary>
          <pre [attr.data-testid]="'form-value-readonly-logic-test'">{{ value() | json }}</pre>
        </details>
      </section>
    </div>
  `,
  styleUrl: '../test-component.styles.scss',
})
export class ReadonlyLogicTestComponent {
  config = {
    fields: [
      {
        key: 'editMode',
        type: 'checkbox',
        label: 'Enable Edit Mode',
        col: 12,
      },
      {
        key: 'username',
        type: 'input',
        label: 'Username',
        value: 'existing_user',
        logic: [
          {
            type: 'readonly',
            condition: {
              type: 'javascript',
              expression: '!formValue.editMode',
            },
          },
        ],
        col: 12,
      },
      {
        key: 'submit',
        type: 'button',
        label: 'Submit',
        props: {
          type: 'submit',
          color: 'primary',
        },
        col: 12,
      },
    ],
  };

  value = signal<Record<string, unknown>>({});
  submissionLog = signal<Array<{ timestamp: string; testId: string; data: Record<string, unknown> }>>([]);

  onSubmitted(value: Record<string, unknown> | undefined): void {
    if (!value) return;

    const submission = {
      timestamp: new Date().toISOString(),
      testId: 'readonly-logic-test',
      data: value,
    };

    this.submissionLog.update((log) => [...log, submission]);

    window.dispatchEvent(new CustomEvent('formSubmitted', { detail: submission }));
  }
}
