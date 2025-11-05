import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig } from '@ng-forge/dynamic-form';

@Component({
  selector: 'app-multi-checkbox-demo',
  imports: [DynamicForm, JsonPipe],
  template: `
    <dynamic-form [config]="fields" [(value)]="formOutput" />
    <h4>Form Data:</h4>
    <pre>{{ formOutput() | json }}</pre>
  `,
})
export class MultiCheckboxDemoComponent {
  formOutput = signal({});

  fields = {
    fields: [
      {
        key: 'features',
        type: 'multi-checkbox',
        label: 'Select Features',
        options: [
          { value: 'dashboard', label: 'Dashboard' },
          { value: 'analytics', label: 'Analytics' },
          { value: 'reporting', label: 'Reporting' },
          { value: 'api', label: 'API Access' },
        ],
        props: {
          color: 'primary',
          hint: 'Choose multiple features',
        },
      },
      {
        key: 'technologies',
        type: 'multi-checkbox',
        label: 'Technologies',
        options: [
          { value: 'angular', label: 'Angular' },
          { value: 'typescript', label: 'TypeScript' },
          { value: 'material', label: 'Material Design' },
          { value: 'rxjs', label: 'RxJS' },
          { value: 'signals', label: 'Angular Signals' },
        ],
        props: {
          color: 'accent',
          hint: 'Select technologies you use',
        },
      },
    ],
  } as const satisfies FormConfig;
}
