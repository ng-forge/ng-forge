import { Component, output, signal } from '@angular/core';
import { DynamicForm } from '@ng-forge/dynamic-form';
import { registrationConfig } from '../configs/registration-config';

@Component({
  selector: 'demo-registration-form',
  imports: [DynamicForm],
  template: ` <dynamic-form [config]="config" [(value)]="formValue" (submitted)="onSubmit($event || {})" /> `,
})
export class RegistrationFormComponent {
  config = registrationConfig;
  formValue = signal<Record<string, unknown>>({});

  submitted = output<Record<string, unknown>>();

  onSubmit(value: Record<string, unknown>) {
    this.submitted.emit(value);
  }
}
