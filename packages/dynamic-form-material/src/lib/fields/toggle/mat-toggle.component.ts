import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormValueControl } from '@angular/forms/signals';
import { MatSlideToggle } from '@angular/material/slide-toggle';

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
export class MatToggleFieldComponent implements FormValueControl<boolean> {
  readonly value = model<boolean>(false);
  readonly disabled = input<boolean>(false);
  readonly errors = input<readonly any[]>([]);
  readonly touched = model<boolean>(false);
  readonly invalid = model<boolean>(false);

  readonly label = input.required<string>();
  readonly labelPosition = input<'before' | 'after'>('after');
  readonly required = input<boolean>(false);
  readonly color = input<'primary' | 'accent' | 'warn'>('primary');
  readonly hint = input<string>('');
  readonly className = input<string>('');
  readonly hideIcon = input<boolean>(false);
  readonly disableRipple = input<boolean>(false);
  readonly tabIndex = input<number>();
}
