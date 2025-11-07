import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ExampleIframeComponent } from '../../../../../app/components/example-iframe';

@Component({
  selector: 'select-iframe-demo',
  imports: [ExampleIframeComponent],
  template: `<example-iframe library="primeng" example="select" [code]="code" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectIframeDemoComponent {
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
