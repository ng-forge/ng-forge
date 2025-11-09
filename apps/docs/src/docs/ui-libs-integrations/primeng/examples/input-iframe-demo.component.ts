import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ExampleIframeComponent } from '../../../../app/components/example-iframe';

@Component({
  selector: 'input-iframe-demo',
  imports: [ExampleIframeComponent],
  template: `<example-iframe library="primeng" example="input" [code]="code" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputIframeDemoComponent {
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
