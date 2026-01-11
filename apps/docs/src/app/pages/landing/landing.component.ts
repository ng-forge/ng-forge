import { afterNextRender, ChangeDetectionStrategy, Component, computed, DestroyRef, inject, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

interface Feature {
  icon: string;
  title: string;
  description: string;
}

interface FieldType {
  code: string;
  label: string;
}

interface Integration {
  name: string;
  route: string;
  viewBox: string;
  width: number;
  height: number;
  svgContent: SafeHtml;
}

interface PackageManager {
  id: string;
  label: string;
  command: string;
}

interface UiLibrary {
  id: string;
  label: string;
  package: string;
}

@Component({
  selector: 'app-landing',
  imports: [RouterLink],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingComponent {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  readonly navScrolled = signal(false);
  readonly copied = signal(false);
  readonly visibleElements = signal<Set<string>>(new Set());

  readonly currentPackageManager = signal('npm');
  readonly currentUiLibrary = signal('material');

  readonly fireflies = Array(10).fill(null);

  readonly features: Feature[] = [
    {
      icon: '⚡',
      title: 'Signal Forms Native',
      description: "Built directly on Angular Signal Forms. Not a wrapper — real integration with Angular's reactive future.",
    },
    {
      icon: '🎯',
      title: 'Actually Type-Safe',
      description: '<code>as const satisfies</code> — your IDE knows everything. No more guessing.',
    },
    {
      icon: '🔥',
      title: 'Any UI Library',
      description: 'One import swap. Same logic everywhere.',
    },
    {
      icon: '📦',
      title: 'Ship Less',
      description: 'Tree-shakeable. Lazy-loaded. Bundle only what you use.',
    },
    {
      icon: '🚀',
      title: 'Zoneless Ready',
      description: 'No Zone.js required. OnPush everywhere. Built for where Angular is going.',
    },
    {
      icon: '🔌',
      title: 'Escape Hatches',
      description: 'Need custom controls? Same patterns as built-ins. Full power when you need it.',
    },
  ];

  readonly fieldTypes: FieldType[] = [
    { code: 'input', label: 'Text, email, password, number' },
    { code: 'textarea', label: 'Multi-line text' },
    { code: 'select', label: 'Dropdown selection' },
    { code: 'radio', label: 'Single choice' },
    { code: 'checkbox', label: 'Boolean toggle' },
    { code: 'multi-checkbox', label: 'Multiple selections' },
    { code: 'toggle', label: 'Switch control' },
    { code: 'slider', label: 'Range input' },
    { code: 'datepicker', label: 'Date selection' },
    { code: 'submit', label: 'Form submission' },
    { code: 'row', label: 'Horizontal layout' },
    { code: 'group', label: 'Nested objects' },
    { code: 'page', label: 'Multi-step wizards' },
    { code: 'array', label: 'Repeatable fields' },
    { code: 'text', label: 'Static content' },
  ];

  readonly integrations: Integration[] = [
    {
      name: 'Material',
      route: '/dynamic-forms/ui-libs-integrations/material',
      viewBox: '0 0 24 24',
      width: 48,
      height: 48,
      svgContent: this.sanitizer.bypassSecurityTrustHtml(`
        <path fill="#FF4081" d="M12 2.25L2.25 6v6c0 5.55 4.16 10.74 9.75 12 5.59-1.26 9.75-6.45 9.75-12V6L12 2.25zm0 2.1l7.5 2.9v5c0 4.36-3.27 8.42-7.5 9.5-4.23-1.08-7.5-5.14-7.5-9.5v-5l7.5-2.9z"/>
        <path fill="#FF4081" d="M12 6.5l-5 2v4c0 2.89 2.11 5.58 5 6.5 2.89-.92 5-3.61 5-6.5v-4l-5-2z"/>
      `),
    },
    {
      name: 'PrimeNG',
      route: '/dynamic-forms/ui-libs-integrations/primeng',
      viewBox: '0 0 64 64',
      width: 48,
      height: 48,
      svgContent: this.sanitizer.bypassSecurityTrustHtml(`
        <path fill="#DD0031" d="M32 0L0 16v32l32 16 32-16V16L32 0z"/>
        <path fill="#C3002F" d="M32 0v64l32-16V16L32 0z"/>
        <path fill="#FFF" d="M32 8L8 20v24l24 12 24-12V20L32 8z"/>
        <path fill="#DD0031" d="M32 16l-16 8v16l16 8 16-8V24l-16-8z"/>
      `),
    },
    {
      name: 'Ionic',
      route: '/dynamic-forms/ui-libs-integrations/ionic',
      viewBox: '0 0 512 512',
      width: 48,
      height: 48,
      svgContent: this.sanitizer.bypassSecurityTrustHtml(`
        <path fill="#3880FF" d="M256 48C141.1 48 48 141.1 48 256s93.1 208 208 208 208-93.1 208-208S370.9 48 256 48zm0 368c-88.4 0-160-71.6-160-160S167.6 96 256 96s160 71.6 160 160-71.6 160-160 160z"/>
        <circle fill="#3880FF" cx="256" cy="256" r="72"/>
        <circle fill="#3880FF" cx="392" cy="120" r="32"/>
      `),
    },
    {
      name: 'Bootstrap',
      route: '/dynamic-forms/ui-libs-integrations/bootstrap',
      viewBox: '0 0 118 94',
      width: 52,
      height: 42,
      svgContent: this.sanitizer.bypassSecurityTrustHtml(`
        <path fill="#7952B3" d="M24.509 0c-6.733 0-11.715 5.893-11.492 12.284.214 6.14-.064 14.092-2.066 20.577C8.943 39.365 5.547 43.485 0 44.014v5.972c5.547.529 8.943 4.649 10.951 11.153 2.002 6.485 2.28 14.437 2.066 20.577C12.794 88.106 17.776 94 24.51 94H93.5c6.733 0 11.714-5.893 11.491-12.284-.214-6.14.064-14.092 2.066-20.577 2.009-6.504 5.396-10.624 10.943-11.153v-5.972c-5.547-.529-8.934-4.649-10.943-11.153-2.002-6.484-2.28-14.437-2.066-20.577C105.214 5.894 100.233 0 93.5 0H24.508zM80 57.863C80 66.663 73.436 72 62.543 72H44a2 2 0 01-2-2V24a2 2 0 012-2h18.437c9.083 0 15.044 4.92 15.044 12.474 0 5.302-4.01 10.049-9.119 10.88v.277C75.317 46.394 80 51.21 80 57.863zM60.521 28.34H49.948v14.934h8.905c6.884 0 10.68-2.772 10.68-7.727 0-4.643-3.264-7.207-9.012-7.207zM49.948 49.2v16.458H60.91c7.167 0 10.964-2.876 10.964-8.281 0-5.406-3.903-8.178-11.425-8.178H49.948z"/>
      `),
    },
  ];

  readonly packageManagers: PackageManager[] = [
    { id: 'npm', label: 'npm', command: 'npm install' },
    { id: 'pnpm', label: 'pnpm', command: 'pnpm add' },
    { id: 'yarn', label: 'yarn', command: 'yarn add' },
  ];

  readonly uiLibraries: UiLibrary[] = [
    { id: 'material', label: 'Material', package: '@ng-forge/material' },
    { id: 'primeng', label: 'PrimeNG', package: '@ng-forge/primeng' },
    { id: 'ionic', label: 'Ionic', package: '@ng-forge/ionic' },
    { id: 'bootstrap', label: 'Bootstrap', package: '@ng-forge/bootstrap' },
  ];

  readonly installCommand = computed(() => {
    const pkg = this.packageManagers.find((p) => p.id === this.currentPackageManager());
    const ui = this.uiLibraries.find((u) => u.id === this.currentUiLibrary());
    return `${pkg?.command ?? 'npm install'} @ng-forge/dynamic-forms ${ui?.package ?? '@ng-forge/material'}`;
  });

  constructor() {
    afterNextRender(() => {
      this.setupScrollListener();
      this.setupIntersectionObserver();
    });
  }

  private setupScrollListener(): void {
    if (!this.isBrowser) return;

    const handleScroll = (): void => {
      this.navScrolled.set(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    this.destroyRef.onDestroy(() => {
      window.removeEventListener('scroll', handleScroll);
    });
  }

  private setupIntersectionObserver(): void {
    if (!this.isBrowser) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('data-animate-id');
            if (id) {
              this.visibleElements.update((set) => {
                const newSet = new Set(set);
                newSet.add(id);
                return newSet;
              });
            }
          }
        });
      },
      { threshold: 0.1 },
    );

    // Observe all elements with fade-up class after a small delay
    setTimeout(() => {
      const elements = document.querySelectorAll('.fade-up');
      elements.forEach((el, index) => {
        const id =
          el.getAttribute('data-animate-id') ??
          el.className.split(' ').find((c) => c.includes('header') || c.includes('demo') || c.includes('grid') || c.includes('cta')) ??
          `element-${index}`;
        el.setAttribute('data-animate-id', id);
        observer.observe(el);
      });
    }, 100);

    this.destroyRef.onDestroy(() => {
      observer.disconnect();
    });
  }

  isVisible(id: string): boolean {
    return this.visibleElements().has(id);
  }

  setPackageManager(id: string): void {
    this.currentPackageManager.set(id);
  }

  setUiLibrary(id: string): void {
    this.currentUiLibrary.set(id);
  }

  copyInstallCommand(): void {
    if (!this.isBrowser) return;

    navigator.clipboard.writeText(this.installCommand()).then(() => {
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    });
  }
}
