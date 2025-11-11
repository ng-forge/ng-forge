import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Field, FieldTree } from '@angular/forms/signals';
import { MatCheckbox } from '@angular/material/checkbox';
import {
  createResolvedErrorsSignal,
  DynamicText,
  DynamicTextPipe,
  getDisabledSignal,
  shouldShowErrors,
  ValidationMessages,
} from '@ng-forge/dynamic-form';
import { MatCheckboxComponent, MatCheckboxProps } from './mat-checkbox.type';
import { MatError } from '@angular/material/input';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'df-mat-checkbox',
  imports: [MatCheckbox, Field, MatError, DynamicTextPipe, AsyncPipe],
  template: `
    @let f = field();

    <mat-checkbox
      [field]="f"
      [labelPosition]="props()?.labelPosition || 'after'"
      [indeterminate]="props()?.indeterminate || false"
      [color]="props()?.color || 'primary'"
      [disableRipple]="props()?.disableRipple || false"
      [attr.tabindex]="tabIndex()"
      [attr.hidden]="f().hidden() || null"
      [disabled]="isDisabled()"
    >
      {{ label() | dynamicText | async }}
    </mat-checkbox>

    @if (props()?.hint; as hint) {
    <div class="mat-hint" [attr.hidden]="f().hidden() || null">{{ hint | dynamicText | async }}</div>
    } @for (error of errorsToDisplay(); track error.kind) {
    <mat-error [attr.hidden]="f().hidden() || null">{{ error.message }}</mat-error>
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
    '[class]': 'className()',
    '[id]': '`${key()}`',
    '[attr.data-testid]': 'key()',
    '[attr.hidden]': 'field()().hidden() || null',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MatCheckboxFieldComponent implements MatCheckboxComponent {
  readonly field = input.required<FieldTree<boolean>>();
  readonly key = input.required<string>();

  // Properties
  readonly label = input<DynamicText>();
  readonly placeholder = input<DynamicText>();
  readonly className = input<string>('');
  readonly tabIndex = input<number>();
  readonly props = input<MatCheckboxProps>();
  readonly validationMessages = input<ValidationMessages>();
  readonly defaultValidationMessages = input<ValidationMessages>();

  readonly resolvedErrors = createResolvedErrorsSignal(this.field, this.validationMessages, this.defaultValidationMessages);
  readonly showErrors = shouldShowErrors(this.field);

  // Combine showErrors and resolvedErrors to avoid @if wrapper
  readonly errorsToDisplay = computed(() => (this.showErrors() ? this.resolvedErrors() : []));

  // Get disabled state from logic registry
  readonly isDisabled = computed(() => getDisabledSignal(this.key(), this.field)());
}
