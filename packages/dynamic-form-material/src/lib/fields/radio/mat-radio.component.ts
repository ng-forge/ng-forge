import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormValueControl } from '@angular/forms/signals';
import { MatError, MatFormField, MatHint, MatLabel } from '@angular/material/form-field';
import { MatRadioButton, MatRadioGroup } from '@angular/material/radio';
import { MatRadioField, MatRadioProps } from './mat-radio.type';

/**
 * Material Design radio field component
 */
@Component({
  selector: 'df-mat-radio',
  imports: [FormsModule, MatFormField, MatLabel, MatHint, MatError, MatRadioGroup, MatRadioButton],
  template: `
    <mat-form-field [appearance]="appearance() || 'fill'" [class]="className() || ''">
      @if (label()) {
      <mat-label>{{ label() }}</mat-label>
      }

      <mat-radio-group [(ngModel)]="value" [disabled]="disabled()" [required]="required() || false" (blur)="touched.set(true)">
        @for (option of options(); track option.value) {
        <mat-radio-button
          [value]="option.value"
          [disabled]="option.disabled || false"
          [color]="color() || 'primary'"
          [labelPosition]="labelPosition() || 'after'"
        >
          {{ option.label }}
        </mat-radio-button>
        }
      </mat-radio-group>

      @if (hint(); as hint) {
      <mat-hint>{{ hint }}</mat-hint>
      } @if (invalid() && touched()) {
      <mat-error>
        @for (error of errors(); track error) {
        <span>{{ error.message }}</span>
        }
      </mat-error>
      }
    </mat-form-field>
  `,
  styles: [
    `
      mat-radio-group {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      mat-radio-button {
        margin: 0;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatRadioFieldComponent<T > implements FormValueControl<T>, MatRadioField<T> {
  readonly value = model<T>(undefined as T);
  readonly disabled = model<boolean>(false);
  readonly touched = model<boolean>(false);
  readonly invalid = model<boolean>(false);
  readonly errors = model<readonly any[]>([]);

  // RadioField implementation
  readonly label = input.required<MatRadioProps<T>['label']>();
  readonly options = input.required<MatRadioProps<T>['options']>();
  readonly required = input<boolean>(false);
  readonly color = input<MatRadioProps<T>['color']>('primary');
  readonly labelPosition = input<MatRadioProps<T>['labelPosition']>('after');
  readonly hint = input<MatRadioProps<T>['hint']>('');
  readonly className = input<MatRadioProps<T>['className']>('');
  readonly appearance = input<MatRadioProps<T>['appearance']>('fill');
}
