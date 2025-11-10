import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ExampleIframeComponent } from '../../../app/components/example-iframe';

@Component({
  selector: 'paginated-form-iframe-demo',
  imports: [ExampleIframeComponent],
  template: `<example-iframe library="material" example="paginated-form" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginatedFormIframeDemoComponent {}
