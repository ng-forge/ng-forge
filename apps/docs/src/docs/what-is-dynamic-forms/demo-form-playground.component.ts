import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RemoteExampleComponent } from '../../app/components/remote-example';

@Component({
  selector: 'demo-form-playground',
  imports: [RemoteExampleComponent],
  template: `<remote-example library="material" example="user-registration" height="700px" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DemoFormPlayground {}
