import { Component, output } from '@angular/core';
import { DynamicForm } from '@ng-forge/dynamic-form';
import { conditionalFieldsConfig } from '../configs/conditional-fields-config';

@Component({
  imports: [DynamicForm],
  selector: 'demo-conditional-fields-form',
  template: ` <dynamic-form [config]="config" (submitted)="submitted.emit($event)" /> `,
})
export class ConditionalFieldsFormComponent {
  submitted = output<Partial<Record<string, any>> | undefined>();
  config = conditionalFieldsConfig;
}
