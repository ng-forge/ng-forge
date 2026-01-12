import { isPlatformBrowser } from '@angular/common';
import { afterNextRender, ChangeDetectionStrategy, Component, computed, DestroyRef, inject, PLATFORM_ID, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { delay, filter, iif, map, merge, of, switchMap, tap } from 'rxjs';

import { ExampleIframeComponent } from '../../components/example-iframe/example-iframe.component';
import { CodeHighlightDirective } from '../../directives/code-highlight.directive';

import {
  CODE_SNIPPETS,
  FEATURES,
  FIELD_TYPES,
  INTEGRATIONS,
  INTERSECTION_CONFIG,
  PACKAGE_MANAGERS,
  SECTION_IDS,
  UI_LIBRARIES,
  type FireflyPosition,
  type Spark,
} from './landing.constants';

import {
  copyToClipboard,
  createFireflyAnimation,
  fromIntersectionObserver,
  mousePosition$,
  navScrolled$,
  scrollSnap$,
  scrollToHash,
} from './landing.utils';

const EMPTY_FIREFLY_STATE = { positions: [] as FireflyPosition[], sparks: [] as Spark[] };

@Component({
  selector: 'app-landing',
  imports: [RouterLink, ExampleIframeComponent, CodeHighlightDirective],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  // ============================================
  // EXPOSED CONSTANTS
  // ============================================

  readonly features = FEATURES;
  readonly fieldTypes = FIELD_TYPES;
  readonly integrations = INTEGRATIONS;
  readonly packageManagers = PACKAGE_MANAGERS;
  readonly uiLibraries = UI_LIBRARIES;
  readonly codeSnippets = CODE_SNIPPETS;

  // ============================================
  // UI STATE SIGNALS
  // ============================================

  readonly currentPackageManager = signal('npm');
  readonly currentUiLibrary = signal('material');
  readonly heroTab = signal<'config' | 'demo'>('demo');
  readonly copied = signal(false);
  private readonly visibleElements = signal<Set<string>>(new Set());

  // ============================================
  // REACTIVE STATE (RxJS -> Signal)
  // ============================================

  readonly navScrolled = toSignal(
    iif(() => this.isBrowser, navScrolled$(), of(false)),
    { requireSync: true },
  );

  private readonly fireflyState = toSignal(
    iif(
      () => this.isBrowser,
      of(null).pipe(
        delay(0),
        switchMap(() => createFireflyAnimation(mousePosition$())),
      ),
      of(EMPTY_FIREFLY_STATE),
    ),
    { initialValue: EMPTY_FIREFLY_STATE },
  );

  readonly fireflyPositions = computed(() => this.fireflyState().positions);
  readonly sparks = computed(() => this.fireflyState().sparks);

  readonly installCommand = computed(() => {
    const pkg = this.packageManagers.find((p) => p.id === this.currentPackageManager());
    const ui = this.uiLibraries.find((u) => u.id === this.currentUiLibrary());
    return `${pkg?.command ?? 'npm install'} @ng-forge/dynamic-forms ${ui?.package ?? '@ng-forge/material'}`;
  });

  constructor() {
    // afterNextRender only runs in browser, no platform check needed
    afterNextRender(() => {
      this.initializeBrowserFeatures();
    });
  }

  // ============================================
  // INITIALIZATION (browser-only via afterNextRender)
  // ============================================

  private initializeBrowserFeatures(): void {
    // Merge all browser-only subscriptions into one
    // Note: scrollSnapEffect$ disabled for now - uncomment to re-enable
    merge(/* this.scrollSnapEffect$(), */ this.intersectionObserverEffect$()).pipe(takeUntilDestroyed(this.destroyRef)).subscribe();

    scrollToHash(SECTION_IDS);
  }

  private scrollSnapEffect$() {
    return scrollSnap$();
  }

  private intersectionObserverEffect$() {
    return of(null).pipe(
      delay(INTERSECTION_CONFIG.initDelayMs),
      map(() => this.collectAnimatedElements()),
      filter((elements) => elements.length > 0),
      switchMap((elements) => fromIntersectionObserver(elements, { threshold: INTERSECTION_CONFIG.threshold })),
      tap((entries) => this.handleIntersectionEntries(entries)),
    );
  }

  private collectAnimatedElements(): Element[] {
    const elements = document.querySelectorAll('.fade-up');
    const result: Element[] = [];

    elements.forEach((el, index) => {
      const id =
        el.getAttribute('data-animate-id') ??
        el.className.split(' ').find((c) => c.includes('header') || c.includes('demo') || c.includes('grid') || c.includes('cta')) ??
        `element-${index}`;
      el.setAttribute('data-animate-id', id);
      result.push(el);
    });

    return result;
  }

  private handleIntersectionEntries(entries: { target: Element; isIntersecting: boolean }[]): void {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('data-animate-id');
        if (id) {
          this.visibleElements.update((set) => new Set(set).add(id));
        }
      }
    });
  }

  // ============================================
  // TEMPLATE METHODS
  // ============================================

  isVisible(id: string): boolean {
    return this.visibleElements().has(id);
  }

  setPackageManager(id: string): void {
    this.currentPackageManager.set(id);
  }

  setUiLibrary(id: string): void {
    this.currentUiLibrary.set(id);
  }

  setHeroTab(tab: 'config' | 'demo'): void {
    this.heroTab.set(tab);
  }

  copyInstallCommand(): void {
    // User actions only happen in browser, no check needed
    copyToClipboard(this.installCommand()).then(() => {
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    });
  }
}
