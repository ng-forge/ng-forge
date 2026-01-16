import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ExampleIframeComponent } from '../../../../app/components/example-iframe';

@Component({
  selector: 'bootstrap-datepicker-iframe-demo',
  imports: [ExampleIframeComponent],
  template: `<example-iframe library="bootstrap" example="datepicker" [code]="code" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatepickerIframeDemoComponent {
  code = `{
  key: 'birthdate',
  type: 'datepicker',
  label: 'Date of Birth',
  value: '',
  required: true,
  props: {
    placeholder: 'Select your birth date',
    floatingLabel: true,
    size: 'md',
    hint: 'You must be 18 years or older',
  },
}`;
}
