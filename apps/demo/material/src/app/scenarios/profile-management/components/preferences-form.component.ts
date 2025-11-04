import { Component, output } from '@angular/core';
import { DynamicForm } from '@ng-forge/dynamic-form';
import { preferencesConfig } from '../configs/preferences-config';

@Component({
  imports: [DynamicForm],
  selector: 'demo-preferences-form',
  template: ` <dynamic-form [config]="config" (submitted)="submitted.emit($event)" /> `,
})
export class PreferencesFormComponent {
  submitted = output<Partial<Record<string, any>> | undefined>();
  config = preferencesConfig;
}
