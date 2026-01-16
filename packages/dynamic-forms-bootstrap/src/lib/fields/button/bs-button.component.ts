import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import {
  ARRAY_CONTEXT,
  ArrayItemContext,
  DynamicText,
  DynamicTextPipe,
  EventBus,
  FormEvent,
  FormEventConstructor,
  resolveTokens,
} from '@ng-forge/dynamic-forms';
import { EventArgs } from '@ng-forge/dynamic-forms/integration';
import { BsButtonComponent, BsButtonProps } from './bs-button.type';

@Component({
  selector: 'df-bs-button',
  imports: [DynamicTextPipe, AsyncPipe],
  styleUrl: '../../styles/_form-field.scss',
  host: {
    '[id]': '`${key()}`',
    '[attr.data-testid]': 'key()',
    '[class]': 'className()',
    '[attr.hidden]': 'hidden() || null',
  },
  template: `
    @let buttonId = key() + '-button';
    <button
      [id]="buttonId"
      [type]="buttonType()"
      [disabled]="disabled()"
      [class]="buttonClasses()"
      [attr.tabindex]="tabIndex()"
      [attr.data-testid]="buttonTestId()"
      (click)="onClick()"
    >
      {{ label() | dynamicText | async }}
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class BsButtonFieldComponent<TEvent extends FormEvent> implements BsButtonComponent<TEvent> {
  private readonly eventBus = inject(EventBus);

  private readonly arrayContext = inject(ARRAY_CONTEXT, { optional: true });

  readonly key = input.required<string>();
  readonly label = input.required<DynamicText>();
  readonly disabled = input<boolean>(false);
  readonly hidden = input<boolean>(false);
  readonly tabIndex = input<number>();
  readonly className = input<string>('');

  /** Event to dispatch on click. Optional for submit buttons (native form submit handles it). */
  readonly event = input<FormEventConstructor<TEvent>>();
  readonly eventArgs = input<EventArgs>();
  readonly props = input<BsButtonProps>();

  readonly eventContext = input<ArrayItemContext>();

  /** Resolved button type - defaults to 'button' if not specified in props */
  readonly buttonType = computed(() => this.props()?.type ?? 'button');

  readonly buttonTestId = computed(() => `${this.buttonType()}-${this.key()}`);

  readonly buttonClasses = computed(() => {
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

  /**
   * Handle button click.
   * - For submit buttons (type="submit"): do nothing, native form submit handles it
   * - For other buttons: dispatch the configured event via EventBus
   */
  onClick(): void {
    // Native submit buttons let the form handle submission
    if (this.buttonType() === 'submit') {
      return;
    }

    // Other buttons dispatch their event (if configured)
    const event = this.event();
    if (event) {
      this.dispatchEvent(event);
    }
  }

  private dispatchEvent(event: FormEventConstructor<TEvent>): void {
    const args = this.eventArgs();

    if (args && args.length > 0) {
      // Build context from injected ARRAY_CONTEXT (with linkedSignal index) or fallback to eventContext
      const context: ArrayItemContext = this.arrayContext
        ? {
            key: this.key(),
            // Read signal to get current index (automatically updates via linkedSignal)
            index: this.arrayContext.index(),
            arrayKey: this.arrayContext.arrayKey,
            formValue: this.arrayContext.formValue,
          }
        : this.eventContext() || { key: this.key() };

      // Resolve tokens in event args using the provided context
      const resolvedArgs = resolveTokens(args, context);

      // Dispatch event with resolved args
      this.eventBus.dispatch(event, ...resolvedArgs);
    } else {
      // No args, dispatch event without arguments
      this.eventBus.dispatch(event);
    }
  }
}
