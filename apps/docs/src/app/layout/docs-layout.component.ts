import { afterNextRender, ChangeDetectionStrategy, Component, computed, inject, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { fromEvent, map } from 'rxjs';
import { SandboxHarness } from '@ng-forge/sandbox-harness';
import { ActiveAdapterService } from '../services/active-adapter.service';
import { ThemeService } from '../services/theme.service';
import { Logo } from '../components/logo/logo.component';
import { AdapterSubBarComponent } from '../components/adapter-sub-bar/adapter-sub-bar.component';
import { SearchComponent } from '../components/search/search.component';
import { NAV_ITEMS, type NavItem } from './nav.config';
@Component({
  selector: 'app-docs-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Logo, AdapterSubBarComponent, SearchComponent],
  templateUrl: './docs-layout.component.html',
  styleUrl: './docs-layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.sidebar-open]': 'sidebarOpen()',
  },
})
export class DocsLayoutComponent {
  private readonly router = inject(Router);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly harness = inject(SandboxHarness);
  protected readonly activeAdapter = inject(ActiveAdapterService);
  readonly themeService = inject(ThemeService);
  protected readonly sidebarOpen = signal(false);

  constructor() {
    // After hydration, preload the current adapter's JS on idle so live examples
    // are instant when the user scrolls to them.
    if (this.isBrowser) {
      afterNextRender(() => {
        requestIdleCallback(() => this.harness.preload(this.activeAdapter.adapter()));
      });
    }
  }
  protected readonly expandedCategories = signal<Set<string>>(new Set());
  /** Categories explicitly collapsed by the user — overrides URL-based auto-expand. */
  private readonly collapsedCategories = signal<Set<string>>(new Set());
  protected readonly scrolled = this.isBrowser
    ? toSignal(fromEvent(window, 'scroll').pipe(map(() => window.scrollY > 0)), { initialValue: false })
    : signal(false);

  private readonly currentUrl = computed(() => {
    const nav = this.router.lastSuccessfulNavigation();
    return nav ? this.router.serializeUrl(nav.finalUrl ?? nav.extractedUrl) : this.router.url;
  });

  protected readonly navItems = computed(() => {
    const adapter = this.activeAdapter.adapter();
    const isCustom = adapter === 'custom';
    return NAV_ITEMS.filter((item) => {
      if (item.cssClass === 'sidebar-link--custom-only') return isCustom;
      if (item.cssClass === 'sidebar-link--not-custom') return !isCustom;
      return true;
    });
  });

  protected toggleSidebar(): void {
    this.sidebarOpen.update((v) => !v);
  }

  protected closeSidebar(): void {
    this.sidebarOpen.set(false);
  }

  protected expandCategory(path: string): void {
    this.expandedCategories.update((set) => new Set(set).add(path));
    this.collapsedCategories.update((set) => {
      const next = new Set(set);
      next.delete(path);
      return next;
    });
  }

  protected toggleCategory(path: string): void {
    const wasExpanded = this.isCategoryExpanded({ path, children: [{}] } as NavItem);
    if (wasExpanded) {
      // Collapse this one
      this.expandedCategories.update((set) => {
        const next = new Set(set);
        next.delete(path);
        return next;
      });
      this.collapsedCategories.update((set) => new Set(set).add(path));
    } else {
      // Expand this one — collapse siblings at the same level, keep parents open
      const isTopLevel = this.navItems().some((item) => item.path === path);
      if (isTopLevel) {
        // Top-level: collapse other top-level categories
        const siblingPaths = this.navItems()
          .filter((item) => item.children && item.path !== path)
          .map((item) => item.path);
        this.expandedCategories.set(new Set([path]));
        this.collapsedCategories.set(new Set(siblingPaths));
      } else {
        // Subcategory: just add to expanded set, don't touch parents
        this.expandedCategories.update((set) => new Set(set).add(path));
        this.collapsedCategories.update((set) => {
          const next = new Set(set);
          next.delete(path);
          return next;
        });
      }
    }
  }

  /** Pre-computed expanded state per category path — avoids method calls on every CD cycle. */
  private readonly expandedState = computed(() => {
    const collapsed = this.collapsedCategories();
    const expanded = this.expandedCategories();
    const adapter = this.activeAdapter.adapter();
    const url = this.currentUrl();
    const result = new Map<string, boolean>();
    const walk = (items: NavItem[]): void => {
      for (const item of items) {
        if (!item.children) continue;
        if (collapsed.has(item.path)) {
          result.set(item.path, false);
        } else if (expanded.has(item.path)) {
          result.set(item.path, true);
        } else {
          result.set(item.path, url.startsWith(`/${adapter}/${item.path}`));
        }
        walk(item.children);
      }
    };
    walk(this.navItems());
    return result;
  });

  /** Pre-computed active category state per path. */
  private readonly activeCategoryState = computed(() => {
    const adapter = this.activeAdapter.adapter();
    const url = this.currentUrl();
    const result = new Map<string, boolean>();
    const walk = (items: NavItem[]): void => {
      for (const item of items) {
        if (!item.children) continue;
        result.set(item.path, url.startsWith(`/${adapter}/${item.path}`));
        walk(item.children);
      }
    };
    walk(this.navItems());
    return result;
  });

  protected isCategoryExpanded(item: NavItem): boolean {
    return this.expandedState().get(item.path) ?? false;
  }

  /** True when the current URL is within this category (regardless of expand state). */
  protected isActiveCategory(item: NavItem): boolean {
    return this.activeCategoryState().get(item.path) ?? false;
  }

  protected adapterLink(path: string): string {
    return `/${this.activeAdapter.adapter()}/${path}`;
  }
}
