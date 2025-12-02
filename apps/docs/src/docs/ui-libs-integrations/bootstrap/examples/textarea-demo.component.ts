import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RemoteExampleComponent } from '../../../../app/components/remote-example';

@Component({
  selector: 'bootstrap-textarea-demo',
  imports: [RemoteExampleComponent],
  template: `<remote-example library="bootstrap" example="textarea" [code]="code" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextareaDemoComponent {
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
