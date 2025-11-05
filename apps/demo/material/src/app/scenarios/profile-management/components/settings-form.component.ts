import { Component, output, signal } from '@angular/core';
import { DynamicForm } from '@ng-forge/dynamic-form';
import { settingsConfig } from '../configs/settings-config';

@Component({
  imports: [DynamicForm],
  selector: 'demo-settings-form',
  template: ` <dynamic-form [config]="config" [value]="initialValue()" (submitted)="submitted.emit($event)" /> `,
})
export class SettingsFormComponent {
  submitted = output<Partial<Record<string, any>> | undefined>();
  config = settingsConfig;

  // Realistic pre-populated settings data
  initialValue = signal({
    twoFactorAuth: true,
    loginNotifications: true,
    profileVisibility: 'private',
    searchable: false,
    dataSharing: ['analytics'],
    timezone: 'pst',
    language: 'en',
    autoSave: true,
  });
}
