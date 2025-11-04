import { Component, output } from '@angular/core';
import { DynamicForm } from '@ng-forge/dynamic-form';
import { confirmationConfig } from '../configs/confirmation-config';

@Component({
  imports: [DynamicForm],
  selector: 'demo-confirmation-form',
  template: ` <dynamic-form [config]="config" (submitted)="submitted.emit($event)" /> `,
})
export class ConfirmationFormComponent {
  submitted = output<Partial<Record<string, any>> | undefined>();
  config = confirmationConfig;
}
