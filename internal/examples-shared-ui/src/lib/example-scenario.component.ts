import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  linkedSignal,
  PLATFORM_ID,
  signal,
  viewChild,
} from '@angular/core';
import { DOCUMENT, isPlatformBrowser, JsonPipe } from '@angular/common';
import { Clipboard } from '@angular/cdk/clipboard';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import {
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  filter,
  from,
  fromEvent,
  map,
  Observable,
  of,
  startWith,
  switchMap,
} from 'rxjs';
import { DynamicForm } from '@ng-forge/dynamic-forms';
import { ExampleScenario } from './types';
import { injectQueryParams } from 'ngxtension/inject-query-params';

/**
 * Generic component for rendering a single example scenario.
 * Uses Forge design language with dark/light theme support.
 *
 * Reads scenario data from route data or accepts it as an input.
 * Automatically hides "Form Data" output when embedded in an iframe.
 * Supports `?minimal=true` query parameter to hide form output.
 * Supports theme syncing with parent docs app via postMessage.
 */
@Component({
  selector: 'example-scenario',
  imports: [DynamicForm, JsonPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './example-scenario.component.html',
  styleUrl: './example-scenario.component.scss',
  host: {
    class: 'example-container',
    '[class.in-iframe]': 'isInIframe',
    '[style.height]': 'lockedHeight()',
    '[attr.data-theme]': 'currentTheme()',
  },
})
export class ExampleScenarioComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly document = inject(DOCUMENT);
  private readonly clipboard = inject(Clipboard);
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  /** Scenario passed directly as input (for embedding in other components) */
  // eslint-disable-next-line @angular-eslint/no-input-rename
  scenarioInput = input<ExampleScenario | undefined>(undefined, { alias: 'scenario' });

  /** Scenario loaded from route data */
  private readonly routeScenario = toSignal(this.route.data.pipe(map((data) => data['scenario'] as ExampleScenario | undefined)));

  /** Full minimal mode - hide all chrome, show only form (used by landing page) */
  private readonly minimalParam = injectQueryParams('minimal');
  minimal = computed(() => this.minimalParam() === 'true');

  /** Whether embedded in an iframe (auto-detected) */
  readonly isInIframe = this.checkIfInIframe();

  /** Whether to hide the form data output */
  hideFormOutput = computed(() => this.minimal() || this.isInIframe);

  private checkIfInIframe(): boolean {
    if (!this.isBrowser) return false;
    try {
      const win = this.document.defaultView;
      return win ? win.self !== win.top : false;
    } catch {
      // Cross-origin iframes throw security errors when accessing window.top
      return true;
    }
  }

  /** Active tab */
  activeTab = signal<'demo' | 'code'>('demo');

  /** Current resolved theme for host binding - derived from theme source */
  private readonly themeSource = signal<string | null | undefined>('auto');
  currentTheme = computed(() => this.resolveTheme(this.themeSource()));

  /** Copy feedback state */
  copied = signal(false);

  private readonly formContainer = viewChild<ElementRef<HTMLElement>>('formContainer');

  /** Lock the component height when on config tab (in iframe mode) */
  private componentHeight = signal<number | null>(null);

  lockedHeight = computed(() => {
    // Only lock height when in iframe and on config tab
    if (!this.isInIframe || this.activeTab() === 'demo') return null;
    const height = this.componentHeight();
    return height ? `${height}px` : null;
  });

  /** Resolved scenario - prefers input over route data */
  scenario = computed(() => {
    const fromInput = this.scenarioInput();
    const fromRoute = this.routeScenario();
    const resolved = fromInput ?? fromRoute;

    if (!resolved) {
      throw new Error('ExampleScenarioComponent requires a scenario via input or route data');
    }

    return resolved;
  });

  /** JSON representation of the config for display */
  configJson = computed(() => JSON.stringify(this.scenario().config, null, 2));

  /** Syntax-highlighted config HTML using Shiki */
  highlightedConfig = toSignal(this.createHighlightedConfig$(), {
    initialValue: this.sanitizer.bypassSecurityTrustHtml(''),
  });

  formValue = linkedSignal<Record<string, unknown>>(() => this.scenario().initialValue ?? {});

  constructor() {
    this.setupHeightObserver();
    this.setupThemeListener();
    this.setupIframeHeightReporter();
  }

  /** Observe component height when form is visible (for locking height on config tab) */
  private setupHeightObserver(): void {
    effect((onCleanup) => {
      const container = this.formContainer();
      if (!container || !this.isInIframe) return;

      const hostElement = this.elementRef.nativeElement;

      const updateHeight = () => {
        const height = hostElement.offsetHeight;
        if (height > 0) {
          this.componentHeight.set(height);
        }
      };

      // Initial measurement after a frame to ensure form is rendered
      requestAnimationFrame(updateHeight);

      const resizeObserver = new ResizeObserver(updateHeight);
      resizeObserver.observe(hostElement);

      onCleanup(() => resizeObserver.disconnect());
    });
  }

  /** Setup theme listener - listen to parent postMessage or use query param fallback */
  private setupThemeListener(): void {
    if (this.isInIframe && this.isBrowser) {
      // Apply system preference immediately as default
      this.themeSource.set('auto');

      // Listen for theme changes from parent
      fromEvent<MessageEvent>(window, 'message')
        .pipe(
          filter((event) => event.data?.type === 'theme-change'),
          map((event) => event.data.theme),
          takeUntilDestroyed(),
        )
        .subscribe((theme) => this.themeSource.set(theme));

      // Request theme from parent (with retry for timing)
      window.parent.postMessage({ type: 'request-theme' }, '*');
      setTimeout(() => window.parent.postMessage({ type: 'request-theme' }, '*'), 100);
    } else if (this.isBrowser) {
      // Not in iframe - use query param or system preference
      this.route.queryParams
        .pipe(
          map((params) => params['theme'] ?? 'auto'),
          takeUntilDestroyed(),
        )
        .subscribe((theme) => this.themeSource.set(theme));
    }

    // Apply theme to document (for global styles that need it)
    effect(() => {
      if (!this.isBrowser) return;
      const theme = this.currentTheme();
      this.document.documentElement.setAttribute('data-theme', theme);
      // Set body background to match theme
      const bgColor = theme === 'dark' ? '#0a0908' : '#ffffff';
      this.document.body.style.backgroundColor = bgColor;
    });
  }

  /** Resolve theme from source to light/dark */
  private resolveTheme(theme: string | null | undefined): 'light' | 'dark' {
    if (!this.isBrowser) return 'light';
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (theme === 'auto' || theme === undefined) {
      return prefersDark ? 'dark' : 'light';
    } else if (theme === 'dark') {
      return 'dark';
    }
    return 'light';
  }

  /** Send height to parent for iframe auto-sizing */
  private setupIframeHeightReporter(): void {
    if (!this.isInIframe || !this.isBrowser) return;

    this.createHeightObserver$()
      .pipe(
        filter(() => this.activeTab() === 'demo'),
        takeUntilDestroyed(),
      )
      .subscribe((height) => {
        // Include the route path for deterministic iframe matching
        // Add 4px buffer to prevent potential scrollbar/content cutoff
        const routePath = window.location.hash.replace(/^#/, '').split('?')[0];
        window.parent.postMessage({ type: 'iframe-height', height: height + 4, route: routePath }, '*');
      });
  }

  /** Creates an observable that emits component height on changes */
  private createHeightObserver$(): Observable<number> {
    const element = this.elementRef.nativeElement;
    return new Observable<number>((observer) => {
      const getHeight = () => element.offsetHeight;

      // Emit initial height
      observer.next(getHeight());

      // Observe resize changes on the component itself
      const resizeObserver = new ResizeObserver(() => observer.next(getHeight()));
      resizeObserver.observe(element);

      return () => resizeObserver.disconnect();
    }).pipe(
      debounceTime(50),
      // Only emit when height changes by more than 10px to prevent feedback loops
      distinctUntilChanged((prev, curr) => Math.abs(prev - curr) < 10),
    );
  }

  /** Creates an observable for syntax-highlighted config */
  private createHighlightedConfig$(): Observable<SafeHtml> {
    if (!this.isBrowser) {
      return of(this.sanitizer.bypassSecurityTrustHtml(''));
    }

    // React to config and theme changes
    const config$ = toObservable(this.configJson);
    const theme$ = toObservable(this.currentTheme);

    return combineLatest([config$, theme$]).pipe(
      switchMap(([code, theme]) => {
        if (!code) return of('');
        // Dynamically import shiki to avoid SSR issues
        // Use theme-appropriate syntax highlighting
        const shikiTheme = theme === 'dark' ? 'material-theme-darker' : 'material-theme-lighter';
        return from(
          import('shiki').then(({ codeToHtml }) =>
            codeToHtml(code, {
              lang: 'json',
              theme: shikiTheme,
            }),
          ),
        );
      }),
      map((html) => this.sanitizer.bypassSecurityTrustHtml(html)),
      startWith(this.sanitizer.bypassSecurityTrustHtml('')),
    );
  }

  copyConfig(): void {
    this.clipboard.copy(this.configJson());
    this.copied.set(true);
    setTimeout(() => this.copied.set(false), 2000);
  }

  openFullscreen(): void {
    const url = `${window.location.origin}${window.location.pathname}?minimal=true`;
    window.open(url, '_blank');
  }
}
