import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { DynamicTextPipe } from '@ng-forge/dynamic-forms';
import { injectNgForgeAddonAction, NgForgeAddonAction } from '@ng-forge/dynamic-forms/integration';
import { ButtonModule } from 'primeng/button';
import type { PiButtonAddon } from '../types/addons';

/**
 * Renderer for the `pi-button` addon kind.
 *
 * Wraps PrimeNG's `<p-button>`. Click dispatch (preset / actionRef /
 * action precedence, multi-set warning, `disabled` / `loading`
 * resolution) lives on `NgForgeAddonAction`; this component focuses on
 * the visual layer.
 */
@Component({
  selector: 'df-prime-button-addon',
  imports: [ButtonModule, DynamicTextPipe, AsyncPipe],
  hostDirectives: [NgForgeAddonAction],
  template: `
    <p-button
      [icon]="iconClass()"
      [label]="(label() | dynamicText | async) ?? ''"
      [severity]="addon().severity ?? 'secondary'"
      [loading]="action.loading()"
      [disabled]="action.disabled()"
      [attr.aria-label]="(ariaLabel() | dynamicText | async) || null"
      (onClick)="action.dispatch()"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PiButtonAddonComponent {
  protected readonly action = injectNgForgeAddonAction<PiButtonAddon>();

  /** Re-exposed for template binding — same signal stored on the directive. */
  protected readonly addon = this.action.addon;

  protected readonly label = computed(() => this.addon().label);
  protected readonly ariaLabel = computed(() => this.addon().ariaLabel);
  protected readonly iconClass = computed(() => {
    const icon = this.addon().icon;
    return icon ? `pi pi-${icon}` : '';
  });
}
