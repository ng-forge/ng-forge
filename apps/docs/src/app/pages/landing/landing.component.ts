import { afterNextRender, ChangeDetectionStrategy, Component, computed, DestroyRef, inject, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ExampleIframeComponent } from '../../components/example-iframe/example-iframe.component';
import { CodeHighlightDirective } from '../../directives/code-highlight.directive';

interface Feature {
  icon: string;
  title: string;
  description: string;
}

interface FieldType {
  code: string;
  label: string;
  snippet: string;
}

interface Integration {
  name: string;
  route: string;
  icon: string;
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
  imports: [RouterLink, ExampleIframeComponent, CodeHighlightDirective],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingComponent {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  readonly navScrolled = signal(false);
  readonly copied = signal(false);
  readonly visibleElements = signal<Set<string>>(new Set());

  readonly currentPackageManager = signal('npm');
  readonly currentUiLibrary = signal('material');
  readonly heroTab = signal<'config' | 'demo'>('demo');

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
    {
      code: 'input',
      label: 'Text, email, password, number',
      snippet: `{
  key: 'email',
  type: 'input',
  label: 'Email',
  props: { type: 'email' }
}`,
    },
    {
      code: 'textarea',
      label: 'Multi-line text',
      snippet: `{
  key: 'bio',
  type: 'textarea',
  label: 'Bio',
  props: { rows: 4 }
}`,
    },
    {
      code: 'select',
      label: 'Dropdown selection',
      snippet: `{
  key: 'country',
  type: 'select',
  label: 'Country',
  options: [
    { label: 'United States', value: 'us' },
    { label: 'United Kingdom', value: 'uk' },
  ]
}`,
    },
    {
      code: 'radio',
      label: 'Single choice',
      snippet: `{
  key: 'plan',
  type: 'radio',
  label: 'Plan',
  options: [
    { label: 'Free', value: 'free' },
    { label: 'Pro', value: 'pro' },
  ]
}`,
    },
    {
      code: 'checkbox',
      label: 'Boolean toggle',
      snippet: `{
  key: 'agree',
  type: 'checkbox',
  label: 'I agree to the terms'
}`,
    },
    {
      code: 'multi-checkbox',
      label: 'Multiple selections',
      snippet: `{
  key: 'interests',
  type: 'multi-checkbox',
  label: 'Interests',
  options: [
    { label: 'Sports', value: 'sports' },
    { label: 'Music', value: 'music' },
  ]
}`,
    },
    {
      code: 'toggle',
      label: 'Switch control',
      snippet: `{
  key: 'notifications',
  type: 'toggle',
  label: 'Enable notifications'
}`,
    },
    {
      code: 'slider',
      label: 'Range input',
      snippet: `{
  key: 'volume',
  type: 'slider',
  label: 'Volume',
  props: { min: 0, max: 100 }
}`,
    },
    {
      code: 'datepicker',
      label: 'Date selection',
      snippet: `{
  key: 'birthday',
  type: 'datepicker',
  label: 'Birthday'
}`,
    },
    {
      code: 'submit',
      label: 'Form submission',
      snippet: `{
  key: 'submit',
  type: 'submit',
  label: 'Save'
}`,
    },
    {
      code: 'row',
      label: 'Horizontal layout',
      snippet: `{
  type: 'row',
  fields: [
    { key: 'firstName', type: 'input', label: 'First' },
    { key: 'lastName', type: 'input', label: 'Last' },
  ]
}`,
    },
    {
      code: 'group',
      label: 'Nested objects',
      snippet: `{
  key: 'address',
  type: 'group',
  fields: [...]
}`,
    },
    {
      code: 'page',
      label: 'Multi-step wizards',
      snippet: `{
  type: 'page',
  key: 'step1',
  label: 'Info',
  fields: [...]
}`,
    },
    {
      code: 'array',
      label: 'Repeatable fields',
      snippet: `{
  key: 'items',
  type: 'array',
  fields: [...]
}`,
    },
    {
      code: 'text',
      label: 'Static content',
      snippet: `{
  type: 'text',
  label: 'Section Title',
  props: { elementType: 'h3' }
}`,
    },
  ];

