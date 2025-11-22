import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { IonButton } from '@ionic/angular/standalone';
import {
  ArrayItemContext,
  DynamicText,
  DynamicTextPipe,
  EventArgs,
  EventBus,
  FormEvent,
  FormEventConstructor,
  resolveTokens,
} from '@ng-forge/dynamic-forms';
import { IonicButtonComponent, IonicButtonProps } from './ionic-button.type';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'df-ionic-button',
  imports: [IonButton, DynamicTextPipe, AsyncPipe],
  host: {
    '[id]': '`${key()}`',
    '[attr.data-testid]': 'key()',
  },
  template: `
    <ion-button
      [type]="props()?.type || 'button'"
      [expand]="props()?.expand"
      [fill]="props()?.fill || 'solid'"
      [shape]="props()?.shape"
      [size]="props()?.size"
      [color]="props()?.color || 'primary'"
      [strong]="props()?.strong"
      [class]="className() || ''"
      [disabled]="disabled() || false"
      [attr.data-testid]="buttonTestId()"
      (click)="triggerEvent()"
    >
      {{ label() | dynamicText | async }}
    </ion-button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class IonicButtonFieldComponent<TEvent extends FormEvent> implements IonicButtonComponent<TEvent> {
  private readonly eventBus = inject(EventBus);

  readonly key = input.required<string>();
  readonly label = input.required<DynamicText>();
  readonly disabled = input<boolean>(false);
  readonly hidden = input<boolean>(false);
  readonly tabIndex = input<number>();
  readonly className = input<string>('');

  readonly event = input.required<FormEventConstructor<TEvent>>();
  readonly eventArgs = input<EventArgs>();
  readonly props = input<IonicButtonProps>();

  readonly eventContext = input<ArrayItemContext>();

  buttonTestId = computed(() => `${this.props()?.type || 'button'}-${this.key()}`);

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
