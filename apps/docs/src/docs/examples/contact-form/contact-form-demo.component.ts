import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RemoteExampleComponent } from '../../../app/components/remote-example';

@Component({
  selector: 'contact-form-demo',
  imports: [RemoteExampleComponent],
  template: `<remote-example library="material" example="complete-form" [code]="code" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactFormDemoComponent {
  code = `{
  fields: [
    { key: 'firstName', type: 'input', label: 'First Name', value: '', required: true,
      validationMessages: { required: 'This field is required' },
      props: { placeholder: 'Your first name' } },
    { key: 'lastName', type: 'input', label: 'Last Name', value: '', required: true,
      validationMessages: { required: 'This field is required' },
      props: { placeholder: 'Your last name' } },
    { key: 'email', type: 'input', label: 'Email Address', value: '', required: true, email: true,
      validationMessages: { required: 'This field is required', email: 'Please enter a valid email address' },
      props: { type: 'email', placeholder: 'email@example.com' } },
    { key: 'phone', type: 'input', label: 'Phone Number', value: '',
      props: { type: 'tel', placeholder: '+1 (555) 000-0000' } },
    { key: 'bio', type: 'textarea', label: 'Biography', value: '', maxLength: 500,
      validationMessages: { maxLength: 'Must not exceed 500 characters' },
      props: { rows: 4, placeholder: 'Tell us about yourself' } },
    { key: 'country', type: 'select', label: 'Country',
      options: [
        { value: 'us', label: 'United States' }, { value: 'uk', label: 'United Kingdom' },
        { value: 'ca', label: 'Canada' }, { value: 'au', label: 'Australia' }
      ],
      props: { placeholder: 'Select your country' } },
    { key: 'newsletter', type: 'checkbox', label: 'Subscribe to newsletter' },
    { key: 'terms', type: 'checkbox', label: 'I agree to the terms and conditions', required: true,
      validationMessages: { required: 'This field is required' } },
    { type: 'submit', key: 'submit', label: 'Create Account', props: { color: 'primary' } },
  ],
}`;
}
