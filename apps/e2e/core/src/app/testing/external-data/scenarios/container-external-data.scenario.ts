import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { DynamicForm, FormConfig, FormResetEvent } from '@ng-forge/dynamic-forms';

/**
 * Reproduces issue #507: `hidden` logic on layout containers (group/row/container)
 * driven by `externalData` and `custom` (functionName) conditions.
 *
 * A top-level container evaluates its condition the same way a leaf field does, and
 * a nested container evaluates with `externalData`/custom functions in scope. When
 * `mode === 'active'` every container hides (like leaf `leafField`), removing its
 * child input from the DOM.
 */
@Component({
  selector: 'example-container-external-data-scenario',
  imports: [DynamicForm, JsonPipe, MatButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="test-page">
      <h1>Container Hidden Logic with External Data</h1>

      <section class="test-scenario" data-testid="container-external-data-test">
        <div class="external-controls">
          <button mat-flat-button (click)="toggleMode()" data-testid="toggle-mode">Mode: {{ mode() }}</button>
          <span class="current-state" data-testid="current-state">mode = {{ mode() }}</span>
        </div>

        <form [dynamic-form]="config" [(value)]="formValue"></form>

        <details class="debug-output">
          <summary>Debug Output</summary>
          <pre data-testid="form-value">{{ formValue() | json }}</pre>
        </details>
      </section>
    </div>
  `,
  styles: `
    .external-controls {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    .current-state {
      font-family: monospace;
    }
    .debug-output pre {
      background: #fafafa;
      padding: 1rem;
      border-radius: 4px;
      overflow: auto;
    }
  `,
})
export class ContainerExternalDataScenarioComponent {
  readonly mode = signal<'active' | 'idle'>('active');
  readonly formValue = signal<Record<string, unknown>>({});

  readonly config: FormConfig = {
    externalData: {
      mode: this.mode,
    },
    customFnConfig: {
      customFunctions: {
        // Registered custom function — never invoked before the #507 fix.
        probe: (ctx) => ctx.externalData?.['mode'] === 'active',
      },
    },
    fields: [
      // Leaf reference field — always worked; hidden when mode is active.
      {
        key: 'leafField',
        type: 'input',
        label: 'Leaf Field',
        value: '',
        logic: [{ type: 'hidden', condition: { type: 'javascript', expression: "externalData.mode === 'active'" } }],
      },
      // Top-level container, javascript condition reading externalData.
      {
        key: 'jsGroup',
        type: 'group',
        logic: [{ type: 'hidden', condition: { type: 'javascript', expression: "externalData.mode === 'active'" } }],
        fields: [{ key: 'jsChild', type: 'input', label: 'JS Child', value: '' }],
      },
      // Top-level container, custom (functionName) condition.
      {
        key: 'customGroup',
        type: 'group',
        logic: [{ type: 'hidden', condition: { type: 'custom', functionName: 'probe' } }],
        fields: [{ key: 'customChild', type: 'input', label: 'Custom Child', value: '' }],
      },
      // Nested container (row inside group) — condition evaluated with externalData in scope.
      {
        key: 'outerGroup',
        type: 'group',
        fields: [
          {
            key: 'nestedRow',
            type: 'row',
            logic: [{ type: 'hidden', condition: { type: 'javascript', expression: "externalData.mode === 'active'" } }],
            fields: [{ key: 'nestedChild', type: 'input', label: 'Nested Child', value: '' }],
          },
        ],
      },
      // Generic button (adapter button mapper) — hidden via a custom function reading externalData.
      {
        key: 'actionButton',
        type: 'button',
        label: 'Action Button',
        event: FormResetEvent,
        logic: [{ type: 'hidden', condition: { type: 'custom', functionName: 'probe' } }],
      },
    ],
  };

  toggleMode(): void {
    this.mode.update((m) => (m === 'active' ? 'idle' : 'active'));
  }
}
