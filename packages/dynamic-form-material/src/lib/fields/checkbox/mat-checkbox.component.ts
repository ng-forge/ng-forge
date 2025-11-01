import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Field, FieldTree } from '@angular/forms/signals';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatErrorsComponent } from '../../shared/mat-errors.component';
import { MatCheckboxComponent, MatCheckboxProps } from './mat-checkbox.type';

@Component({
  selector: 'df-mat-checkbox',
  imports: [MatCheckbox, MatErrorsComponent, Field],
  template: `
    @let f = field();

    <mat-checkbox
      [field]="f"
      [labelPosition]="props()?.labelPosition || 'after'"
      [indeterminate]="props()?.indeterminate || false"
      [color]="props()?.color || 'primary'"
      [disabled]="f().disabled()"
      [disableRipple]="props()?.disableRipple || false"
      [attr.tabindex]="tabIndex()"
    >
      {{ label() }}
    </mat-checkbox>

    @if (props()?.hint; as hint) {
    <div class="mat-hint">{{ hint }}</div>
    }
    <df-mat-errors [errors]="f().errors()" [invalid]="f().invalid()" [touched]="f().touched()" />
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
  host: {
    '[class]': 'className()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MatCheckboxFieldComponent implements MatCheckboxComponent {
  readonly field = input.required<FieldTree<boolean>>();

  // Properties
  readonly label = input<string>('');
  readonly placeholder = input<string>('');
  readonly className = input<string>('');
  readonly tabIndex = input<number>();
  readonly props = input<MatCheckboxProps>();
}
