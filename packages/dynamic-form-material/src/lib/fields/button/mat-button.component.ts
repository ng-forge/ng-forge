import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatButtonComponent, MatButtonProps } from './mat-button.type';
import { EventBus, FormEvent, FormEventConstructor } from '@ng-forge/dynamic-form';

/**
 * Material Design button button component
 */
@Component({
  selector: 'df-mat-button',
  imports: [MatButton],
  template: `
    <button
      mat-raised-button
      type="button"
      [color]="props()?.color || 'primary'"
      [class]="className() || ''"
      [disabled]="disabled() || false"
      (click)="triggerEvent()"
    >
      {{ label() }}
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MatButtonFieldComponent<TEvent extends FormEvent> implements MatButtonComponent<TEvent> {
  private readonly eventBus = inject(EventBus);

  readonly label = input.required<string>();
  readonly disabled = input<boolean>(false);
  readonly hidden = input<boolean>(false);
  readonly tabIndex = input<number>();
  readonly className = input<string>('');

  readonly event = input.required<FormEventConstructor<TEvent>>();
  readonly props = input<MatButtonProps>();

  triggerEvent(): void {
    this.eventBus.dispatch(this.event());
  }
}
