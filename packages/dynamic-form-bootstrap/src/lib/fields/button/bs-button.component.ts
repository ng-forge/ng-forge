import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import {
  ArrayItemContext,
  DynamicText,
  DynamicTextPipe,
  EventArgs,
  EventBus,
  FormEvent,
  FormEventConstructor,
  resolveTokens,
} from '@ng-forge/dynamic-form';
import { BsButtonComponent, BsButtonProps } from './bs-button.type';
import { BOOTSTRAP_CONFIG } from '../../models/bootstrap-config.token';

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
  private bootstrapConfig = inject(BOOTSTRAP_CONFIG, { optional: true });

  readonly key = input.required<string>();
  readonly label = input.required<DynamicText>();
  readonly disabled = input<boolean>(false);
  readonly hidden = input<boolean>(false);
  readonly tabIndex = input<number>();
  readonly className = input<string>('');

  readonly event = input.required<FormEventConstructor<TEvent>>();
  readonly eventArgs = input<EventArgs>();
  readonly props = input<BsButtonProps>();

  // Array item context for token resolution (only set for add/remove array item buttons)
  readonly eventContext = input<ArrayItemContext>();

  buttonTestId = computed(() => `${this.props()?.type || 'button'}-${this.key()}`);

  readonly effectiveSize = computed(() =>
    this.props()?.size ?? this.bootstrapConfig?.size
  );

  readonly effectiveVariant = computed(() =>
    this.props()?.variant ?? this.bootstrapConfig?.buttonVariant ?? 'primary'
  );

  readonly effectiveOutline = computed(() =>
    this.props()?.outline ?? this.bootstrapConfig?.buttonOutline ?? false
  );

  readonly effectiveBlock = computed(() =>
    this.props()?.block ?? this.bootstrapConfig?.buttonBlock ?? false
  );

  buttonClasses = computed(() => {
    const p = this.props();
    const variant = this.effectiveVariant();
    const outline = this.effectiveOutline() ? 'outline-' : '';

    return [
      'btn',
      `btn-${outline}${variant}`,
      this.effectiveSize() === 'sm' && 'btn-sm',
      this.effectiveSize() === 'lg' && 'btn-lg',
      this.effectiveBlock() && 'w-100',
      p?.active && 'active',
      this.className(),
    ]
      .filter(Boolean)
      .join(' ');
  });

  triggerEvent(): void {
    const args = this.eventArgs();

    if (args && args.length > 0) {
      // Get context or build default from key
      const context = this.eventContext() || { key: this.key() };

      // Resolve tokens in event args using the provided context
      const resolvedArgs = resolveTokens(args, context);

      // Dispatch event with resolved args
      this.eventBus.dispatch(this.event(), ...resolvedArgs);
    } else {
      // No args, dispatch event without arguments
      this.eventBus.dispatch(this.event());
    }
  }
}
