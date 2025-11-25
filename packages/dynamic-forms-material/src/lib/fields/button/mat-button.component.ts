import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { MatButton } from '@angular/material/button';
import {
  ARRAY_CONTEXT,
  ArrayItemContext,
  DynamicText,
  DynamicTextPipe,
  EventArgs,
  EventBus,
  FormEvent,
  FormEventConstructor,
  resolveTokens,
} from '@ng-forge/dynamic-forms';
import { MatButtonComponent, MatButtonProps } from './mat-button.type';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'df-mat-button',
  imports: [MatButton, DynamicTextPipe, AsyncPipe],
  host: {
    '[id]': '`${key()}`',
    '[attr.data-testid]': 'key()',
    '[class]': 'className()',
  },
  template: `
    <button
      mat-raised-button
      [type]="props()?.type || 'button'"
      [color]="props()?.color || 'primary'"
      [disabled]="disabled() || false"
      [attr.data-testid]="buttonTestId()"
      (click)="triggerEvent()"
    >
      {{ label() | dynamicText | async }}
    </button>
  `,
  styles: [
    `
      :host {
        display: block;
      }

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

  readonly event = input.required<FormEventConstructor<TEvent>>();
  readonly eventArgs = input<EventArgs>();
  readonly props = input<MatButtonProps>();

  readonly eventContext = input<ArrayItemContext>();

  buttonTestId = computed(() => `${this.props()?.type}-${this.key()}`);

  triggerEvent(): void {
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
      this.eventBus.dispatch(this.event(), ...resolvedArgs);
    } else {
      // No args, dispatch event without arguments
      this.eventBus.dispatch(this.event());
    }
  }
}
