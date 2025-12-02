import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RemoteExampleComponent } from '../../../../app/components/remote-example';

@Component({
  selector: 'textarea-demo',
  imports: [RemoteExampleComponent],
  template: `<remote-example library="material" example="textarea" [code]="code" />`,
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
    rows: 4,
    placeholder: 'Tell us about yourself',
  },
}`;
}
