import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicFormComponent, FieldConfig } from '@ng-forge/dynamic-form';

@Component({
  selector: 'select-example',
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
export class SelectExampleComponent {
  model = signal({
    country: '',
    plan: '',
    skills: []
  });

  fields: FieldConfig[] = [
    {
      key: 'country',
      type: 'select',
      props: {
        label: 'Country',
        placeholder: 'Select your country',
        options: [
          { value: 'us', label: 'United States' },
          { value: 'uk', label: 'United Kingdom' },
          { value: 'ca', label: 'Canada' },
          { value: 'au', label: 'Australia' },
          { value: 'de', label: 'Germany' },
          { value: 'fr', label: 'France' },
          { value: 'jp', label: 'Japan' }
        ],
        required: true
      },
      validators: {
        required: true
      }
    },
    {
      key: 'plan',
      type: 'select',
      props: {
        label: 'Subscription Plan',
        placeholder: 'Choose your plan',
        options: [
          { value: 'free', label: 'Free - $0/month', description: 'Basic features' },
          { value: 'pro', label: 'Pro - $10/month', description: 'Advanced features' },
          { value: 'enterprise', label: 'Enterprise - $50/month', description: 'Full features + support' }
        ],
        hint: 'You can upgrade or downgrade anytime'
      }
    }
  ];

  onValueChange(newValue: any) {
    this.model.set(newValue);
  }
}