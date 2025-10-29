import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatSubmitComponent, MatSubmitProps } from './mat-submit.type';
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
export class MatSubmitFieldComponent implements MatSubmitComponent {
  private readonly eventBus = inject(EventBus);

  readonly label = input.required<MatSubmitProps['label']>();
  readonly disabled = input<MatSubmitProps['disabled']>(false);
  readonly className = input<MatSubmitProps['className']>('');

  // Material specific props
  readonly color = input<MatSubmitProps['color']>('primary' as const);

  submit(): void {
    this.eventBus.dispatch(new SubmitEvent());
  }
}
