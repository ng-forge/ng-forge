import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ExampleIframeComponent } from '../../app/components/example-iframe';

@Component({
  selector: 'demo-form-playground',
  imports: [ExampleIframeComponent],
  template: `<example-iframe library="material" example="user-registration" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DemoFormPlayground {}
