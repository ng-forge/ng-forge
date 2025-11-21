import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig } from '@ng-forge/dynamic-forms';

@Component({
  selector: 'example-slider-bounds',
  imports: [DynamicForm, JsonPipe],
  template: `
    <section class="test-scenario" data-testid="slider-bounds">
      <h2>Slider - Min/Max Bounds</h2>
      <dynamic-form [config]="config" [(value)]="value" (submitted)="onSubmitted($event)" />

      <details class="debug-output form-state">
        <summary>Debug Output</summary>
        <pre [attr.data-testid]="'form-value-slider-bounds'">{{ value() | json }}</pre>
      </details>
    </section>
  `,
  styleUrl: '../test-styles.scss',
})
export class SliderBoundsComponent {
  config = {
    fields: [
      {
        key: 'temperature',
        type: 'slider',
        label: 'Temperature',
        value: 20,
        minValue: 10,
        maxValue: 30,
      },
    ],
  } as const satisfies FormConfig;

  value = signal<Record<string, unknown>>({});
  submissionLog = signal<Array<{ timestamp: string; testId: string; data: Record<string, unknown> }>>([]);

  onSubmitted(value: Record<string, unknown> | undefined): void {
    if (!value) return;

    const submission = {
      timestamp: new Date().toISOString(),
      testId: 'slider-bounds',
      data: value,
    };

    this.submissionLog.update((log) => [...log, submission]);

    window.dispatchEvent(new CustomEvent('formSubmitted', { detail: submission }));
  }
}
