import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ExampleIframeComponent } from '../../../../../app/components/example-iframe';

@Component({
  selector: 'datepicker-iframe-demo',
  imports: [ExampleIframeComponent],
  template: `<example-iframe library="material" example="datepicker" [code]="code" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatepickerIframeDemoComponent {
  code = `{
  key: 'birthDate',
  type: 'datepicker',
  label: 'Birth Date',
  required: true,
  props: {
    placeholder: 'Select your birth date',
  },
}`;
}
