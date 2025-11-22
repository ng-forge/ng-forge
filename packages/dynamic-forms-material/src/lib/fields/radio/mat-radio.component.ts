import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Field, FieldTree } from '@angular/forms/signals';
import { MatRadioButton, MatRadioGroup } from '@angular/material/radio';
import {
  createResolvedErrorsSignal,
  DynamicText,
  DynamicTextPipe,
  FieldOption,
  shouldShowErrors,
  ValidationMessages,
} from '@ng-forge/dynamic-forms';
import { MatRadioComponent, MatRadioProps } from './mat-radio.type';
import { MatError } from '@angular/material/input';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'df-mat-radio',
  imports: [MatRadioGroup, MatRadioButton, Field, MatError, DynamicTextPipe, AsyncPipe],
  template: `
    @let f = field();
    @if (label()) {
      <div class="radio-label">{{ label() | dynamicText | async }}</div>
    }

    <mat-radio-group [field]="f">
      @for (option of options(); track option.value) {
        <mat-radio-button
          [value]="option.value"
          [disabled]="option.disabled || false"
          [color]="props()?.color || 'primary'"
          [labelPosition]="props()?.labelPosition || 'after'"
        >
          {{ option.label | dynamicText | async }}
        </mat-radio-button>
      }
    </mat-radio-group>

    @if (props()?.hint; as hint) {
      <div class="mat-hint">{{ hint | dynamicText | async }}</div>
    }
    @for (error of errorsToDisplay(); track error.kind) {
      <mat-error>{{ error.message }}</mat-error>
    }
  `,
  styles: [
    `
      :host {
        display: block;
      }

      :host([hidden]) {
        display: none !important;
      }
    `,
  ],
  host: {
    '[class]': 'className() || ""',
    '[id]': '`${key()}`',
    '[attr.data-testid]': 'key()',
    '[attr.hidden]': 'field()().hidden() || null',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MatRadioFieldComponent<T> implements MatRadioComponent<T> {
  readonly field = input.required<FieldTree<T>>();
  readonly key = input.required<string>();

  readonly label = input<DynamicText>();
  readonly placeholder = input<DynamicText>();

  readonly className = input<string>('');
  readonly tabIndex = input<number>();

  readonly options = input<FieldOption<T>[]>([]);
  readonly props = input<MatRadioProps>();
  readonly validationMessages = input<ValidationMessages>();
  readonly defaultValidationMessages = input<ValidationMessages>();

  readonly resolvedErrors = createResolvedErrorsSignal(this.field, this.validationMessages, this.defaultValidationMessages);
  readonly showErrors = shouldShowErrors(this.field);

  readonly errorsToDisplay = computed(() => (this.showErrors() ? this.resolvedErrors() : []));
}
