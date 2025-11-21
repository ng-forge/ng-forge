import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ExampleIframeComponent } from '../../../app/components/example-iframe';

@Component({
  selector: 'conditional-logic-showcase-iframe-demo',
  imports: [ExampleIframeComponent],
  template: `<example-iframe library="material" example="conditional-logic-showcase" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConditionalLogicShowcaseIframeDemoComponent {}
