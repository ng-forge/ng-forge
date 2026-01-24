import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ExampleIframeComponent } from '../../../app/components/example-iframe';

@Component({
  selector: 'user-registration-iframe-demo',
  imports: [ExampleIframeComponent],
  template: `<example-iframe library="material" example="user-registration" [code]="code" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserRegistrationIframeDemoComponent {
  code = `{
  fields: [
    {
      key: 'firstName',
      type: 'input',
      label: 'First Name',
      required: true,
      minLength: 2,
      props: { placeholder: 'Enter your first name' },
    },
    {
      key: 'lastName',
      type: 'input',
      label: 'Last Name',
      required: true,
      minLength: 2,
      props: { placeholder: 'Enter your last name' },
    },
    {
      key: 'email',
      type: 'input',
      label: 'Email Address',
      required: true,
      email: true,
      props: {
        type: 'email',
        placeholder: 'user@example.com',
        hint: 'We will never share your email',
      },
    },
    {
      key: 'age',
      type: 'input',
      label: 'Age',
      required: true,
      min: 18,
      max: 120,
      props: { type: 'number', placeholder: '18' },
    },
    {
      key: 'country',
      type: 'select',
      label: 'Country',
      required: true,
      options: [
        { value: 'us', label: 'United States' },
        { value: 'uk', label: 'United Kingdom' },
        { value: 'ca', label: 'Canada' },
        { value: 'au', label: 'Australia' },
      ],
    },
    {
      key: 'plan',
      type: 'select',
      label: 'Subscription Plan',
      required: true,
      options: [
        { value: 'free', label: 'Free - $0/month' },
        { value: 'pro', label: 'Pro - $10/month' },
        { value: 'enterprise', label: 'Enterprise - $50/month' },
      ],
    },
    {
      key: 'bio',
      type: 'textarea',
      label: 'Bio',
      props: { placeholder: 'Tell us about yourself' },
    },
    {
      key: 'newsletter',
      type: 'checkbox',
      label: 'Subscribe to newsletter',
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
