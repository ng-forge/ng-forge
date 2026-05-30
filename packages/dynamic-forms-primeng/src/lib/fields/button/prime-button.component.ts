import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { ButtonDirective } from 'primeng/button';
import { FormEvent } from '@ng-forge/dynamic-forms';
import { DynamicTextPipe } from '@ng-forge/dynamic-forms/integration';
import { injectNgForgeAction, NgForgeActionHost } from '@ng-forge/dynamic-forms/integration';
import { PrimeButtonProps } from './prime-button.type';

@Component({
  selector: 'df-prime-button',
  imports: [ButtonDirective, DynamicTextPipe, AsyncPipe],
  hostDirectives: [NgForgeActionHost],
  template: `
    <button
      pButton
      [type]="buttonType()"
      [severity]="props()?.severity || 'primary'"
      [text]="props()?.text || false"
      [outlined]="props()?.outlined || false"
      [raised]="props()?.raised || false"
      [rounded]="props()?.rounded || false"
      [disabled]="action.disabled()"
      [attr.tabindex]="action.tabIndex()"
      [attr.data-testid]="buttonTestId()"
      (click)="onClick()"
    >
      {{ action.label() | dynamicText | async }}
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PrimeButtonFieldComponent<TEvent extends FormEvent> {
  protected readonly action = injectNgForgeAction<TEvent>();

  readonly props = input<PrimeButtonProps>();

  readonly buttonType = computed(() => this.props()?.type ?? 'button');

  readonly buttonTestId = computed(() => `${this.buttonType()}-${this.action.key()}`);

  onClick(): void {
    if (this.buttonType() === 'submit') return;
    this.action.dispatch();
  }
}
