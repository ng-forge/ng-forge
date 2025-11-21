import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ExampleIframeComponent } from '../../../app/components/example-iframe';

@Component({
  selector: 'expression-validators-iframe-demo',
  imports: [ExampleIframeComponent],
  template: `<example-iframe library="material" example="expression-validators-demo" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ExpressionValidatorsIframeDemoComponent {}
