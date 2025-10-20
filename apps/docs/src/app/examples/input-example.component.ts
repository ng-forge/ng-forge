import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicFormComponent, FieldConfig } from '@ng-forge/dynamic-form';

@Component({
  selector: 'input-example',
  imports: [DynamicFormComponent, JsonPipe],
  template: `
    <div class="example-container">
      <dynamic-form
        [fields]="fields"
        [value]="model()"
        (valueChange)="onValueChange($event)"
      />
      <div class="output">
        <strong>Form Data:</strong>
        <pre>{{ model() | json }}</pre>
      </div>
    </div>
  `,
  styles: [`
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
  `]
})
export class InputExampleComponent {
  model = signal({
    name: '',
    email: '',
    age: null,
    password: ''
  });

  fields: FieldConfig[] = [
    {
      key: 'name',
      type: 'input',
      props: {
        label: 'Full Name',
        placeholder: 'Enter your full name',
        required: true
      },
      validators: {
        required: true,
        minLength: 2
      }
    },
    {
      key: 'email',
      type: 'input',
      props: {
        label: 'Email Address',
        type: 'email',
        placeholder: 'user@example.com',
        hint: 'We will never share your email',
        required: true
      },
      validators: {
        required: true,
        email: true
      }
    },
    {
      key: 'age',
      type: 'input',
      props: {
        label: 'Age',
        type: 'number',
        placeholder: '25',
        hint: 'Must be 18 or older'
      },
      validators: {
        min: 18,
        max: 120
      }
    },
    {
      key: 'password',
      type: 'input',
      props: {
        label: 'Password',
        type: 'password',
        placeholder: 'Enter a secure password',
        required: true
      },
      validators: {
        required: true,
        minLength: 8
      }
    }
  ];

  onValueChange(newValue: any) {
    this.model.set(newValue);
  }
}