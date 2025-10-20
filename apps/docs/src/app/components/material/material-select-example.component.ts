import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicFormComponent, FieldConfig } from '@ng-forge/dynamic-form';

@Component({
  selector: 'app-material-select-example',
  imports: [DynamicFormComponent, JsonPipe],
  template: `
    <div class="example-container">
      <h4>Material Select Fields</h4>
      <dynamic-form [fields]="fields" [value]="model()" (valueChange)="onValueChange($event)" />
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
export class MaterialSelectExampleComponent {
  model = signal({
    country: '',
    plan: '',
    skills: [],
  });

  fields: FieldConfig[] = [
    {
      key: 'country',
      type: 'select',
      props: {
        label: 'Country',
        placeholder: 'Select your country',
        appearance: 'outline',
        required: true,
        options: [
          { value: 'us', label: 'United States', description: 'North America' },
          { value: 'uk', label: 'United Kingdom', description: 'Europe' },
          { value: 'ca', label: 'Canada', description: 'North America' },
          { value: 'au', label: 'Australia', description: 'Oceania' },
          { value: 'de', label: 'Germany', description: 'Europe' },
          { value: 'fr', label: 'France', description: 'Europe' },
          { value: 'jp', label: 'Japan', description: 'Asia' },
        ],
      },
      validators: {
        required: true,
      },
    },
    {
      key: 'plan',
      type: 'select',
      props: {
        label: 'Subscription Plan',
        placeholder: 'Choose your plan',
        appearance: 'fill',
        hint: 'You can upgrade or downgrade anytime',
        options: [
          { value: 'free', label: 'Free - $0/month', description: 'Basic features only' },
          { value: 'pro', label: 'Pro - $10/month', description: 'Advanced features included' },
          { value: 'enterprise', label: 'Enterprise - $50/month', description: 'Full features + priority support' },
        ],
      },
    },
    {
      key: 'skills',
      type: 'select',
      props: {
        label: 'Skills',
        placeholder: 'Select your skills',
        appearance: 'outline',
        multiple: true,
        hint: 'Select all that apply',
        options: [
          { value: 'angular', label: 'Angular' },
          { value: 'react', label: 'React' },
          { value: 'vue', label: 'Vue.js' },
          { value: 'typescript', label: 'TypeScript' },
          { value: 'javascript', label: 'JavaScript' },
          { value: 'nodejs', label: 'Node.js' },
          { value: 'python', label: 'Python' },
          { value: 'java', label: 'Java' },
        ],
      },
    },
  ];

  onValueChange(newValue: any) {
    this.model.set(newValue);
  }
}
