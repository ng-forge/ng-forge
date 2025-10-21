import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormValueControl } from '@angular/forms/signals';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { MatToggleField, MatToggleProps } from './mat-toggle.type';

/**
 * Material Design toggle field component
 */
@Component({
  selector: 'df-mat-toggle',
  imports: [FormsModule, MatSlideToggle],
  template: `
    <div [class]="className() || ''">
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
      <div class="mat-hint">{{ hint }}</div>
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

      .toggle-container {
        width: 100%;
        margin: 8px 0;
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