  readonly integrations: Integration[] = [
    { name: 'Material', route: '/dynamic-forms/ui-libs-integrations/material', icon: 'assets/icons/material.svg' },
    { name: 'PrimeNG', route: '/dynamic-forms/ui-libs-integrations/primeng', icon: 'assets/icons/primeng.webp' },
    { name: 'Ionic', route: '/dynamic-forms/ui-libs-integrations/ionic', icon: 'assets/icons/ionic.svg' },
    { name: 'Bootstrap', route: '/dynamic-forms/ui-libs-integrations/bootstrap', icon: 'assets/icons/bootstrap.svg' },
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

  // Code snippets for syntax highlighting
  readonly codeSnippets = {
    heroConfig: `import { DynamicForm, type FormConfig, type InferFormValue } from '@ng-forge/dynamic-forms';

@Component({
  imports: [DynamicForm],
  template: \`<form [dynamic-form]="config" (submit)="onSubmit($event)"></form>\`
})
export class LoginComponent {
  config = {
    fields: [
      { key: 'title', type: 'text', label: 'Sign In', props: { elementType: 'h2' } },
      { key: 'email', type: 'input', label: 'Email',
        required: true, email: true, props: { type: 'email' } },
      { key: 'password', type: 'input', label: 'Password',
        required: true, minLength: 8, props: { type: 'password' } },
      { key: 'remember', type: 'checkbox', label: 'Remember me' },
      { key: 'submit', type: 'submit', label: 'Sign In' },
    ]
  } as const satisfies FormConfig;

  onSubmit(value: InferFormValue<typeof this.config.fields>) {
    // value is fully typed: { email: string, password: string, remember: boolean }
    console.log(value);
  }
}`,

    conditionalLogic: `{
  key: 'company',
  type: 'input',
  label: 'Company Name',
  logic: [
    {
      type: 'required',
      when: {
        field: 'accountType',
        equals: 'business',
      },
    },
  ],
}`,

    multiStepWizard: `{
  fields: [
    {
      type: 'page',
      key: 'info',
      label: 'Your Info',
      fields: [...],
    },
    {
      type: 'page',
      key: 'payment',
      label: 'Payment',
      fields: [...],
    },
  ],
}`,

    validation: `{ key: 'email', type: 'input', required: true, email: true },
{ key: 'age', type: 'input', min: 18, max: 120 },
{ key: 'username', type: 'input', minLength: 3, maxLength: 20 },
{ key: 'website', type: 'input', pattern: /^https?:\\/\\/.+/ }`,

    validationShowcase: `{
  key: 'email',
  type: 'input',
  label: 'Email',
  required: true,
  email: true,
},
{
  key: 'password',
  type: 'input',
  label: 'Password',
  required: true,
  minLength: 8,
  pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$/,
  validationMessages: {
    pattern: 'Need uppercase, lowercase & number',
  },
},
{
  key: 'age',
  type: 'input',
  label: 'Age',
  min: 18,
  max: 120,
},
{
  key: 'username',
  type: 'input',
  label: 'Username',
  minLength: 3,
  maxLength: 15,
  pattern: /^[a-z0-9_]+$/,
}`,

    jsonConfig: `{
  "fields": [
    {
      "key": "name",
      "type": "input",
      "label": "Full Name",
      "required": true
    },
    {
      "key": "feedback",
      "type": "textarea",
      "label": "Your Feedback"
    },
    {
      "key": "rating",
      "type": "select",
      "label": "Rating",
      "options": ["Excellent", "Good", "Average", "Poor"]
    }
  ]
}`,

    jsonFetch: `@Component({
  template: \`<form [dynamic-form]="config()" />\`
})
export class SurveyComponent {
  private http = inject(HttpClient);

  config = toSignal(
    this.http.get<FormConfig>('/api/forms/survey')
  );
}`,
  };

  readonly installCommand = computed(() => {
    const pkg = this.packageManagers.find((p) => p.id === this.currentPackageManager());
    const ui = this.uiLibraries.find((u) => u.id === this.currentUiLibrary());
    return `${pkg?.command ?? 'npm install'} @ng-forge/dynamic-forms ${ui?.package ?? '@ng-forge/material'}`;
  });

  private readonly sectionIds = ['features', 'showcase', 'validation', 'field-types', 'json-config', 'integrations'];
  private currentSection = '';

  constructor() {
    afterNextRender(() => {
      this.setupScrollListener();
      this.setupIntersectionObserver();
      this.setupSectionObserver();
      this.enableSmoothScroll();
      this.scrollToInitialHash();
    });
  }

  private enableSmoothScroll(): void {
    if (!this.isBrowser) return;
    document.documentElement.style.scrollBehavior = 'smooth';
  }

  private scrollToInitialHash(): void {
    if (!this.isBrowser) return;

    const hash = window.location.hash.slice(1);
    if (hash && this.sectionIds.includes(hash)) {
      setTimeout(() => {
        const element = document.getElementById(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 300);
    }
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

  setHeroTab(tab: 'config' | 'demo'): void {
    this.heroTab.set(tab);
  }

  copyInstallCommand(): void {
    if (!this.isBrowser) return;

    navigator.clipboard.writeText(this.installCommand()).then(() => {
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    });
  }

  private setupSectionObserver(): void {
    if (!this.isBrowser) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the most visible section
        const visibleEntries = entries.filter((e) => e.isIntersecting);
        if (visibleEntries.length === 0) return;

        // Get the one with highest intersection ratio
        const mostVisible = visibleEntries.reduce((prev, curr) => (curr.intersectionRatio > prev.intersectionRatio ? curr : prev));

        const id = mostVisible.target.id;
        if (id && id !== this.currentSection) {
          this.currentSection = id;
          // Use replaceState with full path to avoid router conflicts
          const newUrl = `${window.location.pathname}#${id}`;
          window.history.replaceState(window.history.state, '', newUrl);
        }
      },
      { threshold: [0.2, 0.4, 0.6, 0.8] },
    );

    this.sectionIds.forEach((id) => {
      const section = document.getElementById(id);
      if (section) {
        observer.observe(section);
      }
    });

    this.destroyRef.onDestroy(() => {
      observer.disconnect();
    });
  }
}
