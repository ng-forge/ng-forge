import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { AddArrayItemEvent, DynamicForm, FormConfig, RemoveArrayItemEvent } from '@ng-forge/dynamic-form';

class AddNotesEvent extends AddArrayItemEvent {
  constructor() {
    super('notes', {
      key: 'note',
      type: 'input',
      label: 'Note',
    });
  }
}

class RemoveNotesEvent extends RemoveArrayItemEvent {
  constructor() {
    super('notes');
  }
}

/**
 * Array Multiple Operations Test Component
 * Tests multiple array operations (add and remove) together
 */
@Component({
  selector: 'example-array-multiple-ops-test',
  imports: [DynamicForm, JsonPipe],
  styleUrl: '../test-styles.scss',
  template: `
    <div class="test-page">
      <h1>Multiple Operations</h1>
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
export class ArrayMultipleOpsTestComponent {
  testId = 'array-multiple-ops';
  title = 'Multiple Operations';
  description = 'Test multiple array operations (add and remove) together';
  config = {
    fields: [
      {
        key: 'notes',
        type: 'array',
        label: 'Notes',
        fields: [
          {
            key: 'note',
            type: 'input',
            label: 'Note',
          },
        ],
      },
      {
        key: 'addNoteButton',
        type: 'button',
        label: 'Add Note',
        className: 'array-add-button',
        event: AddNotesEvent,
      },
      {
        key: 'removeNoteButton',
        type: 'button',
        label: 'Remove Last',
        className: 'array-remove-button',
        event: RemoveNotesEvent,
      },
    ],
  } as const satisfies FormConfig;
  value = signal<Record<string, unknown>>({
    notes: [{ note: 'First note' }, { note: 'Second note' }],
  });
  submissionLog = signal<Array<{ timestamp: string; testId: string; data: Record<string, unknown> }>>([]);

  onSubmitted(value: Record<string, unknown> | undefined): void {
    if (!value) return;
    const submission = { timestamp: new Date().toISOString(), testId: this.testId, data: value };
    this.submissionLog.update((log) => [...log, submission]);
    window.dispatchEvent(new CustomEvent('formSubmitted', { detail: submission }));
  }
}
