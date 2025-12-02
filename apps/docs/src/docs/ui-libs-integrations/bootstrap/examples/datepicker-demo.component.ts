import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RemoteExampleComponent } from '../../../../app/components/remote-example';

@Component({
  selector: 'bootstrap-datepicker-demo',
  imports: [RemoteExampleComponent],
  template: `<remote-example library="bootstrap" example="datepicker" [code]="code" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatepickerDemoComponent {
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
    helpText: 'You must be 18 years or older',
  },
}`;
}
