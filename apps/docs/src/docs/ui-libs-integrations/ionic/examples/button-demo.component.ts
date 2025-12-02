import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RemoteExampleComponent } from '../../../../app/components/remote-example';

@Component({
  selector: 'button-demo',
  imports: [RemoteExampleComponent],
  template: `<remote-example library="ionic" example="button" [code]="code" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonDemoComponent {
  code = `{
  type: 'submit',
  key: 'submit',
  label: 'Submit',
  props: {
    color: 'primary',
    fill: 'solid',
  },
}`;
}
