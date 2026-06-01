import { isPlatformBrowser } from '@angular/common';
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  PLATFORM_ID,
  signal,
  viewChild,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';

import { defer, of } from 'rxjs';

import { SandboxHarness, SandboxMountDirective } from '@ng-forge/sandbox-harness';

import { FormConfig } from '@ng-forge/dynamic-forms';
import { Logo } from '../../components/logo';
import { CodeHighlightDirective } from '../../directives/code-highlight.directive';
import { SearchComponent } from '../../components/search/search.component';
import { openInStackBlitz } from '../../components/live-example/stackblitz-project';
import { CAPABILITIES, CODE_SNIPPETS, HERO_ROLES, INTEGRATIONS, PACKAGE_MANAGERS, SECTION_IDS, UI_LIBRARIES } from './landing.constants';
import { copyToClipboard, navScrolled$, scrollToHash } from './landing.utils';
import { heroFormConfig, validationFormConfig } from './landing.forms';
import { initEmberCanvas } from './ember-canvas';

const COPY_FEEDBACK_DURATION_MS = 2000;
const CONFETTI_ANIMATION_DURATION_MS = 800;
const ROLE_CYCLE_MS = 2200;

@Component({
  selector: 'app-landing',
  imports: [RouterLink, CodeHighlightDirective, Logo, SandboxMountDirective, SearchComponent],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.browser]': 'isBrowser',
  },
})
export class LandingComponent {
  private readonly destroyRef = inject(DestroyRef);
  protected readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly harness = inject(SandboxHarness);

  private copyFeedbackTimer: ReturnType<typeof setTimeout> | null = null;
  private confettiTimer: ReturnType<typeof setTimeout> | null = null;
  private roleTimer: ReturnType<typeof setInterval> | null = null;

  // ============================================
  // LIVE FORM DEMOS (sandbox)
  // ============================================

  readonly heroFormConfig = heroFormConfig;
  readonly validationFormConfig = validationFormConfig;

  private readonly heroMount = viewChild<SandboxMountDirective>('heroMount');
  private readonly validationMount = viewChild<SandboxMountDirective>('validationMount');
  private readonly emberCanvas = viewChild<ElementRef<HTMLCanvasElement>>('emberCanvas');

  readonly heroLoaded = computed(() => this.mountLoaded(this.heroMount()));
  readonly validationLoaded = computed(() => this.mountLoaded(this.validationMount()));

  private mountLoaded(mount: SandboxMountDirective | undefined): boolean {
    if (!mount) return false;
    try {
      const status = mount.mount.status();
      return status === 'resolved' || status === 'local';
    } catch {
      return false;
    }
  }

  // ============================================
  // EXPOSED CONSTANTS
  // ============================================

  readonly capabilities = CAPABILITIES;
  readonly integrations = INTEGRATIONS;
  readonly packageManagers = PACKAGE_MANAGERS;
  readonly uiLibraries = UI_LIBRARIES;
  readonly codeSnippets = CODE_SNIPPETS;

  // ============================================
  // UI STATE
  // ============================================

  readonly currentPackageManager = signal('npm');
  readonly currentUiLibrary = signal('material');
  readonly demoTab = signal<'config' | 'demo'>('demo');
  readonly copied = signal(false);
  readonly copyConfetti = signal<{ id: number; x: number; y: number; angle: number }[]>([]);
  private confettiIdCounter = 0;

  // Cycling hero role word ("A {type-safe} forms engine for Angular.")
  readonly roleIndex = signal(0);
  readonly heroRole = computed(() => HERO_ROLES[this.roleIndex() % HERO_ROLES.length]);

  readonly navScrolled = toSignal(this.isBrowser ? defer(() => navScrolled$()) : of(false), { requireSync: true });

  readonly installCommand = computed(() => {
    const pkg = this.packageManagers.find((p) => p.id === this.currentPackageManager());
    const ui = this.uiLibraries.find((u) => u.id === this.currentUiLibrary());
    return `${pkg?.command ?? 'npm install'} @ng-forge/dynamic-forms ${ui?.package ?? '@ng-forge/material'}`;
  });

  constructor() {
    afterNextRender(() => {
      const canvas = this.emberCanvas()?.nativeElement;
      if (canvas) {
        const stop = initEmberCanvas(canvas);
        this.destroyRef.onDestroy(stop);
      }

      // Cycle the hero role word unless the user prefers reduced motion.
      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        this.roleTimer = setInterval(() => this.roleIndex.update((i) => (i + 1) % HERO_ROLES.length), ROLE_CYCLE_MS);
      }

      // Preload the Material adapter on idle so the live demos bootstrap faster.
      if (typeof requestIdleCallback === 'function') {
        const idleHandle = requestIdleCallback(() => this.harness.preload('material'));
        this.destroyRef.onDestroy(() => cancelIdleCallback(idleHandle));
      } else {
        const timeoutHandle = setTimeout(() => this.harness.preload('material'), 0);
        this.destroyRef.onDestroy(() => clearTimeout(timeoutHandle));
      }

      // Landing is always dark; expose the theme to sandbox sub-apps.
      const docEl = document.documentElement;
      const previousTheme = docEl.getAttribute('data-theme');
      docEl.setAttribute('data-theme', 'dark');
      this.destroyRef.onDestroy(() => {
        if (previousTheme) docEl.setAttribute('data-theme', previousTheme);
        else docEl.removeAttribute('data-theme');
      });

      scrollToHash(SECTION_IDS);
    });

    this.destroyRef.onDestroy(() => {
      if (this.copyFeedbackTimer) clearTimeout(this.copyFeedbackTimer);
      if (this.confettiTimer) clearTimeout(this.confettiTimer);
      if (this.roleTimer) clearInterval(this.roleTimer);
    });
  }

  // ============================================
  // TEMPLATE METHODS
  // ============================================

  setPackageManager(id: string): void {
    this.currentPackageManager.set(id);
  }

  setUiLibrary(id: string): void {
    this.currentUiLibrary.set(id);
  }

  setDemoTab(tab: 'config' | 'demo'): void {
    this.demoTab.set(tab);
  }

  copyInstallCommand(): void {
    copyToClipboard(this.installCommand())
      .then(() => {
        this.copied.set(true);
        this.spawnCopyConfetti();
        if (this.copyFeedbackTimer) clearTimeout(this.copyFeedbackTimer);
        this.copyFeedbackTimer = setTimeout(() => this.copied.set(false), COPY_FEEDBACK_DURATION_MS);
      })
      .catch(() => {
        // Clipboard API can fail on insecure origins; ignore.
      });
  }

  private spawnCopyConfetti(): void {
    const particleCount = 12;
    this.copyConfetti.set(
      Array.from({ length: particleCount }, (_, i) => ({
        id: this.confettiIdCounter++,
        x: (Math.random() - 0.5) * 60,
        y: (Math.random() - 0.5) * 40,
        angle: (i / particleCount) * 360 + Math.random() * 30,
      })),
    );
    if (this.confettiTimer) clearTimeout(this.confettiTimer);
    this.confettiTimer = setTimeout(() => this.copyConfetti.set([]), CONFETTI_ANIMATION_DURATION_MS);
  }

  /** Landing always showcases the Material adapter. */
  openOnStackBlitz(config: FormConfig, title: string): void {
    if (!this.isBrowser) return;
    openInStackBlitz('material', config, title);
  }
}
