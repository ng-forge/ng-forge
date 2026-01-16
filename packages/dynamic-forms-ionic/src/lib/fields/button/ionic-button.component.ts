import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { IonButton } from '@ionic/angular/standalone';
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
import { IonicButtonComponent, IonicButtonProps } from './ionic-button.type';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'df-ion-button',
  imports: [IonButton, DynamicTextPipe, AsyncPipe],
  host: {
    '[id]': '`${key()}`',
    '[class]': 'className()',
    '[attr.data-testid]': 'key()',
    '[attr.hidden]': 'hidden() || null',
  },
  styles: [
    `
      :host([hidden]) {
        display: none !important;
      }
    `,
  ],
  template: `
    @let buttonId = key() + '-button';

    <ion-button
      [id]="buttonId"
      [type]="buttonType()"
      [expand]="props()?.expand"
      [fill]="props()?.fill || 'solid'"
      [shape]="props()?.shape"
      [size]="props()?.size"
      [color]="props()?.color || 'primary'"
      [strong]="props()?.strong"
      [disabled]="disabled()"
      [attr.data-testid]="buttonTestId()"
      (click)="onClick()"
    >
      {{ label() | dynamicText | async }}
    </ion-button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class IonicButtonFieldComponent<TEvent extends FormEvent> implements IonicButtonComponent<TEvent> {
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
  readonly props = input<IonicButtonProps>();

  readonly eventContext = input<ArrayItemContext>();

  /** Resolved button type - defaults to 'button' if not specified in props */
  readonly buttonType = computed(() => this.props()?.type ?? 'button');

  readonly buttonTestId = computed(() => `${this.buttonType()}-${this.key()}`);

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
