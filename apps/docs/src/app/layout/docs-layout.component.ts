import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ActiveAdapterService } from '../services/active-adapter.service';
import { Logo } from '../components/logo/logo.component';
import { AdapterSubBarComponent } from '../components/adapter-sub-bar/adapter-sub-bar.component';
import { NAV_ITEMS, type NavItem } from './nav.config';

@Component({
  selector: 'app-docs-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Logo, AdapterSubBarComponent],
  templateUrl: './docs-layout.component.html',
  styleUrl: './docs-layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.sidebar-open]': 'sidebarOpen()',
  },
})
export class DocsLayoutComponent {
  private readonly router = inject(Router);
  protected readonly activeAdapter = inject(ActiveAdapterService);
  protected readonly sidebarOpen = signal(false);
  protected readonly expandedCategories = signal<Set<string>>(new Set());

  protected readonly navItems = computed(() => {
    const adapter = this.activeAdapter.adapter();
    return NAV_ITEMS.filter((item) => {
      if (item.cssClass === 'sidebar-link--custom-only') {
        return adapter === 'custom';
      }
      return true;
    });
  });

  protected toggleSidebar(): void {
    this.sidebarOpen.update((v) => !v);
  }

  protected closeSidebar(): void {
    this.sidebarOpen.set(false);
  }

  protected toggleCategory(path: string): void {
    this.expandedCategories.update((set) => {
      const next = new Set(set);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  }

  protected isCategoryExpanded(item: NavItem): boolean {
    if (!item.children) return false;
    // Expand if explicitly toggled or if current URL is within this category
    if (this.expandedCategories().has(item.path)) return true;
    const adapter = this.activeAdapter.adapter();
    const url = this.router.url;
    return url.startsWith(`/${adapter}/${item.path}`);
  }

  protected adapterLink(path: string): string {
    return `/${this.activeAdapter.adapter()}/${path}`;
  }
}
