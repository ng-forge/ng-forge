import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RemoteExampleComponent } from '../../../../app/components/remote-example';

@Component({
  selector: 'button-demo',
  imports: [RemoteExampleComponent],
  template: `<remote-example library="primeng" example="button" [code]="code" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonDemoComponent {
  code = `{
  type: 'submit',
  key: 'submit',
  label: 'Create Account',
  props: {
    severity: 'primary',
    icon: 'pi pi-check',
    iconPos: 'right',
  },
}`;
}
