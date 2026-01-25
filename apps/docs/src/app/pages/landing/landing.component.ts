import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { afterNextRender, ChangeDetectionStrategy, Component, computed, DestroyRef, inject, PLATFORM_ID, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { NgDocSearchComponent } from '@ng-doc/app';
import { catchError, delay, filter, iif, map, merge, of, switchMap, tap } from 'rxjs';
import { DynamicForm } from '@ng-forge/dynamic-forms';

import { Logo } from '../../components/logo';
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
  scrollProgress$,
  scrollSnap$,
  scrollToHash,
} from './landing.utils';

import { heroFormConfig, validationFormConfig } from './landing.forms';

const EMPTY_FIREFLY_STATE = { positions: [] as FireflyPosition[], sparks: [] as Spark[] };

// Animation timing constants
const COPY_FEEDBACK_DURATION_MS = 2000;
const CONFETTI_ANIMATION_DURATION_MS = 800;

@Component({
  selector: 'app-landing',
  imports: [RouterLink, CodeHighlightDirective, NgDocSearchComponent, Logo, DynamicForm],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly http = inject(HttpClient);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  // ============================================
  // FORM CONFIGS (for landing page demos)
  // ============================================

  readonly heroFormConfig = heroFormConfig;
  readonly validationFormConfig = validationFormConfig;

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
  readonly copyConfetti = signal<{ id: number; x: number; y: number; angle: number }[]>([]);
  private readonly visibleElements = signal<Set<string>>(new Set());
  private confettiIdCounter = 0;

  // ============================================
  // STATS (fetched dynamically)
  // ============================================

  readonly npmDownloads = toSignal(
    iif(
      () => this.isBrowser,
      of(null).pipe(
        delay(500), // Delay to not block initial render
        switchMap(() => this.http.get<{ downloads?: number }>('https://api.npmjs.org/downloads/point/last-month/@ng-forge/dynamic-forms')),
        map((data) => this.formatNumber(data?.downloads ?? 0)),
        catchError(() => of('—')),
      ),
      of('—'),
    ),
    { initialValue: '—' },
  );

  readonly githubStars = toSignal(
    iif(
      () => this.isBrowser,
      of(null).pipe(
        delay(600), // Slight stagger from npm fetch
        switchMap(() => this.http.get<{ stargazers_count?: number }>('https://api.github.com/repos/ng-forge/ng-forge')),
        map((data) => this.formatNumber(data?.stargazers_count ?? 0)),
        catchError(() => of('—')),
      ),
      of('—'),
    ),
    { initialValue: '—' },
  );

  readonly uiLibraryCount = '4'; // Static: Material, Bootstrap, PrimeNG, Ionic

  // ============================================
  // REACTIVE STATE (RxJS -> Signal)
  // ============================================

  readonly navScrolled = toSignal(
    iif(() => this.isBrowser, navScrolled$(), of(false)),
    { requireSync: true },
  );

  readonly scrollProgress = toSignal(
    iif(() => this.isBrowser, scrollProgress$(), of(0)),
    { requireSync: true },
  );

  private readonly fireflyState = toSignal(
    iif(
      () => this.isBrowser,
      of(null).pipe(
        delay(1200), // Delay fireflies for better LCP - starts after hero animation
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
    copyToClipboard(this.installCommand())
      .then(() => {
        this.copied.set(true);
        this.spawnCopyConfetti();
        setTimeout(() => this.copied.set(false), COPY_FEEDBACK_DURATION_MS);
      })
      .catch(() => {
        // Clipboard API may fail in some contexts (e.g., insecure origins)
        console.warn('Failed to copy to clipboard');
      });
  }

  private spawnCopyConfetti(): void {
    const particleCount = 12;
    const newParticles = Array.from({ length: particleCount }, (_, i) => ({
      id: this.confettiIdCounter++,
      x: (Math.random() - 0.5) * 60, // Spread horizontally
      y: (Math.random() - 0.5) * 40, // Spread vertically
      angle: (i / particleCount) * 360 + Math.random() * 30, // Distribute angles
    }));

    this.copyConfetti.set(newParticles);

    // Clear confetti after animation completes
    setTimeout(() => this.copyConfetti.set([]), CONFETTI_ANIMATION_DURATION_MS);
  }

  private formatNumber(num: number): string {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
    return num.toString();
  }

  onCardMouseMove(event: MouseEvent): void {
    const card = event.currentTarget as HTMLElement;
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);
  }

  onCardMouseLeave(event: MouseEvent): void {
    const card = event.currentTarget as HTMLElement;
    card.style.removeProperty('--mouse-x');
    card.style.removeProperty('--mouse-y');
  }
}
