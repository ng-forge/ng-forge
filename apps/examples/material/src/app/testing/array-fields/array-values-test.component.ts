import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { AddArrayItemEvent, DynamicForm } from '@ng-forge/dynamic-form';

class AddTasksEvent extends AddArrayItemEvent {
  constructor() {
    super('tasks', {
      key: 'taskName',
      type: 'input',
      label: 'Task',
    });
  }
}

/**
 * Array Values Test Component
 * Tests maintaining values when adding items to array fields
 */
@Component({
  selector: 'example-array-values-test',
  imports: [DynamicForm, JsonPipe],
  styleUrl: '../test-styles.scss',
  template: `
    <div class="test-page">
      <h1>Maintain Values</h1>
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
export class ArrayValuesTestComponent {
  testId = 'array-values';
  title = 'Maintain Values';
  description = 'Verify that existing values are maintained when adding new items';
  config = {
    fields: [
      {
        key: 'tasks',
        type: 'array',
        label: 'Tasks',
        fields: [
          {
            key: 'taskName',
            type: 'input',
            label: 'Task',
          },
        ],
      },
      {
        key: 'addTaskButton',
        type: 'button',
        label: 'Add Task',
        className: 'array-add-button',
        event: AddTasksEvent,
        props: { color: 'primary' },
      },
    ],
  };
  value = signal<Record<string, unknown>>({});
  submissionLog = signal<Array<{ timestamp: string; testId: string; data: Record<string, unknown> }>>([]);

  onSubmitted(value: Record<string, unknown> | undefined): void {
    if (!value) return;
    const submission = { timestamp: new Date().toISOString(), testId: this.testId, data: value };
    this.submissionLog.update((log) => [...log, submission]);
    window.dispatchEvent(new CustomEvent('formSubmitted', { detail: submission }));
  }
}
