import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig } from '@ng-forge/dynamic-forms';

const DEMO_CONFIG = {
  fields: [
    {
      key: 'name',
      type: 'input',
      label: 'Full Name',
      required: true,
      props: { placeholder: 'Enter your name' },
    },
    {
      key: 'email',
      type: 'input',
      label: 'Email Address',
      required: true,
      email: true,
      props: { placeholder: 'Enter your email' },
    },
    {
      key: 'role',
      type: 'select',
      label: 'Role',
      options: [
        { label: 'Developer', value: 'developer' },
        { label: 'Designer', value: 'designer' },
        { label: 'Manager', value: 'manager' },
      ],
      props: { placeholder: 'Select a role' },
    },
    {
      key: 'subscribe',
      type: 'checkbox',
      label: 'Subscribe to newsletter',
      value: false,
    },
  ],
} as const satisfies FormConfig;

@Component({
  selector: 'unified-demo-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DynamicForm, JsonPipe],
  template: `
    <form [dynamic-form]="config" [(value)]="formValue"></form>

    <details style="margin-top: 16px">
      <summary style="cursor: pointer; font-weight: 500; color: #666">Form Value</summary>
      <pre style="margin-top: 8px; padding: 12px; background: #f5f5f5; border-radius: 8px; font-size: 0.8125rem; overflow-x: auto">{{
        formValue() | json
      }}</pre>
    </details>
  `,
})
export class DemoFormComponent {
  readonly config = DEMO_CONFIG;
  readonly formValue = signal<Record<string, unknown> | undefined>(undefined);
}
