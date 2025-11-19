import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm } from '@ng-forge/dynamic-form';

/**
 * Page Refresh Edge Case Test Component
 * Tests form behavior during page refresh
 */
@Component({
  selector: 'example-refresh-test',
  imports: [DynamicForm, JsonPipe],
  templateUrl: '../test-component.template.html',
  styleUrl: '../test-component.styles.scss',
})
export class RefreshTestComponent {
  testId = 'refresh-test';
  title = 'Page Refresh Edge Case';
  description = 'Testing form behavior during page refresh';

  config = {
    fields: [
      {
        key: 'refreshPage1',
        type: 'page',
        title: 'Refresh Test Page 1',
        fields: [
          {
            key: 'refreshData1',
            type: 'input',
            label: 'Data Before Refresh',
            props: {
              placeholder: 'This data should survive refresh',
            },
            required: true,
            col: 12,
          },
        ],
      },
      {
        key: 'refreshPage2',
        type: 'page',
        title: 'Refresh Test Page 2',
        fields: [
          {
            key: 'refreshData2',
            type: 'input',
            label: 'Data After Refresh',
            props: {
              placeholder: 'Enter data after refresh',
            },
            col: 12,
          },
          {
            key: 'submitRefresh',
            type: 'submit',
            label: 'Submit After Refresh',
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
