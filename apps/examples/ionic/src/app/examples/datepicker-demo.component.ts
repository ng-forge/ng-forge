import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig } from '@ng-forge/dynamic-form';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'example-datepicker-demo',
  imports: [DynamicForm, JsonPipe, IonContent, IonHeader, IonTitle, IonToolbar],
  host: {
    class: 'example-container',
  },
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Datepicker Example</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <div>
        <dynamic-form [config]="config" [(value)]="formOutput" />
        <h4>Form Data:</h4>
        <pre>{{ formOutput() | json }}</pre>
      </div>
    </ion-content>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatepickerDemoComponent {
  formOutput = signal({});

  config: FormConfig = {
    fields: [
      {
        key: 'birthDate',
        type: 'datepicker',
        label: 'Birth Date',
        props: {
          placeholder: 'Select your birth date',
          presentation: 'date' as const,
        },
      },
      {
        key: 'appointmentTime',
        type: 'datepicker',
        label: 'Appointment Time',
        props: {
          placeholder: 'Select appointment time',
          presentation: 'time' as const,
        },
      },
      {
        key: 'eventDateTime',
        type: 'datepicker',
        label: 'Event Date & Time',
        props: {
          placeholder: 'Select date and time',
          presentation: 'date-time' as const,
        },
      },
    ],
  };
}
