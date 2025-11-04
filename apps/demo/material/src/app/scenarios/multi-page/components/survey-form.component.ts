import { Component, output, signal } from '@angular/core';
import { DynamicForm } from '@ng-forge/dynamic-form';
import { surveyConfig } from '../configs/survey-config';

@Component({
  selector: 'demo-survey-form',
  imports: [DynamicForm],
  template: ` <dynamic-form [config]="config" [(value)]="formValue" (submitted)="onSubmit($event || {})" /> `,
})
export class SurveyFormComponent {
  config = surveyConfig;
  formValue = signal<Record<string, unknown>>({});

  submitted = output<Record<string, unknown>>();

  onSubmit(value: Record<string, unknown>) {
    this.submitted.emit(value);
  }
}
