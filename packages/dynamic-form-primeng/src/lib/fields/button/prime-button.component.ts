import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { ButtonDirective } from 'primeng/button';
import { DynamicText, DynamicTextPipe, EventBus, FormEvent, FormEventConstructor } from '@ng-forge/dynamic-form';
import { PrimeButtonComponent, PrimeButtonProps } from './prime-button.type';

/**
 * PrimeNG button field component
 */
@Component({
  selector: 'df-prime-button',
  imports: [ButtonDirective, DynamicTextPipe, AsyncPipe],
  host: {
    '[id]': '`${key()}`',
    '[attr.data-testid]': 'key()',
  },
  template: `
    <button
      pButton
      [type]="props()?.type || 'button'"
      [severity]="props()?.severity || 'primary'"
      [text]="props()?.text || false"
      [outlined]="props()?.outlined || false"
      [raised]="props()?.raised || false"
      [rounded]="props()?.rounded || false"
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
export default class PrimeButtonFieldComponent<TEvent extends FormEvent> implements PrimeButtonComponent<TEvent> {
  private readonly eventBus = inject(EventBus);

  readonly key = input.required<string>();
  readonly label = input.required<DynamicText>();
  readonly disabled = input<boolean>(false);
  readonly hidden = input<boolean>(false);
  readonly tabIndex = input<number>();
  readonly className = input<string>('');

  readonly event = input.required<FormEventConstructor<TEvent>>();
  readonly props = input<PrimeButtonProps>();

  buttonTestId = computed(() => `${this.props()?.type}-${this.key()}`);

  triggerEvent(): void {
    this.eventBus.dispatch(this.event());
  }
}
