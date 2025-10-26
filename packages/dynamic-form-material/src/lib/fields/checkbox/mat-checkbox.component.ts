import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormCheckboxControl, ValidationError, WithOptionalField } from '@angular/forms/signals';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatErrorsComponent } from '../../shared/mat-errors.component';

@Component({
  selector: 'df-mat-checkbox',
  imports: [MatCheckbox, FormsModule, MatErrorsComponent],
  template: `
    <div [class]="className() || ''">
      <mat-checkbox
        [(ngModel)]="checked"
        [labelPosition]="labelPosition() || 'after'"
        [indeterminate]="indeterminate() || false"
        [color]="color() || 'primary'"
        [disabled]="disabled()"
        (blur)="touched.set(true)"
      >
        {{ label() }}
      </mat-checkbox>

      @if (hint()) {
      <div class="mat-hint">{{ hint() }}</div>
      }
      <df-mat-errors [errors]="errors()" [invalid]="invalid()" [touched]="touched()" />
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .mat-hint {
        font-size: 12px;
        color: rgba(0, 0, 0, 0.6);
        margin-top: 4px;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatCheckboxFieldComponent implements FormCheckboxControl {
  readonly checked = model<boolean>(false);
  readonly disabled = input<boolean>(false);
  readonly errors = input<readonly WithOptionalField<ValidationError>[]>([]);
  readonly touched = model<boolean>(false);
  readonly invalid = model<boolean>(false);

  readonly label = input<string>('');
  readonly labelPosition = input<'before' | 'after'>('after');
  readonly indeterminate = input<boolean>(false);
  readonly color = input<'primary' | 'accent' | 'warn'>('primary');
  readonly hint = input<string>('');
  readonly className = input<string>('');
  readonly disableRipple = input<boolean>(false);
  readonly tabIndex = input<number>();
  readonly required = input<boolean>(false);
}
