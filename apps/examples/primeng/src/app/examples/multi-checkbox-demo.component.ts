import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig } from '@ng-forge/dynamic-form';

@Component({
  selector: 'app-multi-checkbox-demo',
  imports: [DynamicForm, JsonPipe],
  host: {
    class: 'example-container',
  },
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
        key: 'interests',
        type: 'multi-checkbox',
        label: 'Interests',
        props: {
          options: [
            { value: 'sports', label: 'Sports' },
            { value: 'music', label: 'Music' },
            { value: 'reading', label: 'Reading' },
            { value: 'travel', label: 'Travel' },
            { value: 'gaming', label: 'Gaming' },
          ],
          hint: 'Select all that apply',
        },
      },
      {
        key: 'skills',
        type: 'multi-checkbox',
        label: 'Technical Skills',
        props: {
          options: [
            { value: 'typescript', label: 'TypeScript' },
            { value: 'angular', label: 'Angular' },
            { value: 'react', label: 'React' },
            { value: 'vue', label: 'Vue.js' },
            { value: 'node', label: 'Node.js' },
          ],
          hint: 'Select your technical skills',
        },
        required: true,
      },
      {
        key: 'languages',
        type: 'multi-checkbox',
        label: 'Languages Spoken',
        props: {
          options: [
            { value: 'en', label: 'English' },
            { value: 'es', label: 'Spanish' },
            { value: 'fr', label: 'French' },
            { value: 'de', label: 'German' },
            { value: 'ja', label: 'Japanese' },
            { value: 'zh', label: 'Chinese' },
          ],
        },
      },
      {
        key: 'permissions',
        type: 'multi-checkbox',
        label: 'User Permissions',
        props: {
          options: [
            { value: 'read', label: 'Read' },
            { value: 'write', label: 'Write' },
            { value: 'delete', label: 'Delete' },
            { value: 'admin', label: 'Admin' },
          ],
          styleClass: 'custom-multi-checkbox-class', // Custom CSS class
          hint: 'Assign permissions to the user',
        },
      },
    ],
  } as const satisfies FormConfig;
}
