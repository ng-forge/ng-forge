import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { DynamicTextPipe } from '@ng-forge/dynamic-forms';
import { injectNgForgeAddonAction, NgForgeAddonAction } from '@ng-forge/dynamic-forms/integration';
import type { MatButtonAddon } from '../types/addons';

/** Renderer for the `mat-button` addon kind. */
@Component({
  selector: 'df-mat-button-addon',
  imports: [MatButton, MatIconButton, MatIcon, MatProgressSpinner, DynamicTextPipe, AsyncPipe],
  hostDirectives: [NgForgeAddonAction],
  template: `
    @if (isIconOnly()) {
      <button
        mat-icon-button
        type="button"
        [color]="addon().color ?? null"
        [disabled]="action.disabled() || action.loading()"
        [attr.aria-label]="(ariaLabel() | dynamicText | async) ?? null"
        [attr.aria-busy]="action.loading() || null"
        (click)="action.dispatch()"
      >
        @if (action.loading()) {
          <mat-progress-spinner mode="indeterminate" diameter="18" aria-hidden="true" />
          <span class="df-mat-sr-only" role="status">Loading…</span>
        } @else {
          <mat-icon aria-hidden="true">{{ addon().icon }}</mat-icon>
        }
      </button>
    } @else {
      <button
        mat-button
        type="button"
        [color]="addon().color ?? null"
        [disabled]="action.disabled() || action.loading()"
        [attr.aria-label]="(ariaLabel() | dynamicText | async) ?? null"
        [attr.aria-busy]="action.loading() || null"
        (click)="action.dispatch()"
      >
        @if (action.loading()) {
          <mat-progress-spinner mode="indeterminate" diameter="18" aria-hidden="true" />
          <span class="df-mat-sr-only" role="status">Loading…</span>
        } @else if (addon().icon; as icon) {
          <mat-icon aria-hidden="true">{{ icon }}</mat-icon>
        }
        {{ label() | dynamicText | async }}
      </button>
    }
  `,
  styles: [
    `
      .df-mat-sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      }
    `,
  ],
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
