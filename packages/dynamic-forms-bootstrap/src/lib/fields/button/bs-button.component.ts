import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { FormEvent } from '@ng-forge/dynamic-forms';
import { DynamicTextPipe } from '@ng-forge/dynamic-forms/integration';
import { injectNgForgeAction, NgForgeActionHost } from '@ng-forge/dynamic-forms/integration';
import { BsButtonProps } from './bs-button.type';

@Component({
  selector: 'df-bs-button',
  imports: [DynamicTextPipe, AsyncPipe],
  styleUrl: '../../styles/_form-field.scss',
  hostDirectives: [NgForgeActionHost],
  template: `
    @let buttonId = action.key() + '-button';
    <button
      [id]="buttonId"
      [type]="buttonType()"
      [disabled]="action.disabled()"
      [class]="buttonClasses()"
      [attr.tabindex]="action.tabIndex()"
      [attr.data-testid]="buttonTestId()"
      (click)="onClick()"
    >
      {{ action.label() | dynamicText | async }}
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class BsButtonFieldComponent<TEvent extends FormEvent> {
  protected readonly action = injectNgForgeAction<TEvent>();

  readonly props = input<BsButtonProps>();

  /** Resolved button type — defaults to 'button' unless overridden via props. */
  readonly buttonType = computed(() => this.props()?.type ?? 'button');

  readonly buttonTestId = computed(() => `${this.buttonType()}-${this.action.key()}`);

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
      this.action.className(),
    ]
      .filter(Boolean)
      .join(' ');
  });

  /** Submit buttons let the native form handle submission; other buttons dispatch via the directive. */
  onClick(): void {
    if (this.buttonType() === 'submit') return;
    this.action.dispatch();
  }
}
