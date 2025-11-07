import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ExampleIframeComponent } from '../../../../../app/components/example-iframe';

@Component({
  selector: 'bootstrap-slider-iframe-demo',
  imports: [ExampleIframeComponent],
  template: `<example-iframe library="bootstrap" example="slider" [code]="code" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SliderIframeDemoComponent {
  code = `{
  key: 'volume',
  type: 'slider',
  label: 'Volume',
  value: 50,
  props: {
    min: 0,
    max: 100,
    step: 5,
    helpText: 'Adjust the volume level',
  },
}`;
}
