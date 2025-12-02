import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RemoteExampleComponent } from '../../../../app/components/remote-example';

@Component({
  selector: 'datepicker-demo',
  imports: [RemoteExampleComponent],
  template: `<remote-example library="ionic" example="datepicker" [code]="code" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatepickerDemoComponent {
  code = `{
  key: 'birthDate',
  type: 'datepicker',
  label: 'Birth Date',
  props: {
    placeholder: 'Select your birth date',
    presentation: 'date',
  },
}`;
}
