import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RemoteExampleComponent } from '../../../../app/components/remote-example';

@Component({
  selector: 'bootstrap-slider-demo',
  imports: [RemoteExampleComponent],
  template: `<remote-example library="bootstrap" example="slider" [code]="code" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SliderDemoComponent {
  code = `{
  key: 'volume',
  type: 'slider',
  label: 'Volume',
  value: 50,
  minValue: 0,
  maxValue: 100,
  step: 5,
  props: {
    helpText: 'Adjust the volume level',
  },
}`;
}
