import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig } from '@ng-forge/dynamic-form';

/**
 * Grid Layout Testing Component
 * Tests responsive grid system with various column configurations
 */
@Component({
  selector: 'example-grid-layout-test',
  standalone: true,
  imports: [DynamicForm, JsonPipe],
  template: `
    <div class="test-page">
      <h1>Grid Layout Testing</h1>
      <section class="test-scenario" data-testid="grid-layout">
        <h2 data-testid="grid-layout-title">Grid Layout Testing</h2>
        <p class="scenario-description">Testing responsive grid system with various column configurations</p>
        <dynamic-form [config]="config" [(value)]="value" (submitted)="onSubmitted($event)" />

        <details class="debug-output form-state">
          <summary>Debug Output</summary>
          <pre [attr.data-testid]="'form-value-grid-layout'">{{ value() | json }}</pre>
          @if (submissions().length > 0) {
            <div class="submissions">
              <strong>Submissions:</strong>
              @for (sub of submissions(); track sub.timestamp; let i = $index) {
                <div [attr.data-testid]="'submission-' + i">{{ sub.timestamp }}: {{ sub.data | json }}</div>
              }
            </div>
          }
        </details>
      </section>
    </div>
  `,
  styleUrl: '../test-styles.scss',
})
export class GridLayoutTestComponent {
  value = signal<Record<string, unknown>>({});
  submissions = signal<Array<{ timestamp: string; data: Record<string, unknown> }>>([]);

  config = {
    fields: [
      {
        key: 'fullWidth',
        type: 'input',
        label: 'Full Width (col-12)',
        props: {
          placeholder: 'This takes full width',
        },
        col: 12,
      },
      {
        key: 'halfWidth1',
        type: 'input',
        label: 'Half Width 1 (col-6)',
        props: {
          placeholder: 'Half width field 1',
        },
        col: 6,
      },
      {
        key: 'halfWidth2',
        type: 'input',
        label: 'Half Width 2 (col-6)',
        props: {
          placeholder: 'Half width field 2',
        },
        col: 6,
      },
      {
        key: 'thirdWidth1',
        type: 'input',
        label: 'Third Width 1 (col-4)',
        props: {
          placeholder: 'Third width field 1',
        },
        col: 4,
      },
      {
        key: 'thirdWidth2',
        type: 'input',
        label: 'Third Width 2 (col-4)',
        props: {
          placeholder: 'Third width field 2',
        },
        col: 4,
      },
      {
        key: 'thirdWidth3',
        type: 'input',
        label: 'Third Width 3 (col-4)',
        props: {
          placeholder: 'Third width field 3',
        },
        col: 4,
      },
      {
        key: 'quarterWidth1',
        type: 'input',
        label: 'Quarter 1 (col-3)',
        props: {
          placeholder: 'Quarter 1',
        },
        col: 3,
      },
      {
        key: 'quarterWidth2',
        type: 'input',
        label: 'Quarter 2 (col-3)',
        props: {
          placeholder: 'Quarter 2',
        },
        col: 3,
      },
      {
        key: 'quarterWidth3',
        type: 'input',
        label: 'Quarter 3 (col-3)',
        props: {
          placeholder: 'Quarter 3',
        },
        col: 3,
      },
      {
        key: 'quarterWidth4',
        type: 'input',
        label: 'Quarter 4 (col-3)',
        props: {
          placeholder: 'Quarter 4',
        },
        col: 3,
      },
      {
        key: 'submitGrid',
        type: 'submit',
        label: 'Submit Grid Test',
        col: 12,
      },
    ],
  } as const satisfies FormConfig;

  onSubmitted(value: Record<string, unknown> | undefined): void {
    if (!value) return;

    const submission = {
      timestamp: new Date().toISOString(),
      data: value,
    };

    this.submissions.update((subs) => [...subs, submission]);

    window.dispatchEvent(new CustomEvent('formSubmitted', { detail: { ...submission, testId: 'grid-layout' } }));
  }
}
