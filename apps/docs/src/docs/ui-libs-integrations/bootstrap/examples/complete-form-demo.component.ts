import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RemoteExampleComponent } from '../../../../app/components/remote-example';

@Component({
  selector: 'bootstrap-complete-form-demo',
  imports: [RemoteExampleComponent],
  template: `<remote-example library="bootstrap" example="complete-form" [code]="code" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompleteFormDemoComponent {
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
