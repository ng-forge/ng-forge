import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ExampleIframeComponent } from '../../../app/components/example-iframe';

@Component({
  selector: 'enterprise-features-iframe-demo',
  imports: [ExampleIframeComponent],
  template: `<example-iframe library="material" example="enterprise-features" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EnterpriseFeaturesIframeDemoComponent {}
