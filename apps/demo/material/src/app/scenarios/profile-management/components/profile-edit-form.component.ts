import { Component, output } from '@angular/core';
import { DynamicForm } from '@ng-forge/dynamic-form';
import { profileEditConfig } from '../configs/profile-edit-config';

@Component({
  imports: [DynamicForm],
  selector: 'demo-profile-edit-form',
  template: ` <dynamic-form [config]="config" (submitted)="submitted.emit($event)" /> `,
})
export class ProfileEditFormComponent {
  submitted = output<Partial<Record<string, any>> | undefined>();
  config = profileEditConfig;
}
