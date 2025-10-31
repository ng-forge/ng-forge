import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormCheckboxControl, ValidationError, WithOptionalField } from '@angular/forms/signals';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatErrorsComponent } from '../../shared/mat-errors.component';
import { MatCheckboxComponent, MatCheckboxProps } from './mat-checkbox.type';

@Component({
  selector: 'df-mat-checkbox',
  imports: [MatCheckbox, FormsModule, MatErrorsComponent],
  template: `
    <mat-checkbox
      [(ngModel)]="checked"
      [labelPosition]="props()?.labelPosition || 'after'"
      [indeterminate]="props()?.indeterminate || false"
      [color]="props()?.color || 'primary'"
      [disabled]="disabled()"
      [disableRipple]="props()?.disableRipple || false"
      [attr.tabindex]="tabIndex()"
      (blur)="touched.set(true)"
    >
      {{ label() }}
    </mat-checkbox>

    @if (props()?.hint; as hint) {
    <div class="mat-hint">{{ hint }}</div>
    }
    <df-mat-errors [errors]="errors()" [invalid]="invalid()" [touched]="touched()" />
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
  host: {
    class: 'className()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MatCheckboxFieldComponent implements FormCheckboxControl, MatCheckboxComponent {
  readonly checked = model.required<boolean>();

  readonly required = input<boolean>(false);
  readonly disabled = input<boolean>(false);
  readonly readonly = input<boolean>(false);
  readonly hidden = input<boolean>(false);
  readonly touched = model<boolean>(false);
  readonly invalid = model<boolean>(false);

  readonly errors = input<readonly WithOptionalField<ValidationError>[]>([]);

  readonly label = input<string>('');
  readonly placeholder = input<string>('');

  readonly className = input<string>('');
  readonly tabIndex = input<number>();

  readonly props = input<MatCheckboxProps>();
}
