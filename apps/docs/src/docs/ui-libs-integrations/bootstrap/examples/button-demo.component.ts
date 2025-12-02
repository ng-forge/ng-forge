import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RemoteExampleComponent } from '../../../../app/components/remote-example';

@Component({
  selector: 'bootstrap-button-demo',
  imports: [RemoteExampleComponent],
  template: `<remote-example library="bootstrap" example="button" [code]="code" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonDemoComponent {
  code = `{
  key: 'submit',
  type: 'button',
  label: 'Submit Form',
  props: {
    variant: 'primary',
    size: 'lg',
    outline: false,
  },
}`;
}
