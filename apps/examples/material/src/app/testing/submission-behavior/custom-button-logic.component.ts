import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig } from '@ng-forge/dynamic-forms';

/**
 * Custom Button Logic Test Component
 * Tests that field-level logic overrides form-level defaults
 */
@Component({
  selector: 'example-custom-button-logic',
  imports: [DynamicForm, JsonPipe],
  template: `
    <div class="test-page">
      <h1>{{ title }}</h1>

      <section class="test-scenario" [attr.data-testid]="testId">
        <h2>FormStateCondition Logic</h2>
        <p class="scenario-description">
          Tests that submit button uses FormStateCondition logic. The button is disabled when 'formSubmitting' is true (during submission).
        </p>

        <dynamic-form [config]="config" [(value)]="value" (submitted)="onSubmitted($event)" />

        @if (isSubmitting()) {
          <div class="submission-status" data-testid="submitting-indicator">Submitting... (button uses formSubmitting condition)</div>
        }

        <details class="debug-output">
          <summary>Debug Output</summary>
          <pre [attr.data-testid]="'form-value-' + testId">{{ value() | json }}</pre>
        </details>
      </section>

      <section class="test-scenario" [attr.data-testid]="testId2">
        <h2>Conditional Expression Logic</h2>
        <p class="scenario-description">
          Tests that submit button can use conditional expressions. The button is disabled when the 'disableSubmit' checkbox is checked.
        </p>

        <dynamic-form [config]="config2" [(value)]="value2" (submitted)="onSubmitted2($event)" />

        <details class="debug-output">
          <summary>Debug Output</summary>
          <pre [attr.data-testid]="'form-value-' + testId2">{{ value2() | json }}</pre>
        </details>
      </section>

      <section class="test-scenario" [attr.data-testid]="testId3">
        <h2>Explicit Disabled</h2>
        <p class="scenario-description">
          Tests that explicit disabled: true always wins over logic. This button is always disabled regardless of form state.
        </p>

        <dynamic-form [config]="config3" [(value)]="value3" (submitted)="onSubmitted3($event)" />

        <details class="debug-output">
          <summary>Debug Output</summary>
          <pre [attr.data-testid]="'form-value-' + testId3">{{ value3() | json }}</pre>
        </details>
      </section>
    </div>
  `,
  styleUrl: '../test-styles.scss',
  styles: [
    `
      .submission-status {
        padding: 1rem;
        background: #fff3e0;
        border: 1px solid #ff9800;
        border-radius: 4px;
        margin-top: 1rem;
      }
    `,
  ],
})
export class CustomButtonLogicComponent {
  testId = 'form-state-condition';
  testId2 = 'conditional-expression';
  testId3 = 'explicit-disabled';
  title = 'Custom Button Logic';

  value = signal<Record<string, unknown>>({
    email: 'valid@example.com',
    name: 'Valid Name',
  });
  value2 = signal<Record<string, unknown>>({});
  value3 = signal<Record<string, unknown>>({});
  isSubmitting = signal(false);

  // Config 1: FormStateCondition logic
  config: FormConfig = {
    fields: [
      {
        key: 'email',
        type: 'input',
        label: 'Email',
        props: { type: 'email', placeholder: 'Enter email' },
        required: true,
        col: 6,
      },
      {
        key: 'name',
        type: 'input',
        label: 'Name',
        props: { placeholder: 'Enter name' },
        required: true,
        col: 6,
      },
      {
        key: 'submitFormState',
        type: 'submit',
        label: 'Submit (uses formSubmitting condition)',
        col: 12,
        logic: [
          {
            type: 'disabled',
            condition: 'formSubmitting',
          },
        ],
      },
    ],
    submission: {
      action: async () => {
        this.isSubmitting.set(true);
        await new Promise((resolve) => setTimeout(resolve, 2000));
        this.isSubmitting.set(false);
        return undefined;
      },
    },
  };

  // Config 2: Conditional expression logic
  config2: FormConfig = {
    fields: [
      {
        key: 'email2',
        type: 'input',
        label: 'Email',
        props: { type: 'email', placeholder: 'Enter email' },
        col: 6,
      },
      {
        key: 'disableSubmit',
        type: 'checkbox',
        label: 'Disable submit button',
        col: 6,
      },
      {
        key: 'submitConditional',
        type: 'submit',
        label: 'Submit (disabled when checkbox checked)',
        col: 12,
        logic: [
          {
            type: 'disabled',
            condition: {
              type: 'fieldValue',
              fieldPath: 'disableSubmit',
              operator: 'equals',
              value: true,
            },
          },
        ],
      },
    ],
  };

  // Config 3: Explicit disabled
  config3: FormConfig = {
    fields: [
      {
        key: 'email3',
        type: 'input',
        label: 'Email',
        props: { type: 'email', placeholder: 'Enter email' },
        col: 12,
      },
      {
        key: 'submitExplicit',
        type: 'submit',
        label: 'Submit (always disabled)',
        col: 12,
        disabled: true,
      },
    ],
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

  onSubmitted3(value: Record<string, unknown> | undefined): void {
    if (!value) return;
    window.dispatchEvent(
      new CustomEvent('formSubmitted', {
        detail: { testId: this.testId3, data: value },
      }),
    );
  }
}
