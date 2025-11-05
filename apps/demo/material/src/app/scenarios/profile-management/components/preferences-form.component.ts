import { Component, output, signal } from '@angular/core';
import { DynamicForm } from '@ng-forge/dynamic-form';
import { preferencesConfig } from '../configs/preferences-config';

@Component({
  imports: [DynamicForm],
  selector: 'demo-preferences-form',
  template: ` <dynamic-form [config]="config" [value]="initialValue()" (submitted)="submitted.emit($event)" /> `,
})
export class PreferencesFormComponent {
  submitted = output<Partial<Record<string, any>> | undefined>();
  config = preferencesConfig;

  // Realistic pre-populated preferences data
  initialValue = signal({
    emailNotifications: ['updates', 'security'],
    pushNotifications: ['messages', 'mentions'],
    smsNotifications: false,
    notificationFrequency: 'daily',
    theme: 'auto',
    fontSize: 'medium',
    density: 'comfortable',
    animations: true,
    interests: ['technology', 'business'],
    contentFilter: 'mild',
    autoplay: false,
  });
}
