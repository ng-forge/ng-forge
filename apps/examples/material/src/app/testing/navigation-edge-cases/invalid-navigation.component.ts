import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm } from '@ng-forge/dynamic-form';

/**
 * Invalid Navigation Test Component
 * Tests invalid page navigation attempts
 */
@Component({
  selector: 'example-invalid-navigation-test',
  imports: [DynamicForm, JsonPipe],
  templateUrl: '../test-component.template.html',
  styleUrl: '../test-component.styles.scss',
})
export class InvalidNavigationTestComponent {
  testId = 'invalid-navigation';
  title = 'Invalid Navigation Test';
  description = 'Testing invalid page navigation attempts';

  config = {
    fields: [
      {
        key: 'validPage1',
        type: 'page',
        title: 'Valid Page 1',
        fields: [
          {
            key: 'requiredField',
            type: 'input',
            label: 'Required Field',
            required: true,
            col: 12,
          },
        ],
      },
      {
        key: 'validPage2',
        type: 'page',
        title: 'Valid Page 2',
        fields: [
          {
            key: 'optionalField',
            type: 'input',
            label: 'Optional Field',
            col: 12,
          },
          {
            key: 'submitInvalid',
            type: 'submit',
            label: 'Submit',
            col: 12,
          },
        ],
      },
    ],
  };

  value = signal<Record<string, unknown>>({});
  submissionLog = signal<Array<{ timestamp: string; testId: string; data: Record<string, unknown> }>>([]);

  onSubmitted(formValue: Record<string, unknown> | undefined): void {
    if (!formValue) return;

    const submission = {
      timestamp: new Date().toISOString(),
      testId: this.testId,
      data: formValue,
    };

    this.submissionLog.update((log) => [...log, submission]);

    window.dispatchEvent(new CustomEvent('formSubmitted', { detail: submission }));
  }
}
