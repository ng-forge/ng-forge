import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig } from '@ng-forge/dynamic-forms';

@Component({
  selector: 'example-slider-value-display',
  imports: [DynamicForm, JsonPipe],
  template: `
    <section class="test-scenario" data-testid="slider-value-display">
      <h2>Slider - Value Display</h2>
      <dynamic-form [config]="config" [(value)]="value" (submitted)="onSubmitted($event)" />

      <details class="debug-output form-state">
        <summary>Debug Output</summary>
        <pre [attr.data-testid]="'form-value-slider-value-display'">{{ value() | json }}</pre>
      </details>
    </section>
  `,
  styleUrl: '../test-styles.scss',
})
export class SliderValueDisplayComponent {
  config = {
    fields: [
      {
        key: 'brightness',
        type: 'slider',
        label: 'Brightness',
        value: 75,
        minValue: 0,
        maxValue: 100,
      },
    ],
  } as const satisfies FormConfig;

  value = signal<Record<string, unknown>>({});
  submissionLog = signal<Array<{ timestamp: string; testId: string; data: Record<string, unknown> }>>([]);

  onSubmitted(value: Record<string, unknown> | undefined): void {
    if (!value) return;

    const submission = {
      timestamp: new Date().toISOString(),
      testId: 'slider-value-display',
      data: value,
    };

    this.submissionLog.update((log) => [...log, submission]);

    window.dispatchEvent(new CustomEvent('formSubmitted', { detail: submission }));
  }
}
