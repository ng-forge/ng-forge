import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { MatButton } from '@angular/material/button';
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
import { MatButtonComponent, MatButtonProps } from './mat-button.type';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'df-mat-button',
  imports: [MatButton, DynamicTextPipe, AsyncPipe],
  host: {
    '[id]': '`${key()}`',
    '[attr.data-testid]': 'key()',
    '[class]': 'className()',
    '[attr.hidden]': 'hidden() || null',
  },
  template: `
    @let buttonId = key() + '-button';
    <button
      mat-raised-button
      [id]="buttonId"
      [type]="buttonType()"
      [color]="props()?.color || 'primary'"
      [disabled]="disabled()"
      [attr.data-testid]="buttonTestId()"
      (click)="onClick()"
    >
      {{ label() | dynamicText | async }}
    </button>
  `,
  styleUrl: '../../styles/_form-field.scss',
  styles: [
    `
      button {
        min-width: fit-content;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MatButtonFieldComponent<TEvent extends FormEvent> implements MatButtonComponent<TEvent> {
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
  readonly props = input<MatButtonProps>();

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
