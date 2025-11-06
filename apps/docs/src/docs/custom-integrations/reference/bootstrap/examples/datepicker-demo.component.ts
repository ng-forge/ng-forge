import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig, provideDynamicForm } from '@ng-forge/dynamic-form';
import { withBootstrapFields } from '@ng-forge/dynamic-form-bootstrap/no-augmentation';
import { BootstrapDesignContainer } from '../bootstrap.container';

@Component({
  selector: 'app-bs-datepicker-demo',
  imports: [DynamicForm, JsonPipe, BootstrapDesignContainer],
  providers: [provideDynamicForm(...withBootstrapFields())],
  template: `
    <app-bootstrap-container>
      <h3>Bootstrap Datepicker Examples</h3>
      <p>Demonstration of native date input fields with Bootstrap styling.</p>
      <dynamic-form [config]="fields" [(value)]="formOutput" />
      <h4>Form Data:</h4>
      <pre>{{ formOutput() | json }}</pre>
    </app-bootstrap-container>
  `,
})
export class BsDatepickerDemoComponent {
  formOutput = signal({});

  fields = {
    fields: [
      {
        key: 'basicDate',
        type: 'datepicker',
        label: 'Basic Date Input',
        props: {
          helpText: 'Native HTML5 date input with Bootstrap styling',
        },
      },
      {
        key: 'floatingDate',
        type: 'datepicker',
        label: 'Floating Label Date',
        props: {
          floatingLabel: true,
          helpText: 'Date input with floating label',
        },
      },
      {
        key: 'requiredDate',
        type: 'datepicker',
        label: 'Required Date',
        props: {
          helpText: 'This date field is required',
          validFeedback: 'Date is valid',
          invalidFeedback: 'Please select a date',
        },
        required: true,
      },
      {
        key: 'smallDate',
        type: 'datepicker',
        label: 'Small Date Input',
        props: {
          size: 'sm',
          helpText: 'Small size date input',
        },
      },
      {
        key: 'largeDate',
        type: 'datepicker',
        label: 'Large Date Input',
        props: {
          size: 'lg',
          helpText: 'Large size date input',
        },
      },
      {
        key: 'birthDate',
        type: 'datepicker',
        label: 'Date of Birth',
        props: {
          helpText: 'Enter your birth date',
        },
        required: true,
      },
      {
        key: 'appointmentDate',
        type: 'datepicker',
        label: 'Appointment Date',
        props: {
          floatingLabel: true,
          helpText: 'Schedule your appointment',
        },
      },
      {
        key: 'startDate',
        type: 'datepicker',
        label: 'Project Start Date',
        props: {
          helpText: 'When will the project begin?',
        },
      },
    ],
  } as const satisfies FormConfig;
}
