import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig } from '@ng-forge/dynamic-form';

@Component({
  selector: 'app-select-demo',
  imports: [DynamicForm, JsonPipe],
  template: `
    <div class="demo-container">
      <dynamic-form [config]="fields" [(value)]="formOutput"></dynamic-form>
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
export class SelectDemoComponent {
  formOutput = signal({});

  fields = {
    fields: [
      {
        key: 'singleSelect',
        type: 'select',
        label: 'Single Selection',
        props: {
          placeholder: 'Choose an option...',
          appearance: 'outline',
          hint: 'Select one option',
          options: [
            { value: 'angular', label: 'Angular' },
            { value: 'react', label: 'React' },
            { value: 'vue', label: 'Vue.js' },
            { value: 'svelte', label: 'Svelte' },
          ],
        },
      },
      {
        key: 'multiSelect',
        type: 'select',
        label: 'Multiple Selection',
        props: {
          placeholder: 'Choose multiple options...',
          appearance: 'outline',
          multiple: true,
          hint: 'Select multiple technologies',
          options: [
            { value: 'typescript', label: 'TypeScript' },
            { value: 'javascript', label: 'JavaScript' },
            { value: 'html', label: 'HTML' },
            { value: 'css', label: 'CSS' },
            { value: 'scss', label: 'SCSS' },
          ],
        },
      },
    ],
  } as const satisfies FormConfig;
}
