import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { DynamicText, DynamicTextPipe, EventBus, FormEvent, FormEventConstructor } from '@ng-forge/dynamic-form';
import { MatButtonComponent, MatButtonProps } from './mat-button.type';
import { AsyncPipe } from '@angular/common';

/**
 * Material Design button button component
 */
@Component({
  selector: 'df-mat-button',
  imports: [MatButton, DynamicTextPipe, AsyncPipe],
  host: {
    '[id]': '`${key()}`',
  },
  template: `
    <button
      mat-raised-button
      [attr.data-testid]="props()?.['data-testid']"
      [type]="props()?.type || 'button'"
      [color]="props()?.color || 'primary'"
      [class]="className() || ''"
      [disabled]="disabled() || false"
      (click)="triggerEvent()"
    >
      {{ label() | dynamicText | async }}
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MatButtonFieldComponent<TEvent extends FormEvent> implements MatButtonComponent<TEvent> {
  private readonly eventBus = inject(EventBus);

  readonly key = input.required<string>();
  readonly label = input.required<DynamicText>();
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
