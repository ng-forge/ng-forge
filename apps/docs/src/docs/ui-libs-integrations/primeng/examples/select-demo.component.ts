import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RemoteExampleComponent } from '../../../../app/components/remote-example';

@Component({
  selector: 'select-demo',
  imports: [RemoteExampleComponent],
  template: `<remote-example library="primeng" example="select" [code]="code" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectDemoComponent {
  code = `{
  key: 'framework',
  type: 'select',
  label: 'Choose Framework',
  options: [
    { value: 'angular', label: 'Angular' },
    { value: 'react', label: 'React' },
    { value: 'vue', label: 'Vue.js' },
  ],
  props: {
    placeholder: 'Select a framework...',
    filter: true,  // Enable search
    showClear: true,  // Show clear button
  },
}`;
}
