import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ExampleIframeComponent } from '../../../app/components/example-iframe';

@Component({
  selector: 'age-conditional-form-iframe-demo',
  imports: [ExampleIframeComponent],
  template: `<example-iframe library="material" example="age-conditional-form" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AgeConditionalFormIframeDemoComponent {}
