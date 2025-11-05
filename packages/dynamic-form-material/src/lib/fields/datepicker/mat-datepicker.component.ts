import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Field, FieldTree } from '@angular/forms/signals';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatHint, MatInput } from '@angular/material/input';
import { MatDatepicker, MatDatepickerInput, MatDatepickerToggle } from '@angular/material/datepicker';
import { DynamicText, DynamicTextPipe } from '@ng-forge/dynamic-form';
import { MatErrorsComponent } from '../../shared/mat-errors.component';
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
    MatErrorsComponent,
    MatDatepicker,
    MatDatepickerInput,
    MatDatepickerToggle,
    Field,
    MatError,
    DynamicTextPipe,
    AsyncPipe,
  ],
  host: {
    '[id]': '`${key()}`',
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
        [attr.data-testid]="props()?.['data-testid']"
        [matDatepicker]="picker"
        [field]="f"
        [placeholder]="(placeholder() | dynamicText | async) ?? ''"
        [min]="minDate()"
        [max]="maxDate()"
        [attr.tabindex]="tabIndex()"
      />

      <mat-datepicker-toggle matIconSuffix [for]="$any(picker)" />
      <mat-datepicker #picker [startAt]="startAt()" [startView]="props()?.startView || 'month'" [touchUi]="props()?.touchUi ?? false" />

      @if (props()?.hint; as hint) {
      <mat-hint>{{ hint | dynamicText | async }}</mat-hint>
      }

      <mat-error><df-mat-errors [errors]="f().errors()" [invalid]="f().invalid()" [touched]="f().touched()" /></mat-error>
    </mat-form-field>
  `,
  providers: [provideNativeDateAdapter()],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MatDatepickerFieldComponent implements MatDatepickerComponent {
  readonly field = input.required<FieldTree<Date | null>>();
  readonly key = input.required<string>();

  readonly label = input<DynamicText>();
  readonly placeholder = input<DynamicText>();

  readonly className = input<string>('');
  readonly tabIndex = input<number>();

  readonly minDate = input<Date | null>(null);
  readonly maxDate = input<Date | null>(null);
  readonly startAt = input<Date | null>(null);
  readonly props = input<MatDatepickerProps>();
}
