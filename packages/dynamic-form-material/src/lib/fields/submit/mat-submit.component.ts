import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { SubmitField } from '@ng-forge/dynamic-form';

/**
 * Material Design submit button component
 */
@Component({
  selector: 'df-mat-submit',
  imports: [MatButton],
  template: `
    <button
      mat-raised-button
      type="button"
      [color]="color() || 'primary'"
      [class]="className() || ''"
      [disabled]="disabled() || false"
      (click)="handleClick()"
    >
      {{ label() }}
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatSubmitFieldComponent implements SubmitField {
  // SubmitField implementation
  readonly label = input.required<string>();
  readonly disabled = input<boolean>(false);
  readonly className = input<string>('');
  readonly onClick = input<(() => void) | undefined>();

  // Material specific props
  readonly color = input<'primary' | 'accent' | 'warn'>('primary');

  handleClick(): void {
    const clickHandler = this.onClick();
    if (clickHandler) {
      clickHandler();
    }
  }
}
