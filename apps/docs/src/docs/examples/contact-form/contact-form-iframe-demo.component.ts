import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ExampleIframeComponent } from '../../../app/components/example-iframe';

@Component({
  selector: 'contact-form-iframe-demo',
  imports: [ExampleIframeComponent],
  template: `<example-iframe library="material" example="complete-form" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactFormIframeDemoComponent {}
