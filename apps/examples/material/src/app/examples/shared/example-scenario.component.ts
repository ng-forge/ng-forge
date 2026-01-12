import { ChangeDetectionStrategy, Component, computed, inject, input, linkedSignal } from '@angular/core';
import { DOCUMENT, JsonPipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { DynamicForm } from '@ng-forge/dynamic-forms';
import { ExampleScenario } from './types';
import '@ng-forge/dynamic-forms-material';

/**
 * Generic component for rendering a single example scenario.
 * Reads scenario data from route data or accepts it as an input.
 * Supports `?minimal=true` query parameter to hide the form data output.
 * Supports `?theme=dark` query parameter to enable dark theme.
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
    @if (!minimal()) {
      <div class="example-result">
        <h4>Form Data:</h4>
        <pre>{{ formValue() | json }}</pre>
      </div>
    }
  `,
})
export default class ExampleScenarioComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly document = inject(DOCUMENT);

  /** Scenario passed directly as input (for embedding in other components) */
  // eslint-disable-next-line @angular-eslint/no-input-rename
  scenarioInput = input<ExampleScenario | undefined>(undefined, { alias: 'scenario' });

  /** Scenario loaded from route data */
  private readonly routeScenario = toSignal(this.route.data.pipe(map((data) => data['scenario'] as ExampleScenario | undefined)));

  /** Whether to hide the form data output (minimal mode) */
  minimal = toSignal(this.route.queryParams.pipe(map((params) => params['minimal'] === 'true')), { initialValue: false });

  constructor() {
    // Apply theme from query params
    this.route.queryParams
      .pipe(
        map((params) => params['theme']),
        takeUntilDestroyed(),
      )
      .subscribe((theme) => {
        if (theme) {
          this.document.documentElement.setAttribute('data-theme', theme);
        }
      });
  }

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
