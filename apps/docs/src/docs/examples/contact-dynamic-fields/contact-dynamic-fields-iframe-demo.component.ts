import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ExampleIframeComponent } from '../../../app/components/example-iframe';

@Component({
  selector: 'contact-dynamic-fields-iframe-demo',
  imports: [ExampleIframeComponent],
  template: `<example-iframe library="material" example="contact-dynamic-fields" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactDynamicFieldsIframeDemoComponent {}
