import { Component, output } from '@angular/core';
import { DynamicForm, provideDynamicForm } from '@ng-forge/dynamic-form';
import { withMaterialConfig, withMaterialFields } from '@ng-forge/dynamic-form-material';
import { accountSetupConfig } from '../configs/account-setup-config';

@Component({
  imports: [DynamicForm],
  selector: 'demo-account-setup-form',
  template: ` <dynamic-form [config]="config" (submitted)="submitted.emit($event)" /> `,
  providers: [
    provideDynamicForm(...withMaterialFields()),
    ...withMaterialConfig({ appearance: 'outline' }),
  ],
})
export class AccountSetupFormComponent {
  submitted = output<Partial<Record<string, any>> | undefined>();
  config = accountSetupConfig;
}
