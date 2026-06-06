import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { DynamicTextPipe } from '@ng-forge/dynamic-forms/integration';
import { injectNgForgeAddonAction, NgForgeAddonAction } from '@ng-forge/dynamic-forms/integration';
import { ButtonModule } from 'primeng/button';
import type { PrimeButtonAddon } from '../types/addons';

/** Renderer for the `prime-button` addon type. */
@Component({
  selector: 'df-prime-button-addon',
  imports: [ButtonModule, DynamicTextPipe, AsyncPipe],
  hostDirectives: [NgForgeAddonAction],
  template: `
    @if (isIconOnly()) {
      <p-button
        [icon]="iconClass()"
        [severity]="addon().severity ?? 'secondary'"
        [loading]="action.loading()"
        [disabled]="action.disabled() || action.loading()"
        [attr.aria-label]="(ariaLabel() | dynamicText | async) ?? null"
        [attr.aria-busy]="action.loading() || null"
        (onClick)="action.dispatch()"
      />
    } @else {
      <p-button
        [icon]="iconClass()"
        [label]="(label() | dynamicText | async) ?? ''"
        [severity]="addon().severity ?? 'secondary'"
        [loading]="action.loading()"
        [disabled]="action.disabled() || action.loading()"
        [attr.aria-label]="(ariaLabel() | dynamicText | async) ?? null"
        [attr.aria-busy]="action.loading() || null"
        (onClick)="action.dispatch()"
      />
    }
    @if (action.loading()) {
      <span class="df-prime-sr-only" role="status">Loading…</span>
    }
  `,
  styles: [
    `
      .df-prime-sr-only {
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
export class PrimeButtonAddonComponent {
  protected readonly action = injectNgForgeAddonAction<PrimeButtonAddon>();

  /** Re-exposed for template binding — same signal stored on the directive. */
  protected readonly addon = this.action.addon;

  protected readonly label = computed(() => this.addon().label);
  protected readonly ariaLabel = computed(() => this.addon().ariaLabel);
  protected readonly isIconOnly = computed(() => {
    const a = this.addon();
    return !!a.icon && !a.label;
  });
  protected readonly iconClass = computed(() => {
    const icon = this.addon().icon;
    return icon ? `pi pi-${icon}` : '';
  });
}
