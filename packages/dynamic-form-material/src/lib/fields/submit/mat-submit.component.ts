import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatSubmitProps } from './mat-submit.type';
import { EventBus, SubmitEvent } from '@ng-forge/dynamic-form';

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
      (click)="submit()"
    >
      {{ label() }}
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatSubmitFieldComponent {
  private readonly eventBus = inject(EventBus);

  readonly label = input.required<MatSubmitProps['label']>();
  readonly disabled = input<MatSubmitProps['disabled']>(false);
  readonly className = input<MatSubmitProps['className']>('');
  readonly onClick = input<MatSubmitProps['onClick']>();

  // Material specific props
  readonly color = input<MatSubmitProps['color']>('primary' as const);

  submit(): void {
    this.eventBus.dispatch(new SubmitEvent());
  }
}
