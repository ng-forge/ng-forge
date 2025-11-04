import { Component, output, signal } from '@angular/core';
import { DynamicForm } from '@ng-forge/dynamic-form';
import { applicationConfig } from '../configs/application-config';

@Component({
  selector: 'demo-application-form',
  imports: [DynamicForm],
  template: ` <dynamic-form [config]="config" [(value)]="formValue" (submitted)="onSubmit($event || {})" /> `,
})
export class ApplicationFormComponent {
  config = applicationConfig;
  formValue = signal<Record<string, unknown>>({});

  submitted = output<Record<string, unknown>>();

  onSubmit(value: Record<string, unknown>) {
    this.submitted.emit(value);
  }
}
