import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FieldConfig } from '@ng-forge/dynamic-form';

@Component({
  selector: 'app-material-example',
  imports: [DynamicForm, JsonPipe],
  template: `
    <div class="example-container">
      <h4>Material Input Fields</h4>
      <dynamic-form [fields]="fields" [value]="model()" (valueChange)="onValueChange($event)"></dynamic-form>
      <div class="output">
        <strong>Form Data:</strong>
        <pre>{{ model() | json }}</pre>
      </div>
    </div>
  `,
  styles: [
    `
      .example-container {
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        padding: 1.5rem;
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
      h4 {
        margin-top: 0;
        color: #1976d2;
      }
    `,
  ],
})
export class MaterialExampleComponent {
  model = signal({
    name: '',
    email: '',
    phone: '',
    website: '',
  });

  fields: FieldConfig[] = [
    {
      key: 'name',
      type: 'input',
      props: {
        label: 'Full Name',
        placeholder: 'Enter your full name',
        appearance: 'outline',
        required: true,
        hint: 'First and last name',
      },
      validators: {
        required: true,
        minLength: 2,
      },
    },
    {
      key: 'email',
      type: 'input',
      props: {
        label: 'Email Address',
        type: 'email',
        placeholder: 'user@example.com',
        appearance: 'outline',
        required: true,
        hint: 'We will never share your email',
      },
      validators: {
        required: true,
        email: true,
      },
    },
    {
      key: 'phone',
      type: 'input',
      props: {
        label: 'Phone Number',
        type: 'tel',
        placeholder: '+1 (555) 123-4567',
        appearance: 'fill',
        hint: 'Include country code',
      },
    },
    {
      key: 'website',
      type: 'input',
      props: {
        label: 'Website',
        type: 'url',
        placeholder: 'https://yoursite.com',
        appearance: 'outline',
        hint: 'Optional personal website',
      },
    },
  ];

  onValueChange(newValue: any) {
    this.model.set(newValue);
  }
}
