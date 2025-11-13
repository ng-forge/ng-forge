import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ExampleIframeComponent } from '../../../app/components/example-iframe';

@Component({
  selector: 'group-field-iframe-demo',
  imports: [ExampleIframeComponent],
  template: `<example-iframe library="material" example="group" height="650px" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroupFieldIframeDemoComponent {}
