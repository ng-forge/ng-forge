import { Component, output } from '@angular/core';
import { DynamicForm, provideDynamicForm } from '@ng-forge/dynamic-form';
import { withMaterialFields } from '@ng-forge/dynamic-form-material';
import { passwordMatchingConfig } from '../configs/password-matching-config';

@Component({
  imports: [DynamicForm],
  selector: 'demo-password-matching-form',
  template: ` <dynamic-form [config]="config" (submitted)="submitted.emit($event)" /> `,
  providers: [provideDynamicForm(...withMaterialFields({ appearance: 'outline' }))],
})
export class PasswordMatchingFormComponent {
  submitted = output<Partial<Record<string, any>> | undefined>();
  config = passwordMatchingConfig;
}
