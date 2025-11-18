import { Component, output } from '@angular/core';
import { DynamicForm, provideDynamicForm } from '@ng-forge/dynamic-form';
import { withMaterialConfig, withMaterialFields } from '@ng-forge/dynamic-form-material';
import { conditionalFieldsConfig } from '../configs/conditional-fields-config';

@Component({
  imports: [DynamicForm],
  selector: 'demo-conditional-fields-form',
  template: ` <dynamic-form [config]="config" (submitted)="submitted.emit($event)" /> `,
  providers: [
    provideDynamicForm(...withMaterialFields()),
    ...withMaterialConfig({ appearance: 'outline' }),
  ],
})
export class ConditionalFieldsFormComponent {
  submitted = output<Partial<Record<string, any>> | undefined>();
  config = conditionalFieldsConfig;
}
