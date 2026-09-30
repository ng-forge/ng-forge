import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { DynamicForm, type FormConfig, provideDynamicForm } from '@ng-forge/dynamic-forms';
import { withNativeFields } from './adapter/providers';

@Component({
  selector: 'app-host',
  imports: [DynamicForm],
  template: `<form [dynamic-form]="config()" [(value)]="value" (submitted)="submissions.push($event)"></form>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Host {
  readonly config = input.required<FormConfig>();
  readonly value = signal<Record<string, unknown> | undefined>(undefined);
  readonly submissions: unknown[] = [];
}

/** `render(...host(config))`: the host component plus the options that mount it. */
export const host = (config: unknown) => [Host, { inputs: { config }, providers: [provideDynamicForm(...withNativeFields())] }] as const;
