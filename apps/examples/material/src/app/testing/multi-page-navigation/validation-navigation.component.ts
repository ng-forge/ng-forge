import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm } from '@ng-forge/dynamic-form';

/**
 * Navigation with Validation Test Component
 * Tests page navigation with required field validation
 */
@Component({
  selector: 'app-validation-navigation',
  imports: [DynamicForm, JsonPipe],
  templateUrl: '../test-component.html',
  styleUrl: '../test-component.styles.scss',
})
export class ValidationNavigationComponent {
  scenario = {
    testId: 'validation-navigation',
    title: 'Navigation with Validation',
    config: {
      fields: [
        // Page 1: Required fields
        {
          key: 'page1',
          type: 'page',
          title: 'Required Information',
          fields: [
            {
              key: 'requiredField',
              type: 'input',
              label: 'Required Field',
              props: {
                placeholder: 'This field is required',
              },
              required: true,
              col: 12,
            },
            {
              key: 'emailField',
              type: 'input',
              label: 'Email',
              props: {
                type: 'email',
                placeholder: 'Enter valid email',
              },
              email: true,
              required: true,
              col: 12,
            },
          ],
        },
        // Page 2: Optional fields
        {
          key: 'page2',
          type: 'page',
          title: 'Additional Details',
          fields: [
            {
              key: 'optionalField',
              type: 'input',
              label: 'Optional Field',
              props: {
                placeholder: 'This field is optional',
              },
              col: 12,
            },
            {
              key: 'submitValidation',
              type: 'submit',
              label: 'Submit Form',
              col: 12,
            },
          ],
        },
      ],
    },
    value: signal<Record<string, unknown>>({}),
  };

  submissionLog = signal<Array<{ timestamp: string; testId: string; data: Record<string, unknown> }>>([]);

  onSubmitted(value: Record<string, unknown> | undefined): void {
    if (!value) return;

    const submission = {
      timestamp: new Date().toISOString(),
      testId: this.scenario.testId,
      data: value,
    };

    this.submissionLog.update((log) => [...log, submission]);

    window.dispatchEvent(new CustomEvent('formSubmitted', { detail: submission }));
  }
}
