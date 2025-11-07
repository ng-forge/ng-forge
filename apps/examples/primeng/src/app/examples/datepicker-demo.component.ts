import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig } from '@ng-forge/dynamic-form';

@Component({
  selector: 'app-datepicker-demo',
  imports: [DynamicForm, JsonPipe],
  host: {
    class: 'example-container',
  },
  template: `
    <dynamic-form [config]="fields" [(value)]="formOutput" />
    <h4>Form Data:</h4>
    <pre>{{ formOutput() | json }}</pre>
  `,
})
export class DatepickerDemoComponent {
  formOutput = signal({});

  fields = {
    fields: [
      {
        key: 'birthDate',
        type: 'datepicker',
        label: 'Birth Date',
        props: {
          dateFormat: 'mm/dd/yy', // Format string for displaying dates
          showIcon: true, // Show calendar icon button
          hint: 'Select your birth date',
        },
      },
      {
        key: 'appointmentDate',
        type: 'datepicker',
        label: 'Appointment Date',
        props: {
          dateFormat: 'dd/mm/yy',
          showIcon: true,
          showButtonBar: true, // Show button bar with today/clear buttons
          hint: 'Choose an appointment date',
        },
        required: true,
      },
      {
        key: 'vacationDates',
        type: 'datepicker',
        label: 'Vacation Dates (Range)',
        props: {
          dateFormat: 'yy-mm-dd',
          showIcon: true,
          selectionMode: 'range', // Selection mode: single, multiple, or range
          showButtonBar: true,
          hint: 'Select start and end dates',
        },
      },
      {
        key: 'eventDates',
        type: 'datepicker',
        label: 'Event Dates (Multiple)',
        props: {
          dateFormat: 'mm/dd/yy',
          showIcon: true,
          selectionMode: 'multiple', // Select multiple individual dates
          showButtonBar: true,
          hint: 'Select multiple dates for events',
        },
      },
      {
        key: 'monthYear',
        type: 'datepicker',
        label: 'Month/Year Selection',
        props: {
          dateFormat: 'mm/yy',
          view: 'month', // Initial view: date, month, or year
          showIcon: true,
          hint: 'Select month and year only',
        },
      },
      {
        key: 'inlineCalendar',
        type: 'datepicker',
        label: 'Inline Calendar',
        props: {
          dateFormat: 'yy-mm-dd',
          inline: true, // Display calendar inline instead of overlay
          showButtonBar: true,
          hint: 'Always visible calendar',
        },
      },
      {
        key: 'touchCalendar',
        type: 'datepicker',
        label: 'Touch-Optimized Calendar',
        props: {
          dateFormat: 'dd M yy',
          showIcon: true,
          touchUI: true, // Enable touch-optimized UI for mobile devices
          showButtonBar: true,
          hint: 'Mobile-friendly datepicker',
        },
      },
    ],
  } as const satisfies FormConfig;
}
