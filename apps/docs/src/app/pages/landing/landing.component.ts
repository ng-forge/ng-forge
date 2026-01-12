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

  readonly fireflyCount = 12;
  readonly fireflyPositions = signal<{ x: number; y: number; vx: number; vy: number; baseX: number; baseY: number }[]>([]);
  readonly sparks = signal<{ x: number; y: number; opacity: number }[]>([]);
  private mousePos = { x: -1000, y: -1000 };
  private animationFrame: number | null = null;

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

  constructor() {
    afterNextRender(() => {
      this.setupScrollListener();
      this.setupIntersectionObserver();
      this.setupScrollSnap();
      this.setupInteractiveFireflies();
      this.scrollToInitialHash();
    });
  }

  private scrollToInitialHash(): void {
    if (!this.isBrowser) return;

    const hash = window.location.hash.slice(1);
    if (hash && this.sectionIds.includes(hash)) {
      // Scroll to hash section
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

  private setupScrollSnap(): void {
    if (!this.isBrowser) return;

    let scrollTimeout: ReturnType<typeof setTimeout> | null = null;
    let isSnapping = false;

    const getSnapTargets = (): HTMLElement[] => {
      const hero = document.querySelector('.hero') as HTMLElement;
      const sections = Array.from(document.querySelectorAll('section[id]')) as HTMLElement[];
      const footer = document.querySelector('footer') as HTMLElement;
      return [hero, ...sections, footer].filter(Boolean);
    };

    const findClosestSnapTarget = (): HTMLElement | null => {
      const targets = getSnapTargets();
      const viewportHeight = window.innerHeight;
      const snapThreshold = viewportHeight * 0.6; // Snap if within 60% of viewport height

      let closest: HTMLElement | null = null;
      let closestDistance = Infinity;

      for (const target of targets) {
        const rect = target.getBoundingClientRect();
        const targetTop = rect.top;
        const isHero = target.classList.contains('hero');

        // Only snap when approaching a section (its top is near viewport top from below)
        // OR when section fits in viewport and we're close to aligning it
        const sectionFitsInViewport = rect.height <= viewportHeight * 0.9;

        // For tall sections: only snap if section top is slightly below viewport (approaching)
        // For short sections: snap if we're close to aligning
        if (!sectionFitsInViewport) {
          // Tall section: only snap when approaching (targetTop between 0 and threshold)
          // Don't snap if we've scrolled into it (targetTop < 0)
          if (targetTop < 0 && !isHero) {
            continue;
          }
        }

        // Hero only snaps when very close to top (scrolling back up)
        const threshold = isHero ? 150 : snapThreshold;

        // Check if the top of the section is close to the viewport top
        if (targetTop >= 0 && targetTop < threshold && targetTop < closestDistance) {
          closestDistance = targetTop;
          closest = target;
        }
      }

      return closest;
    };

    const handleScrollEnd = (): void => {
      if (isSnapping) return;

      const target = findClosestSnapTarget();
      if (target) {
        isSnapping = true;

        // Account for fixed navbar (approx 70px when scrolled)
        const navOffset = 80;
        const targetRect = target.getBoundingClientRect();
        const targetTop = window.scrollY + targetRect.top - navOffset;

        // For hero section, scroll to very top
        const isHero = target.classList.contains('hero');
        const scrollTo = isHero ? 0 : Math.max(0, targetTop);

        window.scrollTo({ top: scrollTo, behavior: 'smooth' });

        // Reset snapping flag after animation completes
        setTimeout(() => {
          isSnapping = false;
        }, 500);
      }
    };

    const handleScroll = (): void => {
      if (isSnapping) return;

      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }

      // Wait for scroll to stop, then snap
      scrollTimeout = setTimeout(handleScrollEnd, 80);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    this.destroyRef.onDestroy(() => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
    });
  }

  private setupInteractiveFireflies(): void {
    if (!this.isBrowser) return;

    // Initialize firefly positions in a grid pattern to avoid clusters
    const cols = 4;
    const rows = Math.ceil(this.fireflyCount / cols);
    const cellWidth = window.innerWidth / cols;
    const cellHeight = window.innerHeight / rows;

    const initialPositions = Array.from({ length: this.fireflyCount }, (_, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      // Position within cell with some randomness
      const x = cellWidth * col + cellWidth * 0.2 + Math.random() * cellWidth * 0.6;
      const y = cellHeight * row + cellHeight * 0.2 + Math.random() * cellHeight * 0.6;
      return {
        x,
        y,
        vx: 0,
        vy: 0,
        baseX: x,
        baseY: y,
      };
    });
    this.fireflyPositions.set(initialPositions);

    // Track mouse movement
    const handleMouseMove = (e: MouseEvent): void => {
      this.mousePos = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Animation loop
    const animate = (): void => {
      const positions = this.fireflyPositions();
      const newSparks: { x: number; y: number; opacity: number }[] = [];
      const mouseRadius = 150;
      const returnForce = 0.003; // Very slow return for dreamy motion
      const friction = 0.99; // High friction = floaty, slow deceleration

      const newPositions = positions.map((firefly, i) => {
        let { x, y, vx, vy, baseX, baseY } = firefly;

        // Calculate distance from mouse
        const dx = x - this.mousePos.x;
        const dy = y - this.mousePos.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Scatter away from mouse (soft push)
        if (dist < mouseRadius && dist > 0) {
          const force = (mouseRadius - dist) / mouseRadius;
          vx += (dx / dist) * force * 0.6;
          vy += (dy / dist) * force * 0.6;
        }

        // Repulsion from other fireflies to prevent clustering (very gentle)
        const repulsionRadius = 100;
        for (let j = 0; j < positions.length; j++) {
          if (i === j) continue;
          const other = positions[j];
          const repDx = x - other.x;
          const repDy = y - other.y;
          const repDist = Math.sqrt(repDx * repDx + repDy * repDy);

          if (repDist < repulsionRadius && repDist > 0) {
            const repForce = (repulsionRadius - repDist) / repulsionRadius;
            vx += (repDx / repDist) * repForce * 0.08;
            vy += (repDy / repDist) * repForce * 0.08;
          }
        }

        // Gentle drift back to base position
        vx += (baseX - x) * returnForce;
        vy += (baseY - y) * returnForce;

        // Subtle random drift
        vx += (Math.random() - 0.5) * 0.05;
        vy += (Math.random() - 0.5) * 0.05;

        // Apply friction
        vx *= friction;
        vy *= friction;

        // Update position
        x += vx;
        y += vy;

        // Check for nearby fireflies and create sparks
        for (let j = i + 1; j < positions.length; j++) {
          const other = positions[j];
          const sparkDx = x - other.x;
          const sparkDy = y - other.y;
          const sparkDist = Math.sqrt(sparkDx * sparkDx + sparkDy * sparkDy);

          // Create spark when fireflies are close (but not too often due to repulsion)
          if (sparkDist < 80 && Math.random() < 0.02) {
            newSparks.push({
              x: (x + other.x) / 2,
              y: (y + other.y) / 2,
              opacity: 1,
            });
          }
        }

        return { x, y, vx, vy, baseX, baseY };
      });

      this.fireflyPositions.set(newPositions);

      // Update sparks (fade out)
      const currentSparks = this.sparks();
      const updatedSparks = [...currentSparks, ...newSparks]
        .map((spark) => ({ ...spark, opacity: spark.opacity - 0.05 }))
        .filter((spark) => spark.opacity > 0)
        .slice(-20); // Keep max 20 sparks
      this.sparks.set(updatedSparks);

      this.animationFrame = requestAnimationFrame(animate);
    };

    this.animationFrame = requestAnimationFrame(animate);

    this.destroyRef.onDestroy(() => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (this.animationFrame) {
        cancelAnimationFrame(this.animationFrame);
      }
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
}
