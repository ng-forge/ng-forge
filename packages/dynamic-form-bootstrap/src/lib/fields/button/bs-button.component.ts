import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { DynamicText, DynamicTextPipe, EventBus, FormEvent, FormEventConstructor } from '@ng-forge/dynamic-form';
import { BsButtonComponent, BsButtonProps } from './bs-button.type';

/**
 * Bootstrap button component
 */
@Component({
  selector: 'df-bs-button',
  imports: [DynamicTextPipe, AsyncPipe],
  styleUrl: '../../styles/_form-field.scss',
  host: {
    '[id]': '`${key()}`',
    '[attr.data-testid]': 'key()',
    '[class]': 'className()',
    '[hidden]': 'hidden()',
  },
  template: `
    <button
      [id]="key()"
      [type]="props()?.type || 'button'"
      [disabled]="disabled()"
      [class]="buttonClasses()"
      [attr.tabindex]="tabIndex()"
      [attr.data-testid]="buttonTestId()"
      (click)="triggerEvent()"
    >
      {{ label() | dynamicText | async }}
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class BsButtonFieldComponent<TEvent extends FormEvent> implements BsButtonComponent<TEvent> {
  private readonly eventBus = inject(EventBus);

  readonly key = input.required<string>();
  readonly label = input.required<DynamicText>();
  readonly disabled = input<boolean>(false);
  readonly hidden = input<boolean>(false);
  readonly tabIndex = input<number>();
  readonly className = input<string>('');

  readonly event = input.required<FormEventConstructor<TEvent>>();
  readonly props = input<BsButtonProps>();

  buttonTestId = computed(() => `${this.props()?.type || 'button'}-${this.key()}`);

  buttonClasses = computed(() => {
    const p = this.props();
    const variant = p?.variant || 'primary';
    const outline = p?.outline ? 'outline-' : '';

    return [
      'btn',
      `btn-${outline}${variant}`,
      p?.size === 'sm' && 'btn-sm',
      p?.size === 'lg' && 'btn-lg',
      p?.block && 'w-100',
      p?.active && 'active',
      this.className(),
    ]
      .filter(Boolean)
      .join(' ');
  });

  triggerEvent(): void {
    this.eventBus.dispatch(this.event());
  }
}
