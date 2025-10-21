import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormCheckboxControl } from '@angular/forms/signals';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatCheckboxField, MatCheckboxProps } from './mat-checkbox.type';

/**
 * Material Design checkbox field component
 */
@Component({
  selector: 'df-mat-checkbox',
  imports: [MatCheckbox, FormsModule],
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
      } @if (invalid() && touched()) { @for (error of errors(); track error) {
      <div class="mat-error">{{ error.message }}</div>
      } }
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

      .mat-error {
        font-size: 12px;
        color: #f44336;
        margin-top: 4px;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatCheckboxFieldComponent implements FormCheckboxControl, MatCheckboxField {
  // FormCheckboxControl implementation
  readonly checked = model<boolean>(false);
  readonly disabled = model<boolean>(false);
  readonly touched = model<boolean>(false);
  readonly invalid = model<boolean>(false);
  readonly errors = model<readonly any[]>([]);

  // CheckboxField implementation
  readonly label = input.required<MatCheckboxProps['label']>();
  readonly labelPosition = input<MatCheckboxProps['labelPosition']>('after');
  readonly indeterminate = input<MatCheckboxProps['indeterminate']>(false);
  readonly color = input<MatCheckboxProps['color']>('primary');
  readonly hint = input<MatCheckboxProps['hint']>('');
  readonly className = input<MatCheckboxProps['className']>('');
  readonly disableRipple = input<boolean | undefined>(false);
  readonly tabIndex = input<number | undefined>();
  readonly required = input<boolean>(false);
}
