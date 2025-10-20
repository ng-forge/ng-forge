import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormValueControl } from '@angular/forms/signals';
import { MatError, MatFormField, MatFormFieldAppearance, MatHint, MatLabel } from '@angular/material/form-field';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { ToggleField } from '@ng-forge/dynamic-form';

/**
 * Material Design toggle field component
 */
@Component({
  selector: 'df-mat-toggle',
  imports: [FormsModule, MatFormField, MatLabel, MatHint, MatError, MatSlideToggle],
  template: `
    <mat-form-field [appearance]="appearance()" [class]="className() || ''">
      @if (label(); as label) {
      <mat-label>{{ label }}</mat-label>
      }

      <mat-slide-toggle
        [(ngModel)]="value"
        [disabled]="disabled()"
        [required]="required() || false"
        [color]="color() || 'primary'"
        [labelPosition]="labelPosition() || 'after'"
        (blur)="touched.set(true)"
        class="toggle-container"
      >
        {{ label() }}
      </mat-slide-toggle>

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
    .toggle-container {
      width: 100%;
      margin: 8px 0;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatToggleFieldComponent implements FormValueControl<boolean>, ToggleField {
  // FormValueControl implementation
  readonly value = model<boolean>(false);
  readonly disabled = model<boolean>(false);
  readonly touched = model<boolean>(false);
  readonly invalid = model<boolean>(false);
  readonly errors = model<readonly any[]>([]);

  // ToggleField implementation
  readonly label = input.required<string>();
  readonly labelPosition = input<'before' | 'after'>('after');
  readonly required = input<boolean>(false);
  readonly color = input<'primary' | 'accent' | 'warn'>('primary');
  readonly hint = input<string>('');
  readonly className = input<string>('');
  readonly appearance = input<MatFormFieldAppearance>('fill');
}
