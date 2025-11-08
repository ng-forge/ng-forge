import { ChangeDetectionStrategy, Component } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig } from '@ng-forge/dynamic-form';

@Component({
  selector: 'bs-example-select-demo',
  imports: [DynamicForm, JsonPipe],
  host: {
    class: 'example-container',
  },
  template: `
    <dynamic-form [config]="config" (submit)="onSubmit($event)" />
    @if (submittedData) {
    <div class="example-result">
      <h4>Submitted Data:</h4>
      <pre>{{ submittedData | json }}</pre>
    </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectDemoComponent {
  submittedData: unknown = null;

  config: FormConfig = {
    fields: [
      {
        key: 'country',
        type: 'select',
        label: 'Country',
        props: {
          placeholder: 'Select a country',
          helpText: 'Choose your country',
        },
        required: true,
        options: [
          { value: 'us', label: 'United States' },
          { value: 'uk', label: 'United Kingdom' },
          { value: 'ca', label: 'Canada' },
          { value: 'au', label: 'Australia' },
          { value: 'de', label: 'Germany' },
        ],
      },
      {
        key: 'languages',
        type: 'select',
        label: 'Languages',
        props: {
          placeholder: 'Select languages',
          multiple: true,
          size: 'lg',
          helpText: 'Select all languages you speak',
        },
        options: [
          { value: 'en', label: 'English' },
          { value: 'es', label: 'Spanish' },
          { value: 'fr', label: 'French' },
          { value: 'de', label: 'German' },
          { value: 'zh', label: 'Chinese' },
        ],
      },
      {
        key: 'size',
        type: 'select',
        label: 'Size (Small)',
        props: {
          placeholder: 'Select size',
          size: 'sm',
        },
        options: [
          { value: 's', label: 'Small' },
          { value: 'm', label: 'Medium' },
          { value: 'l', label: 'Large' },
        ],
      },
      {
        type: 'submit',
        key: 'submit',
        label: 'Submit',
        props: {
          variant: 'primary',
        },
      },
    ],
  } as const satisfies FormConfig;

  onSubmit(data: unknown) {
    this.submittedData = data;
  }
}
