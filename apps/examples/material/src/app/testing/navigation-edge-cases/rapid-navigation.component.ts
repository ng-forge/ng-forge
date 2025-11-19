import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm } from '@ng-forge/dynamic-form';

/**
 * Rapid Navigation Test Component
 * Tests rapid navigation clicks and race conditions
 */
@Component({
  selector: 'example-rapid-navigation-test',
  imports: [DynamicForm, JsonPipe],
  templateUrl: '../test-component.template.html',
  styleUrl: '../test-component.styles.scss',
})
export class RapidNavigationTestComponent {
  testId = 'rapid-navigation';
  title = 'Rapid Navigation Test';
  description = 'Testing rapid navigation clicks and race conditions';

  config = {
    fields: [
      {
        key: 'rapidPage1',
        type: 'page',
        title: 'Rapid Navigation Page 1',
        fields: [
          {
            key: 'rapidData1',
            type: 'input',
            label: 'Rapid Test Data 1',
            col: 12,
          },
        ],
      },
      {
        key: 'rapidPage2',
        type: 'page',
        title: 'Rapid Navigation Page 2',
        fields: [
          {
            key: 'rapidData2',
            type: 'input',
            label: 'Rapid Test Data 2',
            col: 12,
          },
        ],
      },
      {
        key: 'rapidPage3',
        type: 'page',
        title: 'Rapid Navigation Page 3',
        fields: [
          {
            key: 'rapidData3',
            type: 'input',
            label: 'Rapid Test Data 3',
            col: 12,
          },
          {
            key: 'submitRapid',
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
