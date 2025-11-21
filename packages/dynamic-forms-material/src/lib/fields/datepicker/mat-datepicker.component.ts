import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Field, FieldTree } from '@angular/forms/signals';
import { MatError, MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatHint, MatInput } from '@angular/material/input';
import { MatDatepicker, MatDatepickerInput, MatDatepickerToggle } from '@angular/material/datepicker';
import { createResolvedErrorsSignal, DynamicText, DynamicTextPipe, shouldShowErrors, ValidationMessages } from '@ng-forge/dynamic-forms';
import { MatDatepickerComponent, MatDatepickerProps } from './mat-datepicker.type';
import { provideNativeDateAdapter } from '@angular/material/core';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'df-mat-datepicker',
  imports: [
    MatFormField,
    MatLabel,
    MatInput,
    MatHint,
    MatDatepicker,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatSuffix,
    Field,
    MatError,
    DynamicTextPipe,
    AsyncPipe,
  ],
  host: {
    '[id]': '`${key()}`',
    '[attr.data-testid]': 'key()',
    '[attr.hidden]': 'field()().hidden() || null',
  },
  template: `
    @let f = field();

    <mat-form-field
      [appearance]="props()?.appearance || 'fill'"
      [subscriptSizing]="props()?.subscriptSizing ?? 'dynamic'"
      [class]="className() || ''"
    >
      @if (label(); as label) {
        <mat-label>{{ label | dynamicText | async }}</mat-label>
      }

      <input
        matInput
        [matDatepicker]="picker"
        [field]="f"
        [placeholder]="(placeholder() | dynamicText | async) ?? ''"
        [attr.tabindex]="tabIndex()"
      />

      <mat-datepicker-toggle matIconSuffix [for]="$any(picker)" />
      <mat-datepicker #picker [startAt]="startAt()" [startView]="props()?.startView || 'month'" [touchUi]="props()?.touchUi ?? false" />

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
  providers: [provideNativeDateAdapter()],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MatDatepickerFieldComponent implements MatDatepickerComponent {
  readonly field = input.required<FieldTree<string>>();
  readonly key = input.required<string>();

  readonly label = input<DynamicText>();
  readonly placeholder = input<DynamicText>();

  readonly className = input<string>('');
  readonly tabIndex = input<number>();

  readonly minDate = input<Date | null>(null);
  readonly maxDate = input<Date | null>(null);
  readonly startAt = input<Date | null>(null);
  readonly props = input<MatDatepickerProps>();
  readonly validationMessages = input<ValidationMessages>();
  readonly defaultValidationMessages = input<ValidationMessages>();

  readonly resolvedErrors = createResolvedErrorsSignal(this.field, this.validationMessages, this.defaultValidationMessages);
  readonly showErrors = shouldShowErrors(this.field);

  // Combine showErrors and resolvedErrors to avoid @if wrapper that breaks Material projection
  readonly errorsToDisplay = computed(() => (this.showErrors() ? this.resolvedErrors() : []));
}
