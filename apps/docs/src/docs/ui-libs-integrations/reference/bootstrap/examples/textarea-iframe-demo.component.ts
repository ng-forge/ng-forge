import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ExampleIframeComponent } from '../../../../../app/components/example-iframe';

@Component({
  selector: 'bootstrap-textarea-iframe-demo',
  imports: [ExampleIframeComponent],
  template: `<example-iframe library="bootstrap" example="textarea" [code]="code" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextareaIframeDemoComponent {
  code = `{
  key: 'comments',
  type: 'textarea',
  label: 'Comments',
  value: '',
  props: {
    placeholder: 'Enter your comments here',
    rows: 4,
    floatingLabel: true,
    helpText: 'Maximum 500 characters',
  },
}`;
}
