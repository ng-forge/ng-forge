import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { ButtonDirective } from 'primeng/button';
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
import { PrimeButtonComponent, PrimeButtonProps } from './prime-button.type';
import { PRIMENG_CONFIG } from '../../models/primeng-config.token';

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
      [severity]="effectiveSeverity()"
      [text]="effectiveText()"
      [outlined]="effectiveOutlined()"
      [raised]="effectiveRaised()"
      [rounded]="effectiveRounded()"
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
  private primengConfig = inject(PRIMENG_CONFIG, { optional: true });

  readonly key = input.required<string>();
  readonly label = input.required<DynamicText>();
  readonly disabled = input<boolean>(false);
  readonly hidden = input<boolean>(false);
  readonly tabIndex = input<number>();
  readonly className = input<string>('');

  readonly event = input.required<FormEventConstructor<TEvent>>();
  readonly eventArgs = input<EventArgs>();
  readonly props = input<PrimeButtonProps>();

  // Array item context for token resolution (only set for add/remove array item buttons)
  readonly eventContext = input<ArrayItemContext>();

  readonly effectiveSeverity = computed(() =>
    this.props()?.severity ?? this.primengConfig?.buttonSeverity ?? 'primary'
  );

  readonly effectiveText = computed(() =>
    this.props()?.text ?? this.primengConfig?.buttonText ?? false
  );

  readonly effectiveOutlined = computed(() =>
    this.props()?.outlined ?? this.primengConfig?.buttonOutlined ?? false
  );

  readonly effectiveRaised = computed(() =>
    this.props()?.raised ?? this.primengConfig?.buttonRaised ?? false
  );

  readonly effectiveRounded = computed(() =>
    this.props()?.rounded ?? this.primengConfig?.buttonRounded ?? false
  );

  buttonTestId = computed(() => `${this.props()?.type}-${this.key()}`);

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
