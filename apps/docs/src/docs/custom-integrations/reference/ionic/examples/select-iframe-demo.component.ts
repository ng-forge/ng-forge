import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ExampleIframeComponent } from '../../../../../app/components/example-iframe';

@Component({
  selector: 'select-iframe-demo',
  imports: [ExampleIframeComponent],
  template: `<example-iframe library="ionic" example="select" [code]="code" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectIframeDemoComponent {
  code = `{
  key: 'framework',
  type: 'select',
  label: 'Framework',
  props: {
    placeholder: 'Choose a framework',
    options: [
      { value: 'angular', label: 'Angular' },
      { value: 'react', label: 'React' },
      { value: 'vue', label: 'Vue.js' },
    ],
  },
}`;
}
