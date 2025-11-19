import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm } from '@ng-forge/dynamic-form';

/**
 * State Management Testing Component
 * Tests form state tracking and management
 */
@Component({
  selector: 'app-state-management-test',
  standalone: true,
  imports: [DynamicForm, JsonPipe],
  template: `
    <div class="test-page">
      <h1>Form State Management</h1>
      <section class="test-scenario" data-testid="state-management">
        <h2 data-testid="state-management-title">Form State Management</h2>
        <p class="scenario-description">Testing form state tracking and management</p>
        <dynamic-form [config]="config" [(value)]="value" (submitted)="onSubmitted($event)" />

        <details class="debug-output form-state">
          <summary>Debug Output</summary>
          <pre [attr.data-testid]="'form-value-state-management'">{{ value() | json }}</pre>
          @if (submissions().length > 0) {
            <div class="submissions">
              <strong>Submissions:</strong>
              @for (sub of submissions(); track sub.timestamp; let i = $index) {
                <div [attr.data-testid]="'submission-' + i">{{ sub.timestamp }}: {{ sub.data | json }}</div>
              }
            </div>
          }
        </details>
      </section>
    </div>
  `,
  styleUrl: '../test-component.styles.scss',
})
export class StateManagementTestComponent {
  value = signal<Record<string, unknown>>({});
  submissions = signal<Array<{ timestamp: string; data: Record<string, unknown> }>>([]);

  config = {
    fields: [
      {
        key: 'stateInput1',
        type: 'input',
        label: 'State Input 1',
        props: {
          placeholder: 'Enter value 1',
        },
        col: 6,
      },
      {
        key: 'stateInput2',
        type: 'input',
        label: 'State Input 2',
        props: {
          placeholder: 'Enter value 2',
        },
        col: 6,
      },
      {
        key: 'stateCheckbox',
        type: 'checkbox',
        label: 'State Checkbox',
        col: 12,
      },
      {
        key: 'submitState',
        type: 'submit',
        label: 'Submit State Test',
        col: 12,
      },
    ],
  };

  onSubmitted(value: Record<string, unknown> | undefined): void {
    if (!value) return;

    const submission = {
      timestamp: new Date().toISOString(),
      data: value,
    };

    this.submissions.update((subs) => [...subs, submission]);

    window.dispatchEvent(new CustomEvent('formSubmitted', { detail: { ...submission, testId: 'state-management' } }));
  }
}
