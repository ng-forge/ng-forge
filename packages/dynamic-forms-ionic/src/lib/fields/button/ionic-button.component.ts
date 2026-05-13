import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { IonButton } from '@ionic/angular/standalone';
import { AsyncPipe } from '@angular/common';
import { DynamicTextPipe, FormEvent } from '@ng-forge/dynamic-forms';
import { injectNgForgeAction, NgForgeActionHost } from '@ng-forge/dynamic-forms/integration';
import { IonicButtonProps } from './ionic-button.type';

@Component({
  selector: 'df-ion-button',
  imports: [IonButton, DynamicTextPipe, AsyncPipe],
  hostDirectives: [NgForgeActionHost],
  styles: [
    `
      :host([hidden]) {
        display: none !important;
      }
    `,
  ],
  template: `
    @let buttonId = action.key() + '-button';

    <ion-button
      [id]="buttonId"
      [type]="buttonType()"
      [expand]="props()?.expand"
      [fill]="props()?.fill || 'solid'"
      [shape]="props()?.shape"
      [size]="props()?.size"
      [color]="props()?.color || 'primary'"
      [strong]="props()?.strong"
      [disabled]="action.disabled()"
      [attr.tabindex]="action.tabIndex()"
      [attr.data-testid]="buttonTestId()"
      (click)="onClick()"
    >
      {{ action.label() | dynamicText | async }}
    </ion-button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class IonicButtonFieldComponent<TEvent extends FormEvent> {
  protected readonly action = injectNgForgeAction<TEvent>();

  readonly props = input<IonicButtonProps>();

  readonly buttonType = computed(() => this.props()?.type ?? 'button');

  readonly buttonTestId = computed(() => `${this.buttonType()}-${this.action.key()}`);

  onClick(): void {
    if (this.buttonType() === 'submit') return;
    this.action.dispatch();
  }
}
