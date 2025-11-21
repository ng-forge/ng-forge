import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ExampleIframeComponent } from '../../../app/components/example-iframe';

@Component({
  selector: 'row-field-iframe-demo',
  imports: [ExampleIframeComponent],
  template: `<example-iframe library="material" example="row" height="600px" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RowFieldIframeDemoComponent {}
