import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ExampleIframeComponent } from '../../../../app/components/example-iframe';

@Component({
  selector: 'bootstrap-complete-form-iframe-demo',
  imports: [ExampleIframeComponent],
  template: `<example-iframe library="bootstrap" example="complete-form" [code]="code" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompleteFormIframeDemoComponent {
  code = `[
  {
    key: 'firstName',
    type: 'input',
    label: 'First Name',
    required: true,
    props: { floatingLabel: true, size: 'lg' },
  },
  {
    key: 'email',
    type: 'input',
    label: 'Email',
    required: true,
    email: true,
    props: { type: 'email', floatingLabel: true },
  },
  {
    key: 'country',
    type: 'select',
    label: 'Country',
    required: true,
    options: [
      { label: 'USA', value: 'us' },
      { label: 'UK', value: 'uk' },
    ],
    props: {
      floatingLabel: true,
    },
  },
  {
    key: 'terms',
    type: 'checkbox',
    label: 'I agree to terms',
    required: true,
  },
]`;
}
