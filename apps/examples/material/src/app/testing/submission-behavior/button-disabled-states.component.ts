import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig } from '@ng-forge/dynamic-forms';

/**
 * Button Disabled States Test Component
 * Tests that submit button is disabled based on form validity and submission state
 */
@Component({
  selector: 'example-button-disabled-states',
  imports: [DynamicForm, JsonPipe],
  template: `
    <div class="test-page">
      <h1>{{ title }}</h1>

      <section class="test-scenario" [attr.data-testid]="testId">
        <h2>{{ title }}</h2>
        <p class="scenario-description">
          Tests that the submit button is disabled when the form is invalid (default behavior). Fill all required fields to enable the
          submit button.
        </p>

        <dynamic-form [config]="config" [(value)]="value" (submitted)="onSubmitted($event)" />

        <details class="debug-output">
          <summary>Debug Output</summary>
          <pre [attr.data-testid]="'form-value-' + testId">{{ value() | json }}</pre>
        </details>
      </section>

      <section class="test-scenario" [attr.data-testid]="testId2">
        <h2>Disabled During Submission</h2>
        <p class="scenario-description">
          Tests that the submit button is disabled while the form is submitting. Click submit to see the button become disabled during the
          simulated API call.
        </p>

        <dynamic-form [config]="config2" [(value)]="value2" (submitted)="onSubmitted2($event)" />

        @if (isSubmitting()) {
          <div class="submission-status" data-testid="submitting-indicator-2">Submitting... (button should be disabled)</div>
        }

        <details class="debug-output">
          <summary>Debug Output</summary>
          <pre [attr.data-testid]="'form-value-' + testId2">{{ value2() | json }}</pre>
        </details>
      </section>

      <section class="test-scenario" [attr.data-testid]="testId3">
        <h2>Custom Options: Never Disable</h2>
        <p class="scenario-description">
          Tests that form options can disable the default behavior. This submit button should never be auto-disabled.
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
export class ButtonDisabledStatesComponent {
  testId = 'button-disabled-invalid';
  testId2 = 'button-disabled-submitting';
  testId3 = 'button-never-disabled';
  title = 'Button Disabled States';

  value = signal<Record<string, unknown>>({});
  value2 = signal<Record<string, unknown>>({
    email2: 'valid@example.com',
    name2: 'Valid Name',
  });
  value3 = signal<Record<string, unknown>>({});
  isSubmitting = signal(false);

  // Config 1: Default behavior - disabled when invalid
  config: FormConfig = {
    fields: [
      {
        key: 'email',
        type: 'input',
        label: 'Email (required)',
        props: { type: 'email', placeholder: 'Enter email' },
        required: true,
        col: 6,
      },
      {
        key: 'name',
        type: 'input',
        label: 'Name (required)',
        props: { placeholder: 'Enter name' },
        required: true,
        col: 6,
      },
      {
        key: 'submitInvalid',
        type: 'submit',
        label: 'Submit (disabled when invalid)',
        col: 12,
      },
    ],
  };

  // Config 2: Test disabled during submission
  config2: FormConfig = {
    fields: [
      {
        key: 'email2',
        type: 'input',
        label: 'Email',
        props: { type: 'email', placeholder: 'Enter email' },
        required: true,
        col: 6,
      },
      {
        key: 'name2',
        type: 'input',
        label: 'Name',
        props: { placeholder: 'Enter name' },
        required: true,
        col: 6,
      },
      {
        key: 'submitSubmitting',
        type: 'submit',
        label: 'Submit (disabled during submission)',
        col: 12,
      },
    ],
    submission: {
      action: async () => {
        this.isSubmitting.set(true);
        // Longer delay to allow testing
        await new Promise((resolve) => setTimeout(resolve, 2000));
        this.isSubmitting.set(false);
        return undefined;
      },
    },
  };

  // Config 3: Custom options - never auto-disable
  config3: FormConfig = {
    fields: [
      {
        key: 'email3',
        type: 'input',
        label: 'Email (required but button stays enabled)',
        props: { type: 'email', placeholder: 'Enter email' },
        required: true,
        col: 6,
      },
      {
        key: 'submitNeverDisabled',
        type: 'submit',
        label: 'Submit (never auto-disabled)',
        col: 12,
      },
    ],
    options: {
      submitButton: {
        disableWhenInvalid: false,
        disableWhileSubmitting: false,
      },
    },
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
