import { Component, output, viewChild, effect } from '@angular/core';
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

  dynamicForm = viewChild(DynamicForm);

  constructor() {
    effect(() => {
      const form = this.dynamicForm();
      if (form?.formControl) {
        const passwordControl = form.formControl.getControl(['password']);
        const confirmPasswordControl = form.formControl.getControl(['confirmPassword']);

        if (passwordControl && confirmPasswordControl) {
          // Add custom validator for password matching
          confirmPasswordControl.addValidators((control) => {
            const password = passwordControl.value();
            const confirmPassword = control.value();

            if (password && confirmPassword && password !== confirmPassword) {
              return { passwordMismatch: true };
            }
            return null;
          });

          // Update validation when password changes
          passwordControl.events.subscribe(() => {
            confirmPasswordControl.markAsTouched();
            confirmPasswordControl.updateValueAndValidity();
          });
        }
      }
    });
  }
}
