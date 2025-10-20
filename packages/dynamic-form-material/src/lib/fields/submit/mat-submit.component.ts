import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatSubmitField, MatSubmitProps } from './mat-submit.type';

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
export class MatSubmitFieldComponent implements MatSubmitField {
  readonly label = input.required<MatSubmitProps['label']>();
  readonly disabled = input<MatSubmitProps['disabled']>(false);
  readonly className = input<MatSubmitProps['className']>('');
  readonly onClick = input<MatSubmitProps['onClick']>();

  // Material specific props
  readonly color = input<MatSubmitProps['color']>('primary' as const);

  handleClick(): void {
    const clickHandler = this.onClick();

    if (clickHandler) {
      clickHandler();
    }
  }
}
