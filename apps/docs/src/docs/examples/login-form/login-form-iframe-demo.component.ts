import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ExampleIframeComponent } from '../../../app/components/example-iframe';

@Component({
  selector: 'login-form-iframe-demo',
  imports: [ExampleIframeComponent],
  template: `<example-iframe library="material" example="login" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginFormIframeDemoComponent {}
