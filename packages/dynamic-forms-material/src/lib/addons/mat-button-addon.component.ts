import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { DynamicTextPipe } from '@ng-forge/dynamic-forms';
import { injectNgForgeAddonAction, NgForgeAddonAction } from '@ng-forge/dynamic-forms/integration';
import type { MatButtonAddon } from '../types/addons';

/**
 * Renderer for the `mat-button` addon kind.
 *
 * Renders `<button mat-icon-button>` when icon-only (no label), or
 * `<button mat-button>` when labeled. Click dispatch (preset / actionRef /
 * action precedence, multi-set warning, `disabled` / `loading` resolution)
 * lives on `NgForgeAddonAction`; this component focuses on the visual layer.
 */
@Component({
  selector: 'df-mat-button-addon',
  imports: [MatButton, MatIconButton, MatIcon, DynamicTextPipe, AsyncPipe],
  hostDirectives: [NgForgeAddonAction],
  template: `
    @if (isIconOnly()) {
      <button
        mat-icon-button
        type="button"
        [color]="addon().color ?? null"
        [disabled]="action.disabled() || action.loading()"
        [attr.aria-label]="(ariaLabel() | dynamicText | async) || null"
        (click)="action.dispatch()"
      >
        <mat-icon aria-hidden="true">{{ addon().icon }}</mat-icon>
      </button>
    } @else {
      <button
        mat-button
        type="button"
        [color]="addon().color ?? null"
        [disabled]="action.disabled() || action.loading()"
        [attr.aria-label]="(ariaLabel() | dynamicText | async) || null"
        (click)="action.dispatch()"
      >
        @if (addon().icon; as icon) {
          <mat-icon aria-hidden="true">{{ icon }}</mat-icon>
        }
        {{ label() | dynamicText | async }}
      </button>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatButtonAddonComponent {
  protected readonly action = injectNgForgeAddonAction<MatButtonAddon>();

  /** Re-exposed for template binding — same signal stored on the directive. */
  protected readonly addon = this.action.addon;

  protected readonly label = computed(() => this.addon().label);
  protected readonly ariaLabel = computed(() => this.addon().ariaLabel);
  protected readonly isIconOnly = computed(() => {
    const a = this.addon();
    return !!a.icon && !a.label;
  });
}
