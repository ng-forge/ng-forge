import { Component, output } from '@angular/core';
import { DynamicForm } from '@ng-forge/dynamic-form';
import { personalInfoConfig } from '../configs/personal-info-config';

@Component({
  imports: [DynamicForm],
  selector: 'demo-personal-info-form',
  template: ` <dynamic-form [config]="config" (submitted)="submitted.emit($event)" /> `,
})
export class PersonalInfoFormComponent {
  submitted = output<Partial<Record<string, any>> | undefined>();
  config = personalInfoConfig;
}
