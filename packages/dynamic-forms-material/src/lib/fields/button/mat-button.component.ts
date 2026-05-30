import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { AsyncPipe } from '@angular/common';
import { FormEvent } from '@ng-forge/dynamic-forms';
import { DynamicTextPipe } from '@ng-forge/dynamic-forms/integration';
import { injectNgForgeAction, NgForgeActionHost } from '@ng-forge/dynamic-forms/integration';
import { MatButtonProps } from './mat-button.type';

@Component({
  selector: 'df-mat-button',
  imports: [MatButton, DynamicTextPipe, AsyncPipe],
  hostDirectives: [NgForgeActionHost],
  template: `
    @let buttonId = action.key() + '-button';
    <button
      mat-raised-button
      [id]="buttonId"
      [type]="buttonType()"
      [color]="props()?.color || 'primary'"
      [disabled]="action.disabled()"
      [attr.tabindex]="action.tabIndex()"
      [attr.data-testid]="buttonTestId()"
      (click)="onClick()"
    >
      {{ action.label() | dynamicText | async }}
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
export default class MatButtonFieldComponent<TEvent extends FormEvent> {
  protected readonly action = injectNgForgeAction<TEvent>();

  readonly props = input<MatButtonProps>();

  readonly buttonType = computed(() => this.props()?.type ?? 'button');

  readonly buttonTestId = computed(() => `${this.buttonType()}-${this.action.key()}`);

  onClick(): void {
    if (this.buttonType() === 'submit') return;
    this.action.dispatch();
  }
}
