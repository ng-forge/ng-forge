import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ExampleIframeComponent } from '../../../app/components/example-iframe';

@Component({
  selector: 'array-field-iframe-demo',
  imports: [ExampleIframeComponent],
  template: `<example-iframe library="material" example="array" height="600px" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArrayFieldIframeDemoComponent {}
