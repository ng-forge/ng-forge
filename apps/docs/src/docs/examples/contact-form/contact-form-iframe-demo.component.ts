import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ExampleIframeComponent } from '../../../app/components/example-iframe';

@Component({
  selector: 'contact-form-iframe-demo',
  imports: [ExampleIframeComponent],
  template: `<example-iframe library="material" example="complete-form" [code]="code" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactFormIframeDemoComponent {
  code = `{
  fields: [
    {
      key: 'firstName',
      type: 'input',
      label: 'First Name',
      required: true,
      props: { placeholder: 'Your first name' },
    },
    {
      key: 'lastName',
      type: 'input',
      label: 'Last Name',
      required: true,
      props: { placeholder: 'Your last name' },
    },
    {
      key: 'email',
      type: 'input',
      label: 'Email Address',
      required: true,
      email: true,
      props: { type: 'email', placeholder: 'email@example.com' },
    },
    {
      key: 'phone',
      type: 'input',
      label: 'Phone Number',
      props: { type: 'tel', placeholder: '+1 (555) 000-0000' },
    },
    {
      key: 'bio',
      type: 'textarea',
      label: 'Biography',
      maxLength: 500,
      props: { rows: 4, placeholder: 'Tell us about yourself' },
    },
    {
      key: 'country',
      type: 'select',
      label: 'Country',
      options: [
        { value: 'us', label: 'United States' },
        { value: 'uk', label: 'United Kingdom' },
        { value: 'ca', label: 'Canada' },
        { value: 'au', label: 'Australia' },
      ],
    },
    { key: 'newsletter', type: 'checkbox', label: 'Subscribe to newsletter' },
    {
      key: 'terms',
      type: 'checkbox',
      label: 'I agree to the terms and conditions',
      required: true,
    },
    {
      type: 'submit',
      key: 'submit',
      label: 'Create Account',
      props: { color: 'primary' },
    },
  ],
}`;
}
