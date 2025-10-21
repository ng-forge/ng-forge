import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormValueControl } from '@angular/forms/signals';
import { MatRadioButton, MatRadioGroup } from '@angular/material/radio';

type Option<T> = { value: T; label: string; disabled?: boolean };

@Component({
  selector: 'df-mat-radio',
  imports: [FormsModule, MatRadioGroup, MatRadioButton],
  template: `
    <div [class]="className() || ''">
      @if (label()) {
      <div class="radio-label">{{ label() }}</div>
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

      .radio-label {
        font-size: 14px;
        font-weight: 500;
        color: rgba(0, 0, 0, 0.87);
        margin-bottom: 8px;
      }

      mat-radio-group {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      mat-radio-button {
        margin: 0;
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
export class MatRadioFieldComponent<T> implements FormValueControl<T> {
  readonly value = model<T>(undefined as T);
  readonly disabled = input<boolean>(false);
  readonly errors = input<readonly any[]>([]);
  readonly touched = model<boolean>(false);
  readonly invalid = model<boolean>(false);

  readonly label = input.required<string>();
  readonly options = input.required<Option<T>[]>();
  readonly required = input<boolean>(false);
  readonly color = input<'primary' | 'accent' | 'warn'>('primary');
  readonly labelPosition = input<'before' | 'after'>('after');
  readonly hint = input<string>('');
  readonly className = input<string>('');
  readonly appearance = input<'fill' | 'outline'>('fill');
}
