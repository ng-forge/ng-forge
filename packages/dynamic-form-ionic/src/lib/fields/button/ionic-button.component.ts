import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { IonButton } from '@ionic/angular/standalone';
import { DynamicText, DynamicTextPipe, EventBus, FormEvent, FormEventConstructor } from '@ng-forge/dynamic-form';
import { IonicButtonComponent, IonicButtonProps } from './ionic-button.type';
import { AsyncPipe } from '@angular/common';

/**
 * Ionic button component
 */
@Component({
  selector: 'df-ionic-button',
  imports: [IonButton, DynamicTextPipe, AsyncPipe],
  host: {
    '[id]': '`${key()}`',
    '[attr.data-testid]': 'key()',
  },
  template: `
    <ion-button
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
  readonly props = input<IonicButtonProps>();

  buttonTestId = computed(() => `button-${this.key()}`);

  triggerEvent(): void {
    this.eventBus.dispatch(this.event());
  }
}
