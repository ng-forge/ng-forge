import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm } from '@ng-forge/dynamic-form';

/**
 * Backward Navigation Test Component
 * Tests ability to navigate backwards through multi-page form
 */
@Component({
  selector: 'app-backward-navigation',
  imports: [DynamicForm, JsonPipe],
  templateUrl: '../test-component.html',
  styleUrl: '../test-component.styles.scss',
})
export class BackwardNavigationComponent {
  scenario = {
    testId: 'backward-navigation',
    title: 'Backward Navigation Test',
    config: {
      fields: [
        {
          key: 'page1',
          type: 'page',
          title: 'Step 1',
          fields: [
            {
              key: 'field1',
              type: 'input',
              label: 'Field 1',
              props: {
                placeholder: 'Enter data for step 1',
              },
              col: 12,
            },
          ],
        },
        {
          key: 'page2',
          type: 'page',
          title: 'Step 2',
          fields: [
            {
              key: 'field2',
              type: 'input',
              label: 'Field 2',
              props: {
                placeholder: 'Enter data for step 2',
              },
              col: 12,
            },
          ],
        },
        {
          key: 'page3',
          type: 'page',
          title: 'Step 3',
          fields: [
            {
              key: 'field3',
              type: 'input',
              label: 'Field 3',
              props: {
                placeholder: 'Enter data for step 3',
              },
              col: 12,
            },
            {
              key: 'submitBackward',
              type: 'submit',
              label: 'Submit',
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
