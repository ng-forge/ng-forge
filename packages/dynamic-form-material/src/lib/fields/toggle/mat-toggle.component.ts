import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormValueControl } from '@angular/forms/signals';
import { MatError, MatFormField, MatHint, MatLabel } from '@angular/material/form-field';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { MatToggleField, MatToggleProps } from './mat-toggle.type';

/**
 * Material Design toggle field component
 */
@Component({
  selector: 'df-mat-toggle',
  imports: [FormsModule, MatFormField, MatLabel, MatHint, MatError, MatSlideToggle],
  template: `
    <mat-form-field [appearance]="appearance() || 'fill'" [class]="className() || ''">
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
  styles: [
    `
      .toggle-container {
        width: 100%;
        margin: 8px 0;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatToggleFieldComponent implements FormValueControl<boolean>, MatToggleField {
  readonly value = model<boolean>(false);
  readonly disabled = model<boolean>(false);
  readonly touched = model<boolean>(false);
  readonly invalid = model<boolean>(false);
  readonly errors = model<readonly any[]>([]);

  // ToggleField implementation
  readonly label = input.required<MatToggleProps['label']>();
  readonly labelPosition = input<MatToggleProps['labelPosition']>('after');
  readonly required = input<boolean>(false);
  readonly color = input<MatToggleProps['color']>('primary');
  readonly hint = input<MatToggleProps['hint']>('');
  readonly className = input<MatToggleProps['className']>('');
  readonly appearance = input<MatToggleProps['appearance']>('fill');
}
