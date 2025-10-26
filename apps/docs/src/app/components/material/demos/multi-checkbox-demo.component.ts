import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig } from '@ng-forge/dynamic-form';

@Component({
  selector: 'multi-checkbox-demo',
  imports: [DynamicForm, JsonPipe],
  template: `
    <div class="demo-container">
      <dynamic-form [config]="fields" (valueChange)="formOutput.set($event)"></dynamic-form>
      <div class="output">
        <strong>Form Data:</strong>
        <pre>{{ formOutput() | json }}</pre>
      </div>
    </div>
  `,
  styles: [
    `
      .demo-container {
        padding: 1rem;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        margin: 1rem 0;
      }
      .output {
        margin-top: 1rem;
        padding-top: 1rem;
        border-top: 1px solid #e0e0e0;
      }
      pre {
        background: #f5f5f5;
        padding: 0.5rem;
        border-radius: 4px;
        font-size: 0.9rem;
        margin: 0.5rem 0;
      }
    `,
  ],
})
export class MultiCheckboxDemoComponent {
  formOutput = signal({});

  fields = {
    fields: [
      {
        key: 'features',
        type: 'multi-checkbox',
        label: 'Select Features',
        props: {
          appearance: 'outline',
          color: 'primary',
          hint: 'Choose multiple features',
          options: [
            { value: 'dashboard', label: 'Dashboard' },
            { value: 'analytics', label: 'Analytics' },
            { value: 'reporting', label: 'Reporting' },
            { value: 'api', label: 'API Access' },
          ],
        },
      },
      {
        key: 'technologies',
        type: 'multi-checkbox',
        label: 'Technologies',
        props: {
          appearance: 'outline',
          color: 'accent',
          hint: 'Select technologies you use',
          options: [
            { value: 'angular', label: 'Angular' },
            { value: 'typescript', label: 'TypeScript' },
            { value: 'material', label: 'Material Design' },
            { value: 'rxjs', label: 'RxJS' },
            { value: 'signals', label: 'Angular Signals' },
          ],
        },
      },
    ],
  } as const satisfies FormConfig;
}
