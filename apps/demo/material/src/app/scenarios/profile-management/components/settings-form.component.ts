import { Component, output } from '@angular/core';
import { DynamicForm } from '@ng-forge/dynamic-form';
import { settingsConfig } from '../configs/settings-config';

@Component({
  imports: [DynamicForm],
  selector: 'demo-settings-form',
  template: ` <dynamic-form [config]="config" (submitted)="submitted.emit($event)" /> `,
})
export class SettingsFormComponent {
  submitted = output<Partial<Record<string, any>> | undefined>();
  config = settingsConfig;
}
