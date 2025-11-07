import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ExampleIframeComponent } from '../../../../../app/components/example-iframe';

@Component({
  selector: 'textarea-iframe-demo',
  imports: [ExampleIframeComponent],
  template: `<example-iframe library="material" example="textarea" [code]="code" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextareaIframeDemoComponent {
  code = `{
  key: 'bio',
  type: 'textarea',
  label: 'Biography',
  value: '',
  maxLength: 500,
  props: {
    rows: 4,
    placeholder: 'Tell us about yourself',
  },
}`;
}
