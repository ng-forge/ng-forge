import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ExampleIframeComponent } from '../../../../app/components/example-iframe';

@Component({
  selector: 'complete-form-iframe-demo',
  imports: [ExampleIframeComponent],
  template: `<example-iframe library="ionic" example="complete-form" height="800px" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompleteFormIframeDemoComponent {}
