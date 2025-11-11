import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ExampleIframeComponent } from '../../../app/components/example-iframe';

@Component({
  selector: 'async-validators-iframe-demo',
  imports: [ExampleIframeComponent],
  template: `<example-iframe library="material" example="async-validators" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AsyncValidatorsIframeDemoComponent {}
