import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm } from '@ng-forge/dynamic-forms';
import { presetValueA, presetValueB, valueBindingConfig } from './value-binding.scenario';

/**
 * Route component for the value two-way binding test.
 * Has buttons that programmatically set the form value signal
 * to verify the [(value)] binding updates form fields.
 */
@Component({
  selector: 'example-value-binding',
  imports: [DynamicForm, JsonPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="test-page">
      <h1>Value Two-Way Binding</h1>

      <section class="test-scenario" data-testid="value-binding">
        <h2>Value Two-Way Binding</h2>
        <p class="scenario-description">Programmatically set [(value)] and verify form fields update</p>

        <div class="value-controls">
          <button type="button" data-testid="set-value-a" (click)="setValueA()">Set Value A</button>
          <button type="button" data-testid="set-value-b" (click)="setValueB()">Set Value B</button>
          <button type="button" data-testid="clear-value" (click)="clearValue()">Clear Value</button>
        </div>

        <form [dynamic-form]="config" [(value)]="formValue"></form>

        <details class="debug-output" open>
          <summary>Debug Output</summary>
          <pre data-testid="form-value-value-binding">{{ formValue() | json }}</pre>
        </details>
      </section>
    </div>
  `,
  styleUrl: '../../test-styles.scss',
  styles: [
    `
      .value-controls {
        display: flex;
        gap: 0.5rem;
        margin-bottom: 1rem;
        flex-wrap: wrap;
      }
      .value-controls button {
        padding: 0.5rem 1rem;
        border: 1px solid #ccc;
        background: #f5f5f5;
        cursor: pointer;
        border-radius: 4px;
      }
      .value-controls button:hover {
        background: #e0e0e0;
      }
    `,
  ],
})
export class ValueBindingComponent {
  readonly config = valueBindingConfig;
  readonly formValue = signal<Record<string, unknown>>({});

  setValueA(): void {
    this.formValue.set({ ...presetValueA });
  }

  setValueB(): void {
    this.formValue.set({ ...presetValueB });
  }

  clearValue(): void {
    this.formValue.set({});
  }
}
