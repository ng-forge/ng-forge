import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RemoteExampleComponent } from '../../../../app/components/remote-example';

@Component({
  selector: 'textarea-demo',
  imports: [RemoteExampleComponent],
  template: `<remote-example library="primeng" example="textarea" [code]="code" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextareaDemoComponent {
  code = `{
  key: 'bio',
  type: 'textarea',
  label: 'Biography',
  value: '',
  maxLength: 500,
  props: {
    rows: 6,
    autoResize: true,
    hint: 'Tell us about yourself',
  },
}`;
}
