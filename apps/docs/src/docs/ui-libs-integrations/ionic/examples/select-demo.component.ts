import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RemoteExampleComponent } from '../../../../app/components/remote-example';

@Component({
  selector: 'select-demo',
  imports: [RemoteExampleComponent],
  template: `<remote-example library="ionic" example="select" [code]="code" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectDemoComponent {
  code = `{
  key: 'framework',
  type: 'select',
  label: 'Framework',
  options: [
    { value: 'angular', label: 'Angular' },
    { value: 'react', label: 'React' },
    { value: 'vue', label: 'Vue.js' },
  ],
  props: {
    placeholder: 'Choose a framework',
  },
}`;
}
