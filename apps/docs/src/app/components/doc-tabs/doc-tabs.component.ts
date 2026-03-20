import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ActiveAdapterService } from '../../services/active-adapter.service';
import { TabGroup } from '../../layout/tabs.config';

@Component({
  selector: 'docs-doc-tabs',
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="doc-tabs" role="tablist" aria-label="Page sections">
      @for (tab of tabGroup().tabs; track tab.slug) {
        <a
          class="doc-tab"
          role="tab"
          [routerLink]="'/' + adapter() + '/' + tab.slug"
          routerLinkActive="doc-tab--active"
          [routerLinkActiveOptions]="{ exact: true }"
          [attr.aria-selected]="rla.isActive"
          #rla="routerLinkActive"
        >
          {{ tab.label }}
        </a>
      }
      <div class="doc-tabs__track"></div>
    </nav>
  `,
  styles: `
    @use 'tokens' as *;

    .doc-tabs {
      display: flex;
      gap: $space-1;
      border-bottom: 1px solid var(--forge-border-color);
      margin-bottom: $space-6;
      position: relative;
    }

    .doc-tab {
      padding: $space-2 $space-4;
      font-size: $text-sm;
      font-family: $font-primary;
      font-weight: 500;
      color: var(--forge-text-muted);
      text-decoration: none;
      border-bottom: 2px solid transparent;
      transition:
        color $transition-fast,
        border-color $transition-fast;
      cursor: pointer;
      margin-bottom: -1px;

      &:hover {
        color: var(--forge-text);
      }

      &--active {
        color: $ember-glow;
        border-bottom-color: $ember-glow;
      }
    }

    .doc-tabs__track {
      display: none;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocTabsComponent {
  readonly tabGroup = input.required<TabGroup>();

  private readonly adapterService = inject(ActiveAdapterService);
  readonly adapter = computed(() => this.adapterService.adapter());
}
