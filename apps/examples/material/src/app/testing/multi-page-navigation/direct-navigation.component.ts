import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm } from '@ng-forge/dynamic-form';

/**
 * Direct Page Navigation Test Component
 * Tests ability to jump directly to specific pages
 */
@Component({
  selector: 'app-direct-navigation',
  imports: [DynamicForm, JsonPipe],
  templateUrl: '../test-component.html',
  styleUrl: '../test-component.styles.scss',
})
export class DirectNavigationComponent {
  scenario = {
    testId: 'direct-navigation',
    title: 'Direct Page Navigation',
    config: {
      fields: [
        {
          key: 'intro',
          type: 'page',
          title: 'Introduction',
          fields: [
            {
              key: 'introText',
              type: 'input',
              label: 'Introduction',
              props: {
                placeholder: 'Introduction text',
              },
              col: 12,
            },
          ],
        },
        {
          key: 'details',
          type: 'page',
          title: 'Details',
          fields: [
            {
              key: 'detailText',
              type: 'input',
              label: 'Details',
              props: {
                placeholder: 'Detail text',
              },
              col: 12,
            },
          ],
        },
        {
          key: 'summary',
          type: 'page',
          title: 'Summary',
          fields: [
            {
              key: 'summaryText',
              type: 'input',
              label: 'Summary',
              props: {
                placeholder: 'Summary text',
              },
              col: 12,
            },
            {
              key: 'submitDirect',
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
