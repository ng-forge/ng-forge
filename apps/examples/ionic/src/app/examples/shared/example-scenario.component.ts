import { ChangeDetectionStrategy, Component, computed, inject, input, linkedSignal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { DynamicForm } from '@ng-forge/dynamic-forms';
import { ExampleScenario } from './types';
import '@ng-forge/dynamic-forms-ionic';

/**
 * Generic component for rendering a single example scenario.
 * Reads scenario data from route data or accepts it as an input.
 */
@Component({
  selector: 'example-scenario',
  imports: [DynamicForm, JsonPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'example-container',
  },
  template: `
    <form [dynamic-form]="scenario().config" [(value)]="formValue"></form>
    <div class="example-result">
      <h4>Form Data:</h4>
      <pre>{{ formValue() | json }}</pre>
    </div>
  `,
})
export default class ExampleScenarioComponent {
  private readonly route = inject(ActivatedRoute);

  /** Scenario passed directly as input (for embedding in other components) */
  // eslint-disable-next-line @angular-eslint/no-input-rename
  scenarioInput = input<ExampleScenario | undefined>(undefined, { alias: 'scenario' });

  /** Scenario loaded from route data */
  private readonly routeScenario = toSignal(this.route.data.pipe(map((data) => data['scenario'] as ExampleScenario | undefined)));

  /** Resolved scenario - prefers input over route data */
  scenario = computed(() => {
    const fromInput = this.scenarioInput();
    const fromRoute = this.routeScenario();
    const resolved = fromInput ?? fromRoute;

    if (!resolved) {
      throw new Error('ExampleScenarioComponent requires a scenario via input or route data');
    }

    return resolved;
  });

  formValue = linkedSignal<Record<string, unknown>>(() => this.scenario().initialValue ?? {});
}
