import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ExampleIframeComponent } from '../../../app/components/example-iframe';

@Component({
  selector: 'business-account-form-iframe-demo',
  imports: [ExampleIframeComponent],
  template: `<example-iframe library="material" example="business-account-form" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BusinessAccountFormIframeDemoComponent {}
