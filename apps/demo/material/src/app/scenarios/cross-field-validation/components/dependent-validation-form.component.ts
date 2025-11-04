import { Component, output } from '@angular/core';
import { DynamicForm } from '@ng-forge/dynamic-form';
import { dependentValidationConfig } from '../configs/dependent-validation-config';

@Component({
  imports: [DynamicForm],
  selector: 'demo-dependent-validation-form',
  template: ` <dynamic-form [config]="config" (submitted)="submitted.emit($event)" /> `,
})
export class DependentValidationFormComponent {
  submitted = output<Partial<Record<string, any>> | undefined>();
  config = dependentValidationConfig;
}
