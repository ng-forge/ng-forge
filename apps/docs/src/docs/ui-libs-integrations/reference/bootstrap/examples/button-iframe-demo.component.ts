import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ExampleIframeComponent } from '../../../../../app/components/example-iframe';

@Component({
  selector: 'bootstrap-button-iframe-demo',
  imports: [ExampleIframeComponent],
  template: `<example-iframe library="bootstrap" example="button" [code]="code" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonIframeDemoComponent {
  code = `{
  key: 'submit',
  type: 'button',
  label: 'Submit Form',
  props: {
    variant: 'primary',
    size: 'lg',
    outline: false,
  },
}`;
}
