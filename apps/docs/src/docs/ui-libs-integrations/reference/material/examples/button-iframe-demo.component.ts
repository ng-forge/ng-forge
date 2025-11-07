import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ExampleIframeComponent } from '../../../../../app/components/example-iframe';

@Component({
  selector: 'button-iframe-demo',
  imports: [ExampleIframeComponent],
  template: `<example-iframe library="material" example="button" [code]="code" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonIframeDemoComponent {
  code = `{
  type: 'submit',
  key: 'submit',
  label: 'Submit Form',
  props: {
    color: 'primary',
  },
}`;
}
