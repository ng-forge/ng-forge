import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { DynamicForm, type FormConfig, provideDynamicForm } from '@ng-forge/dynamic-forms';
import { withNativeFields } from '@ng-forge/dynamic-forms-native';
import { render, type RenderOptions } from '@ng-native/testing';

@Component({
  selector: 'app-test-host',
  imports: [DynamicForm],
  template: `<form [dynamic-form]="config()" [(value)]="value" (submitted)="submissions.push($event)"></form>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestHost {
  readonly config = input.required<FormConfig>();
  readonly value = signal<Record<string, unknown> | undefined>(undefined);
  readonly submissions: unknown[] = [];
}

/** Renders a form with the native fields, the way the e2e app mounts one. */
export function renderForm(config: FormConfig, options: Omit<RenderOptions<TestHost>, 'inputs' | 'providers'> = {}) {
  return render(TestHost, { ...options, inputs: { config }, providers: [provideDynamicForm(...withNativeFields())] });
}

/** The form value without Signal Forms' symbol keys. */
export const plain = (value: unknown) => JSON.parse(JSON.stringify(value ?? null));
