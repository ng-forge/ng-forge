import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { AddArrayItemEvent, DynamicForm, FormConfig } from '@ng-forge/dynamic-forms';

class AddTagsEvent extends AddArrayItemEvent {
  constructor() {
    super('tags', {
      key: 'tag',
      type: 'input',
      label: 'Tag',
    });
  }
}

/**
 * Array Max Length Test Component
 * Tests maximum length constraint on array fields
 */
@Component({
  selector: 'example-array-max-length-test',
  imports: [DynamicForm, JsonPipe],
  styleUrl: '../test-styles.scss',
  template: `
    <div class="test-page">
      <h1>Maximum Length</h1>
      <section class="test-scenario" [attr.data-testid]="testId">
        <h2>{{ title }}</h2>
        <p class="scenario-description">{{ description }}</p>
        <dynamic-form [config]="config" [(value)]="value" (submitted)="onSubmitted($event)" />
        <details class="debug-output">
          <summary>Debug Output</summary>
          <pre [attr.data-testid]="'form-value-' + testId">{{ value() | json }}</pre>
        </details>
      </section>
    </div>
  `,
})
export class ArrayMaxLengthTestComponent {
  testId = 'array-max-length';
  title = 'Maximum Length';
  description = 'Test maximum length constraint on array fields';
  config = {
    fields: [
      {
        key: 'tags',
        type: 'array',
        // maxLength: 3,
        fields: [
          {
            type: 'row',
            fields: [
              {
                key: 'tag',
                type: 'input',
                label: 'Tag',
              },
              {
                key: 'addTagButton',
                type: 'addArrayItem',
                label: 'Add Tag',
                className: 'array-add-button',
              },
            ],
          },
        ],
      },
    ],
  } as const satisfies FormConfig;
  value = signal<Record<string, unknown>>({
    tags: [{ tag: 'tag1' }, { tag: 'tag2' }],
  });
  submissionLog = signal<Array<{ timestamp: string; testId: string; data: Record<string, unknown> }>>([]);

  onSubmitted(value: Record<string, unknown> | undefined): void {
    if (!value) return;
    const submission = { timestamp: new Date().toISOString(), testId: this.testId, data: value };
    this.submissionLog.update((log) => [...log, submission]);
    window.dispatchEvent(new CustomEvent('formSubmitted', { detail: submission }));
  }
}
