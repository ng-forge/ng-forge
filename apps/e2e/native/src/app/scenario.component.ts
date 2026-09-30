import { ChangeDetectionStrategy, Component, computed, input, linkedSignal, signal } from '@angular/core';
import { DynamicForm } from '@ng-forge/dynamic-forms';
import { Text, View } from '@ng-native/components';
import { TestScenario } from './types';

/**
 * Renders one scenario, plus the debug output the flows assert against: the form value, and
 * what the last submission carried. Both are compact JSON so a flow can compare them exactly.
 */
@Component({
  selector: 'app-scenario',
  imports: [DynamicForm, View, Text],
  template: `
    <view [testID]="scenario().testId">
      <text class="title">{{ scenario().title }}</text>
      @if (scenario().description) {
        <text class="description">{{ scenario().description }}</text>
      }
      <form [dynamic-form]="scenario().config" [(value)]="value" (submitted)="onSubmitted($event)"></form>
      <view class="debug">
        <text class="debug-label">Form value</text>
        <text class="debug-value" testID="form-value">{{ valueJson() }}</text>
        <text class="debug-label">Submissions</text>
        <text class="debug-value" testID="submission-count">{{ submissions().length }}</text>
        <text class="debug-value" testID="last-submission">{{ lastSubmissionJson() }}</text>
      </view>
    </view>
  `,
  styles: `
    .title {
      font-size: 22px;
      font-weight: 700;
      color: #1f2328;
      margin-bottom: 4px;
    }
    .description {
      font-size: 14px;
      color: #59636e;
      margin-bottom: 16px;
    }
    .debug {
      margin-top: 16px;
      padding: 12px;
      gap: 4px;
      border-radius: 6px;
      background-color: #f6f8fa;
    }
    .debug-label {
      font-size: 12px;
      font-weight: 600;
      color: #59636e;
    }
    .debug-value {
      font-size: 12px;
      font-family: monospace;
      color: #1f2328;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScenarioComponent {
  readonly scenario = input.required<TestScenario>();

  protected readonly value = linkedSignal<Record<string, unknown> | undefined>(() => this.scenario().initialValue);
  protected readonly submissions = signal<unknown[]>([]);

  protected readonly valueJson = computed(() => JSON.stringify(this.value() ?? {}));
  protected readonly lastSubmissionJson = computed(() => JSON.stringify(this.submissions().at(-1) ?? null));

  protected onSubmitted(value: unknown): void {
    this.submissions.update((all) => [...all, value]);
  }
}
