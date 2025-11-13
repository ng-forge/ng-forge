import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ExampleIframeComponent } from '../../../app/components/example-iframe';

@Component({
  selector: 'custom-validators-iframe-demo',
  imports: [ExampleIframeComponent],
  template: `<example-iframe library="material" example="custom-validators" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomValidatorsIframeDemoComponent {}
