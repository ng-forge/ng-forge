import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Field, FieldTree } from '@angular/forms/signals';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatHint } from '@angular/material/input';
import {
  createResolvedErrorsSignal,
  DynamicText,
  DynamicTextPipe,
  FieldOption,
  shouldShowErrors,
  ValidationMessages,
} from '@ng-forge/dynamic-form';
import { MatSelectComponent, MatSelectProps } from './mat-select.type';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'df-mat-select',
  imports: [MatFormField, MatLabel, MatSelect, MatOption, MatHint, Field, MatError, DynamicTextPipe, AsyncPipe],
  template: `
    @let f = field();

    <mat-form-field [appearance]="props()?.appearance || 'fill'" [subscriptSizing]="props()?.subscriptSizing ?? 'dynamic'">
      @if (label(); as label) {
        <mat-label>{{ label | dynamicText | async }}</mat-label>
      }

      <mat-select
        [field]="f"
        [placeholder]="(placeholder() | dynamicText | async) ?? ''"
        [multiple]="props()?.multiple || false"
        [compareWith]="props()?.compareWith || defaultCompare"
        [disabled]="f().disabled()"
      >
        @for (option of options(); track option.value) {
          <mat-option [value]="option.value" [disabled]="option.disabled || false">
            {{ option.label | dynamicText | async }}
          </mat-option>
        }
      </mat-select>

      @if (props()?.hint; as hint) {
        <mat-hint>{{ hint | dynamicText | async }}</mat-hint>
      }
      @for (error of errorsToDisplay(); track error.kind) {
        <mat-error>{{ error.message }}</mat-error>
      }
    </mat-form-field>
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
      }

      :host([hidden]) {
        display: none !important;
      }

      mat-form-field {
        width: 100%;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[id]': '`${key()}`',
    '[attr.data-testid]': 'key()',
    '[class]': 'className()',
    '[attr.hidden]': 'field()().hidden() || null',
  },
})
export default class MatSelectFieldComponent<T> implements MatSelectComponent<T> {
  readonly field = input.required<FieldTree<T>>();
  readonly key = input.required<string>();

  readonly label = input<DynamicText>();
  readonly placeholder = input<DynamicText>();

  readonly className = input<string>('');
  readonly tabIndex = input<number>();

  readonly options = input<FieldOption<T>[]>([]);
  readonly props = input<MatSelectProps<T>>();
  readonly validationMessages = input<ValidationMessages>();
  readonly defaultValidationMessages = input<ValidationMessages>();

  readonly resolvedErrors = createResolvedErrorsSignal(this.field, this.validationMessages, this.defaultValidationMessages);
  readonly showErrors = shouldShowErrors(this.field);

  // Combine showErrors and resolvedErrors to avoid @if wrapper that breaks Material projection
  readonly errorsToDisplay = computed(() => (this.showErrors() ? this.resolvedErrors() : []));

  defaultCompare = Object.is;
}
