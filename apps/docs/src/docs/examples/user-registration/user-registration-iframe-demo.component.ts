import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ExampleIframeComponent } from '../../../app/components/example-iframe';

@Component({
  selector: 'user-registration-iframe-demo',
  imports: [ExampleIframeComponent],
  template: `<example-iframe library="material" example="user-registration" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserRegistrationIframeDemoComponent {}
