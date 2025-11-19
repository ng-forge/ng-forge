import { Component, output } from '@angular/core';
import { DynamicForm, provideDynamicForm } from '@ng-forge/dynamic-form';
import { withMaterialFields } from '@ng-forge/dynamic-form-material';
import { dependentValidationConfig } from '../configs/dependent-validation-config';

@Component({
  imports: [DynamicForm],
  selector: 'demo-dependent-validation-form',
  template: ` <dynamic-form [config]="config" (submitted)="submitted.emit($event)" /> `,
  providers: [provideDynamicForm(...withMaterialFields({ appearance: 'outline' }))],
})
export class DependentValidationFormComponent {
  submitted = output<Partial<Record<string, any>> | undefined>();
  config = dependentValidationConfig;
}
