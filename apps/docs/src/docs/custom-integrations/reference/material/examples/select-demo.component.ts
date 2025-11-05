import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig, provideDynamicForm } from '@ng-forge/dynamic-form';
import { withMaterialFields } from '@ng-forge/dynamic-form-material';

@Component({
  selector: 'app-select-demo',
  imports: [DynamicForm, JsonPipe],
  providers: [provideDynamicForm(...withMaterialFields())],
  template: `
    <dynamic-form [config]="fields" [(value)]="formOutput" />
    <h4>Form Data:</h4>
    <pre>{{ formOutput() | json }}</pre>
  `,
})
export class SelectDemoComponent {
  formOutput = signal({});

  fields = {
    fields: [
      {
        key: 'singleSelect',
        type: 'select',
        label: 'Single Selection',
        options: [
          { value: 'angular', label: 'Angular' },
          { value: 'react', label: 'React' },
          { value: 'vue', label: 'Vue.js' },
          { value: 'svelte', label: 'Svelte' },
        ],
        props: {
          placeholder: 'Choose an option...',
          appearance: 'outline',
          hint: 'Select one option',
        },
      },
      {
        key: 'multiSelect',
        type: 'select',
        label: 'Multiple Selection',
        options: [
          { value: 'typescript', label: 'TypeScript' },
          { value: 'javascript', label: 'JavaScript' },
          { value: 'html', label: 'HTML' },
          { value: 'css', label: 'CSS' },
          { value: 'scss', label: 'SCSS' },
        ],
        props: {
          placeholder: 'Choose multiple options...',
          appearance: 'outline',
          multiple: true,
          hint: 'Select multiple technologies',
        },
      },
    ],
  } as const satisfies FormConfig;
}
