import { ChangeDetectionStrategy, Component } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig } from '@ng-forge/dynamic-form';

@Component({
  selector: 'bs-example-button-demo',
  imports: [DynamicForm, JsonPipe],
  host: {
    class: 'example-container',
  },
  template: `
    <dynamic-form [config]="config" (submit)="onSubmit($event)" />
    @if (submittedData) {
    <div class="example-result">
      <h4>Submitted Data:</h4>
      <pre>{{ submittedData | json }}</pre>
    </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonDemoComponent {
  submittedData: unknown = null;

  config: FormConfig = {
    fields: [
      {
        key: 'name',
        type: 'input',
        label: 'Name',
        props: {
          placeholder: 'Enter your name',
        },
      },
      {
        type: 'submit',
        key: 'submitPrimary',
        label: 'Submit Primary',
        props: {
          variant: 'primary',
        },
      },
      {
        type: 'submit',
        key: 'submitSecondary',
        label: 'Submit Secondary',
        props: {
          variant: 'secondary',
        },
      },
      {
        type: 'submit',
        key: 'submitSuccess',
        label: 'Submit Success',
        props: {
          variant: 'success',
        },
      },
      {
        type: 'submit',
        key: 'submitDanger',
        label: 'Submit Danger',
        props: {
          variant: 'danger',
        },
      },
      {
        type: 'submit',
        key: 'submitOutline',
        label: 'Submit Outline',
        props: {
          variant: 'primary',
          outline: true,
        },
      },
      {
        type: 'submit',
        key: 'submitSmall',
        label: 'Small Button',
        props: {
          variant: 'primary',
          size: 'sm',
        },
      },
      {
        type: 'submit',
        key: 'submitLarge',
        label: 'Large Button',
        props: {
          variant: 'primary',
          size: 'lg',
        },
      },
      {
        type: 'submit',
        key: 'submitBlock',
        label: 'Block Button',
        props: {
          variant: 'primary',
          block: true,
        },
      },
    ],
  };

  onSubmit(data: unknown) {
    this.submittedData = data;
  }
}
