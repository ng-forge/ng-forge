import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { DynamicTextPipe } from '@ng-forge/dynamic-forms';
import { injectNgForgeAddonAction, NgForgeAddonAction } from '@ng-forge/dynamic-forms/integration';
import type { BsButtonAddon } from '../types/addons';

/**
 * Renderer for the `bs-button` addon kind.
 *
 * Renders a Bootstrap `btn-outline-{severity}` button. Click dispatch
 * (preset / actionRef / action precedence, multi-set warning, `disabled` /
 * `loading` resolution) lives on `NgForgeAddonAction`; this component
 * focuses on the visual layer.
 */
@Component({
  selector: 'df-bs-button-addon',
  imports: [DynamicTextPipe, AsyncPipe],
  hostDirectives: [NgForgeAddonAction],
  template: `
    <button
      type="button"
      [class]="buttonClass()"
      [disabled]="action.disabled() || action.loading()"
      [attr.aria-label]="(ariaLabel() | dynamicText | async) ?? null"
      [attr.aria-busy]="action.loading() || null"
      (click)="action.dispatch()"
    >
      @if (action.loading()) {
        <!-- Visually-hidden role=status text gives a reliable AT announcement (VO/JAWS/NVDA). -->
        <span class="spinner-border spinner-border-sm" aria-hidden="true"></span>
        <span class="visually-hidden" role="status">Loading…</span>
      } @else if (iconClass(); as ic) {
        <i [class]="ic" aria-hidden="true"></i>
      }
      @if (label(); as l) {
        <span>{{ l | dynamicText | async }}</span>
      }
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BsButtonAddonComponent {
  protected readonly action = injectNgForgeAddonAction<BsButtonAddon>();

  /** Re-exposed for template binding — same signal stored on the directive. */
  protected readonly addon = this.action.addon;

  protected readonly label = computed(() => this.addon().label);
  protected readonly ariaLabel = computed(() => this.addon().ariaLabel);
  protected readonly iconClass = computed(() => {
    const icon = this.addon().icon;
    return icon ? `bi bi-${icon}` : '';
  });
  protected readonly buttonClass = computed(() => `btn btn-outline-${this.addon().severity ?? 'secondary'}`);
}
