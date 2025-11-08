import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig } from '@ng-forge/dynamic-form';

@Component({
  selector: 'bs-example-toggle-demo',
  imports: [DynamicForm, JsonPipe],
  host: {
    class: 'example-container',
  },
  template: `
    <dynamic-form [config]="config" [(value)]="formValue" />
    <div class="example-result">
      <h4>Form Data:</h4>
      <pre>{{ formValue() | json }}</pre>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToggleDemoComponent {
  formValue = signal({});

  config = {
    fields: [
      {
        key: 'basicToggle',
        type: 'toggle',
        label: 'Basic Toggle',
        props: {
          helpText: 'Default toggle switch',
        },
      },
      {
        key: 'largeToggle',
        type: 'toggle',
        label: 'Large Toggle',
        props: {
          size: 'lg',
          helpText: 'Large size toggle',
        },
      },
      {
        key: 'reverseToggle',
        type: 'toggle',
        label: 'Reverse Toggle',
        props: {
          reverse: true,
          helpText: 'Toggle with label on the left',
        },
      },
      {
        key: 'notifications',
        type: 'toggle',
        label: 'Enable Notifications',
        checked: true,
        props: {
          helpText: 'Pre-checked toggle',
        },
      },
    ],
  } as const satisfies FormConfig;
}
