import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RemoteExampleComponent } from '../../../../app/components/remote-example';

@Component({
  selector: 'input-demo',
  imports: [RemoteExampleComponent],
  template: `<remote-example library="primeng" example="input" [code]="code" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputDemoComponent {
  code = `const config: FormConfig = {
  fields: [
    {
      key: 'email',
      type: 'input',
      value: '',
      label: 'Email Address',
      props: {
        type: 'email',
        styleClass: 'w-full',
        hint: 'Enter your email address',
      },
    },
    {
      type: 'submit',
      key: 'submit',
      label: 'Submit',
      props: {
        severity: 'primary',
      },
    },
  ],
};`;
}
