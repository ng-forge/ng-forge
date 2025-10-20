import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormValueControl } from '@angular/forms/signals';
import { MatError, MatFormField, MatFormFieldAppearance, MatHint, MatLabel } from '@angular/material/form-field';
import { MatRadioButton, MatRadioGroup } from '@angular/material/radio';
import { RadioField, RadioOption } from '@ng-forge/dynamic-form';

/**
 * Material Design radio field component
 */
@Component({
  selector: 'df-mat-radio',
  imports: [FormsModule, MatFormField, MatLabel, MatHint, MatError, MatRadioGroup, MatRadioButton],
  template: `
    <mat-form-field [appearance]="appearance()" [class]="className() || ''">
      @if (label()) {
      <mat-label>{{ label() }}</mat-label>
      }

      <mat-radio-group
        [(ngModel)]="value"
        [disabled]="disabled()"
        [required]="required() || false"
        (blur)="touched.set(true)"
      >
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
  styles: [`
    mat-radio-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    mat-radio-button {
      margin: 0;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatRadioFieldComponent implements FormValueControl<any>, RadioField {
  // FormValueControl implementation
  readonly value = model<any>(null);
  readonly disabled = model<boolean>(false);
  readonly touched = model<boolean>(false);
  readonly invalid = model<boolean>(false);
  readonly errors = model<readonly any[]>([]);

  // RadioField implementation
  readonly label = input.required<string>();
  readonly options = input.required<RadioOption[]>();
  readonly required = input<boolean>(false);
  readonly color = input<'primary' | 'accent' | 'warn'>('primary');
  readonly labelPosition = input<'before' | 'after'>('after');
  readonly hint = input<string>('');
  readonly className = input<string>('');
  readonly appearance = input<MatFormFieldAppearance>('fill');
}
