import { Component, input, model, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormCheckboxControl } from '@angular/forms/signals';
import { MatCheckbox } from '@angular/material/checkbox';
import { CheckboxField } from '@ng-forge/dynamic-form';
import { MatError, MatHint } from '@angular/material/input';

/**
 * Material Design checkbox field component
 */
@Component({
  selector: 'df-mat-checkbox',
  imports: [MatCheckbox, FormsModule, MatHint, MatError],
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
      <mat-hint class="mat-hint">{{ hint() }}</mat-hint>
      } @if (invalid() && touched()) { @for (error of errors(); track error) {
      <mat-error class="mat-error">{{ error.message }}</mat-error> } }
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
export class MatCheckboxFieldComponent implements FormCheckboxControl, CheckboxField {
  // FormCheckboxControl implementation
  readonly checked = model<boolean>(false);
  readonly disabled = model<boolean>(false);
  readonly touched = model<boolean>(false);
  readonly invalid = model<boolean>(false);
  readonly errors = model<readonly any[]>([]);

  // CheckboxField implementation
  readonly label = input.required<string>();
  readonly labelPosition = input<'before' | 'after'>('after');
  readonly indeterminate = input<boolean>(false);
  readonly color = input<'primary' | 'accent' | 'warn'>('primary');
  readonly hint = input<string>('');
  readonly className = input<string>('');
}
