import { Component, output } from '@angular/core';
import { DynamicForm } from '@ng-forge/dynamic-form';
import { passwordMatchingConfig } from '../configs/password-matching-config';

@Component({
  imports: [DynamicForm],
  selector: 'demo-password-matching-form',
  template: ` <dynamic-form [config]="config" (submitted)="submitted.emit($event)" /> `,
})
export class PasswordMatchingFormComponent {
  submitted = output<Partial<Record<string, any>> | undefined>();
  config = passwordMatchingConfig;
}
