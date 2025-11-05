import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { MatButton } from '@angular/material/button';
import {
  DynamicText,
  DynamicTextPipe,
  EventBus,
  FormEvent,
  FormEventConstructor,
  NextPageEvent,
  PreviousPageEvent,
  SubmitEvent,
} from '@ng-forge/dynamic-form';
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
    '[attr.data-testid]': 'key()',
  },
  template: `
    <button
      mat-raised-button
      [type]="props()?.type || 'button'"
      [color]="props()?.color || 'primary'"
      [class]="className() || ''"
      [disabled]="disabled() || false"
      [attr.data-testid]="buttonTestId()"
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

  readonly event = input<FormEventConstructor<TEvent>>();
  readonly props = input<MatButtonProps>();

  /**
   * Computed test ID based on button event type
   * - Submit buttons: 'submit-button'
   * - Next buttons: 'next-button'
   * - Previous buttons: 'previous-button'
   * - Custom buttons: use the key
   */
  readonly buttonTestId = computed(() => {
    const eventConstructor = this.event();

    if (eventConstructor === SubmitEvent) {
      return 'submit-button';
    } else if (eventConstructor === NextPageEvent) {
      return 'next-button';
    } else if (eventConstructor === PreviousPageEvent) {
      return 'previous-button';
    }

    return this.key();
  });

  triggerEvent(): void {
    const eventConstructor = this.event();
    if (eventConstructor) {
      this.eventBus.dispatch(eventConstructor);
    }
  }
}
