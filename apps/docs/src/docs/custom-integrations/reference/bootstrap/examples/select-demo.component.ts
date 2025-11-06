import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig, provideDynamicForm } from '@ng-forge/dynamic-form';
import { withBootstrapFields } from '@ng-forge/dynamic-form-bootstrap/no-augmentation';
import { BootstrapDesignContainer } from '../bootstrap.container';

@Component({
  selector: 'app-bs-select-demo',
  imports: [DynamicForm, JsonPipe, BootstrapDesignContainer],
  providers: [provideDynamicForm(...withBootstrapFields())],
  template: `
    <app-bootstrap-container>
      <h3>Bootstrap Select Examples</h3>
      <p>Demonstration of select dropdowns with Bootstrap styling.</p>
      <dynamic-form [config]="fields" [(value)]="formOutput" />
      <h4>Form Data:</h4>
      <pre>{{ formOutput() | json }}</pre>
    </app-bootstrap-container>
  `,
})
export class BsSelectDemoComponent {
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
          placeholder: 'Choose a framework...',
          helpText: 'Select one option from the list',
        },
      },
      {
        key: 'singleSelectFloating',
        type: 'select',
        label: 'Floating Label Select',
        options: [
          { value: 'js', label: 'JavaScript' },
          { value: 'ts', label: 'TypeScript' },
          { value: 'py', label: 'Python' },
          { value: 'java', label: 'Java' },
        ],
        props: {
          placeholder: 'Choose a language...',
          floatingLabel: true,
          helpText: 'Select with floating label',
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
          placeholder: 'Choose multiple technologies...',
          multiple: true,
          helpText: 'Select multiple technologies (use Ctrl/Cmd to select multiple)',
        },
      },
      {
        key: 'requiredSelect',
        type: 'select',
        label: 'Required Selection',
        options: [
          { value: 'beginner', label: 'Beginner' },
          { value: 'intermediate', label: 'Intermediate' },
          { value: 'advanced', label: 'Advanced' },
          { value: 'expert', label: 'Expert' },
        ],
        props: {
          placeholder: 'Select your skill level...',
          helpText: 'This field is required',
        },
        required: true,
      },
      {
        key: 'smallSelect',
        type: 'select',
        label: 'Small Select',
        options: [
          { value: 'sm1', label: 'Option 1' },
          { value: 'sm2', label: 'Option 2' },
          { value: 'sm3', label: 'Option 3' },
        ],
        props: {
          placeholder: 'Small size...',
          size: 'sm',
          helpText: 'Small size variant',
        },
      },
      {
        key: 'largeSelect',
        type: 'select',
        label: 'Large Select',
        options: [
          { value: 'lg1', label: 'Option 1' },
          { value: 'lg2', label: 'Option 2' },
          { value: 'lg3', label: 'Option 3' },
        ],
        props: {
          placeholder: 'Large size...',
          size: 'lg',
          helpText: 'Large size variant',
        },
      },
    ],
  } as const satisfies FormConfig;
}
