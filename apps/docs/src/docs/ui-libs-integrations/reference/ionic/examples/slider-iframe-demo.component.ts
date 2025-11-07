import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ExampleIframeComponent } from '../../../../../app/components/example-iframe';

@Component({
  selector: 'slider-iframe-demo',
  imports: [ExampleIframeComponent],
  template: `<example-iframe library="ionic" example="slider" [code]="code" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SliderIframeDemoComponent {
  code = `{
  key: 'volume',
  type: 'slider',
  label: 'Volume',
  minValue: 0,
  maxValue: 100,
  step: 5,
  props: {
    pin: true,
  },
}`;
}
