import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm } from '@ng-forge/dynamic-form';

/**
 * Page Transition Testing Component
 * Tests smooth transitions between pages with large data sets
 */
@Component({
  selector: 'app-page-transitions',
  imports: [DynamicForm, JsonPipe],
  templateUrl: '../test-component.html',
  styleUrl: '../test-component.styles.scss',
})
export class PageTransitionsComponent {
  scenario = {
    testId: 'page-transitions',
    title: 'Page Transition Testing',
    config: {
      fields: [
        {
          key: 'loadingPage1',
          type: 'page',
          title: 'Page 1',
          fields: [
            {
              key: 'data1',
              type: 'textarea',
              label: 'Large Data Field',
              props: {
                placeholder: 'Enter large amount of data',
                rows: 5,
              },
              col: 12,
            },
          ],
        },
        {
          key: 'loadingPage2',
          type: 'page',
          title: 'Page 2',
          fields: [
            {
              key: 'data2',
              type: 'textarea',
              label: 'More Data',
              props: {
                placeholder: 'Enter more data',
                rows: 5,
              },
              col: 12,
            },
            {
              key: 'submitTransition',
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
