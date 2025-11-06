import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig, provideDynamicForm } from '@ng-forge/dynamic-form';
import { withPrimeNGFields } from '@ng-forge/dynamic-form-primeng';

@Component({
  selector: 'app-select-demo',
  imports: [DynamicForm, JsonPipe],
  providers: [provideDynamicForm(...withPrimeNGFields())],
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
        props: {
          placeholder: 'Choose a framework...',
          options: [
            { value: 'angular', label: 'Angular' },
            { value: 'react', label: 'React' },
            { value: 'vue', label: 'Vue.js' },
            { value: 'svelte', label: 'Svelte' },
          ],
          hint: 'Select one option',
        },
      },
      {
        key: 'selectWithFilter',
        type: 'select',
        label: 'Select with Filter',
        props: {
          placeholder: 'Search and select...',
          filter: true, // Enable filtering/search functionality
          options: [
            { value: 'typescript', label: 'TypeScript' },
            { value: 'javascript', label: 'JavaScript' },
            { value: 'python', label: 'Python' },
            { value: 'java', label: 'Java' },
            { value: 'csharp', label: 'C#' },
            { value: 'go', label: 'Go' },
            { value: 'rust', label: 'Rust' },
          ],
          hint: 'Type to filter options',
        },
        required: true,
      },
      {
        key: 'selectWithClear',
        type: 'select',
        label: 'Select with Clear Button',
        props: {
          placeholder: 'Choose a country...',
          showClear: true, // Show clear button to deselect value
          filter: true,
          options: [
            { value: 'us', label: 'United States' },
            { value: 'uk', label: 'United Kingdom' },
            { value: 'ca', label: 'Canada' },
            { value: 'au', label: 'Australia' },
            { value: 'de', label: 'Germany' },
            { value: 'fr', label: 'France' },
          ],
          hint: 'Click X to clear selection',
        },
      },
      {
        key: 'multiSelect',
        type: 'select',
        label: 'Multiple Selection',
        props: {
          placeholder: 'Choose multiple technologies...',
          multiple: true, // Enable multiple selection mode
          filter: true,
          showClear: true,
          options: [
            { value: 'html', label: 'HTML' },
            { value: 'css', label: 'CSS' },
            { value: 'scss', label: 'SCSS' },
            { value: 'tailwind', label: 'Tailwind CSS' },
            { value: 'bootstrap', label: 'Bootstrap' },
            { value: 'primeng', label: 'PrimeNG' },
          ],
          hint: 'Select multiple technologies',
        },
      },
      {
        key: 'customStyleSelect',
        type: 'select',
        label: 'Select with Custom Styling',
        props: {
          placeholder: 'Choose a plan...',
          styleClass: 'custom-select-class', // Custom CSS class
          showClear: true,
          options: [
            { value: 'free', label: 'Free - $0/month' },
            { value: 'pro', label: 'Pro - $10/month' },
            { value: 'enterprise', label: 'Enterprise - $50/month' },
          ],
          hint: 'You can upgrade or downgrade anytime',
        },
      },
    ],
  } as const satisfies FormConfig;
}
