import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm } from '@ng-forge/dynamic-form';

@Component({
  selector: 'app-slider-disabled',
  imports: [DynamicForm, JsonPipe],
  template: `
    <section class="test-scenario" data-testid="slider-disabled">
      <h2>Slider - Disabled</h2>
      <dynamic-form [config]="config" [(value)]="value" (submitted)="onSubmitted($event)" />

      <details class="debug-output form-state">
        <summary>Debug Output</summary>
        <pre [attr.data-testid]="'form-value-slider-disabled'">{{ value() | json }}</pre>
      </details>
    </section>
  `,
  styleUrl: '../test-component.styles.scss',
})
export class SliderDisabledComponent {
  config = {
    fields: [
      {
        key: 'lockedSlider',
        type: 'slider',
        label: 'Locked Slider',
        value: 50,
        minValue: 0,
        maxValue: 100,
        disabled: true,
      },
    ],
  };

  value = signal<Record<string, unknown>>({});
  submissionLog = signal<Array<{ timestamp: string; testId: string; data: Record<string, unknown> }>>([]);

  onSubmitted(value: Record<string, unknown> | undefined): void {
    if (!value) return;

    const submission = {
      timestamp: new Date().toISOString(),
      testId: 'slider-disabled',
      data: value,
    };

    this.submissionLog.update((log) => [...log, submission]);

    window.dispatchEvent(new CustomEvent('formSubmitted', { detail: submission }));
  }
}
