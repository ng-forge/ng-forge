import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RemoteExampleComponent } from '../../../../app/components/remote-example';

@Component({
  selector: 'slider-demo',
  imports: [RemoteExampleComponent],
  template: `<remote-example library="material" example="slider" [code]="code" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SliderDemoComponent {
  code = `{
  key: 'volume',
  type: 'slider',
  label: 'Notification Volume',
  minValue: 0,
  maxValue: 100,
  step: 10,
  value: 50,
}`;
}
