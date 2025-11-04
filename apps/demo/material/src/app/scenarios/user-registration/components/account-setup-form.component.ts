import { Component, output } from '@angular/core';
import { DynamicForm } from '@ng-forge/dynamic-form';
import { accountSetupConfig } from '../configs/account-setup-config';

@Component({
  imports: [DynamicForm],
  selector: 'demo-account-setup-form',
  template: ` <dynamic-form [config]="config" (submitted)="submitted.emit($event)" /> `,
})
export class AccountSetupFormComponent {
  submitted = output<Partial<Record<string, any>> | undefined>();
  config = accountSetupConfig;
}
