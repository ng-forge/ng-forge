import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ExampleIframeComponent } from '../../../../app/components/example-iframe';

@Component({
  selector: 'complete-form-iframe-demo',
  imports: [ExampleIframeComponent],
  template: `<example-iframe library="ionic" example="complete-form" [code]="code" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompleteFormIframeDemoComponent {
  code = `{
  fields: [
    { key: 'firstName', type: 'input', label: 'First Name', required: true, minLength: 2,
      validationMessages: { required: 'This field is required', minLength: 'Must be at least {{requiredLength}} characters' },
      props: { placeholder: 'Enter your first name' } },
    { key: 'lastName', type: 'input', label: 'Last Name', required: true, minLength: 2,
      validationMessages: { required: 'This field is required', minLength: 'Must be at least {{requiredLength}} characters' },
      props: { placeholder: 'Enter your last name' } },
    { key: 'email', type: 'input', label: 'Email Address', required: true, email: true,
      validationMessages: { required: 'This field is required', email: 'Please enter a valid email address' },
      props: { type: 'email', placeholder: 'user@example.com', helperText: 'We will never share your email' } },
    { key: 'age', type: 'input', label: 'Age', required: true, min: 18, max: 120,
      validationMessages: { required: 'This field is required', min: 'Must be at least {{min}}', max: 'Must not exceed {{max}}' },
      props: { type: 'number', placeholder: '18' } },
    { key: 'country', type: 'select', label: 'Country', required: true,
      validationMessages: { required: 'This field is required' },
      options: [
        { value: 'us', label: 'United States' }, { value: 'uk', label: 'United Kingdom' },
        { value: 'ca', label: 'Canada' }, { value: 'au', label: 'Australia' },
        { value: 'de', label: 'Germany' }, { value: 'fr', label: 'France' }, { value: 'jp', label: 'Japan' }
      ],
      props: { placeholder: 'Select your country' } },
    { key: 'plan', type: 'select', label: 'Subscription Plan', required: true,
      validationMessages: { required: 'This field is required' },
      options: [
        { value: 'free', label: 'Free - $0/month' }, { value: 'pro', label: 'Pro - $10/month' },
        { value: 'enterprise', label: 'Enterprise - $50/month' }
      ],
      props: { placeholder: 'Choose a plan' } },
    { key: 'bio', type: 'textarea', label: 'Bio',
      props: { placeholder: 'Tell us about yourself', helperText: 'Optional - share a bit about yourself', rows: 4, autoGrow: true } },
    { key: 'newsletter', type: 'checkbox', label: 'Subscribe to newsletter', props: { labelPlacement: 'end' } },
    { type: 'submit', key: 'submit', label: 'Create Account', props: { color: 'primary', expand: 'block' } },
  ],
}`;
}
