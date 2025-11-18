import { Component, output } from '@angular/core';
import { DynamicForm, provideDynamicForm } from '@ng-forge/dynamic-form';
import { withMaterialConfig, withMaterialFields } from '@ng-forge/dynamic-form-material';
import { personalInfoConfig } from '../configs/personal-info-config';

@Component({
  imports: [DynamicForm],
  selector: 'demo-personal-info-form',
  template: ` <dynamic-form [config]="config" (submitted)="submitted.emit($event)" /> `,
  providers: [
    provideDynamicForm(...withMaterialFields()),
    ...withMaterialConfig({ appearance: 'outline' }),
  ],
})
export class PersonalInfoFormComponent {
  submitted = output<Partial<Record<string, any>> | undefined>();
  config = personalInfoConfig;
}
