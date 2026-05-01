import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  ArrowRight,
  ArrowRightLeft,
  Atom,
  Box,
  Calculator,
  CircleCheck,
  Cloud,
  Code,
  Eye,
  FileCode,
  FileJson,
  Frame,
  Funnel,
  Globe,
  Hammer,
  KeyRound,
  Layers,
  LayoutGrid,
  LayoutPanelTop,
  LifeBuoy,
  Link2,
  ListChecks,
  type LucideIconData,
  LucideAngularModule,
  MessagesSquare,
  MousePointerClick,
  PackageOpen,
  Palette,
  Plus,
  Repeat,
  Rocket,
  Rows3,
  Send,
  ShieldCheck,
  Sparkles,
  Sprout,
  Tags,
  Type,
  Zap,
} from 'lucide-angular';

interface NavCard {
  readonly icon: LucideIconData;
  readonly title: string;
  readonly description: string;
  readonly href: string;
}

interface NavSection {
  readonly id: string;
  readonly icon: LucideIconData;
  readonly accent: string;
  readonly title: string;
  readonly subtitle: string;
  readonly cards: readonly NavCard[];
}

interface FaqItem {
  readonly q: string;
  readonly a: string;
}

interface Pitfall {
  readonly title: string;
  readonly symptom: string;
  readonly fix: string;
  readonly href: string;
}

const NAV: readonly NavSection[] = [
  {
    id: 'render',
    icon: Rocket,
    accent: '#ff4d00',
    title: 'Render a form',
    subtitle: 'Get the library wired up and put a form on screen.',
    cards: [
      {
        icon: PackageOpen,
        title: 'Install + bootstrap',
        description: 'Add ng-forge and a UI adapter, register them at the application root.',
        href: '/getting-started',
      },
      {
        icon: Palette,
        title: 'Pick a UI library',
        description: 'Material, PrimeNG, Bootstrap, or Ionic — first-party adapters.',
        href: '/configuration',
      },
      {
        icon: Hammer,
        title: 'Build a custom adapter',
        description: 'Use a UI library ng-forge does not ship today.',
        href: '/building-an-adapter',
      },
      {
        icon: Sprout,
        title: 'Generate from a backend spec',
        description: 'Drive forms from OpenAPI 3.x at build time.',
        href: '/openapi-generator',
      },
    ],
  },
  {
    id: 'pick-field',
    icon: MousePointerClick,
    accent: '#ff6b2b',
    title: 'Pick the right field',
    subtitle: 'What kind of input does the user need to give you?',
    cards: [
      {
        icon: Type,
        title: 'Text inputs',
        description: 'input, textarea, datepicker — typing free-form data.',
        href: '/field-types/text-inputs',
      },
      {
        icon: ListChecks,
        title: 'Selection',
        description: 'select, radio, checkbox, multi-checkbox, toggle, slider.',
        href: '/field-types/selection',
      },
      {
        icon: Send,
        title: 'Buttons',
        description: 'submit / next / previous and array add/remove actions.',
        href: '/field-types/buttons',
      },
      {
        icon: Plus,
        title: 'Custom field types',
        description: 'Register your own component when nothing built-in fits.',
        href: '/recipes/custom-fields',
      },
    ],
  },
  {
    id: 'layout',
    icon: LayoutGrid,
    accent: '#ff8c42',
    title: 'Group, lay out, repeat',
    subtitle: 'Compose multiple fields into structured forms.',
    cards: [
      {
        icon: Layers,
        title: 'Group fields',
        description: 'Nest a section under a key — `user.address.street` shape.',
        href: '/prebuilt/form-groups',
      },
      {
        icon: Rows3,
        title: 'Rows + containers',
        description: 'Flat layout primitives — no nesting in the form value.',
        href: '/prebuilt/form-rows',
      },
      {
        icon: LayoutPanelTop,
        title: 'Multi-step pages',
        description: 'Wizard flows with per-page validation and navigation.',
        href: '/prebuilt/form-pages',
      },
      {
        icon: Repeat,
        title: 'Repeating arrays',
        description: 'Simplified API for primitives, full API for object arrays.',
        href: '/prebuilt/form-arrays/simplified',
      },
      {
        icon: Frame,
        title: 'Wrap a field',
        description: 'Add a card, panel, or label around any field via wrappers.',
        href: '/wrappers/overview',
      },
    ],
  },
  {
    id: 'validate',
    icon: ShieldCheck,
    accent: '#ffb627',
    title: 'Validate input',
    subtitle: 'Stop bad data before submission, in three execution models.',
    cards: [
      {
        icon: CircleCheck,
        title: 'Built-in shorthand',
        description: 'required, email, min, max, minLength, pattern — at field top level.',
        href: '/validation/basics',
      },
      {
        icon: Code,
        title: 'Custom validators',
        description: 'Sync, async, and HTTP-driven validator functions.',
        href: '/validation/custom-validators',
      },
      {
        icon: FileCode,
        title: 'Schema-first (Zod, Valibot, ArkType)',
        description: 'Standard Schema spec — one source of truth for shape + validation.',
        href: '/schema-validation/zod',
      },
      {
        icon: Link2,
        title: 'Cross-field rules',
        description: 'Confirm-password, conditional requireds, schema-level refinements.',
        href: '/validation/advanced',
      },
      {
        icon: KeyRound,
        title: 'Validation reference',
        description: 'The complete list of built-in keys and message overrides.',
        href: '/validation/reference',
      },
    ],
  },
  {
    id: 'react',
    icon: Zap,
    accent: '#ff4d00',
    title: 'Make fields react',
    subtitle: 'Show, hide, compute, fetch — fields that respond to other fields.',
    cards: [
      {
        icon: Eye,
        title: 'Conditional logic',
        description: "Show / hide / require based on another field's value.",
        href: '/dynamic-behavior/conditional-logic',
      },
      {
        icon: Calculator,
        title: 'Computed values',
        description: "Derive a field's value from a formula across other fields.",
        href: '/dynamic-behavior/derivation',
      },
      {
        icon: Cloud,
        title: 'HTTP-driven options',
        description: 'Load select options, look up values, or check flags from an endpoint.',
        href: '/dynamic-behavior/derivation',
      },
      {
        icon: Send,
        title: 'Submit & events',
        description: '(submitted), (events), formValue signal — full lifecycle access.',
        href: '/dynamic-behavior/submission',
      },
      {
        icon: MessagesSquare,
        title: 'Cross-field events',
        description: 'EventBus / EventDispatcher for fields that talk to each other.',
        href: '/recipes/events',
      },
    ],
  },
  {
    id: 'production',
    icon: Sparkles,
    accent: '#ff8c42',
    title: 'Production concerns',
    subtitle: 'Type safety, value control, internationalisation, migration.',
    cards: [
      {
        icon: Tags,
        title: 'Type safety',
        description: '`as const satisfies FormConfig` flows literal field shapes into the form value.',
        href: '/recipes/type-safety',
      },
      {
        icon: Funnel,
        title: 'Control submitted values',
        description: 'excludeValueIfHidden / disabled / readonly — strip server-irrelevant fields.',
        href: '/recipes/value-exclusion',
      },
      {
        icon: Globe,
        title: 'Internationalisation',
        description: 'Labels, hints, and validation messages accept reactive Signals/Observables.',
        href: '/dynamic-behavior/i18n',
      },
      {
        icon: FileJson,
        title: 'OpenAPI generator',
        description: 'Build-time `FormConfig` + form-value type from your spec.',
        href: '/openapi-generator',
      },
      {
        icon: ArrowRightLeft,
        title: 'Migrating from ngx-formly',
        description: 'Concept-by-concept mapping with side-by-side code.',
        href: '/migrating-from-ngx-formly',
      },
    ],
  },
];

const FAQ: readonly FaqItem[] = [
  {
    q: 'How do I add a field type ng-forge does not ship?',
    a: "`provideDynamicForm(...)` is variadic — it takes a list of field-type registrations. Spread an adapter's bundle (`...withMaterialFields()` registers all the built-in Material fields), then append your own: `{ name: 'rich-text', loadComponent: () => import('./rich-text'), mapper: valueFieldMapper }`. Your component is a plain standalone Angular component that receives Signal Forms' `FieldTree<T>` via `input.required()`. See [Adding custom fields](/recipes/custom-fields).",
  },
  {
    q: 'How do I lazy-load select options from an API?',
    a: "Use a `targetProperty: 'options'` derivation with `source: 'http'`. Pass the URL (or query params with field-value interpolation), a `responseExpression` that maps the response to `{ value, label }[]`, and `dependsOn` if it should re-fetch when another field changes. See [Async data](/dynamic-behavior/derivation).",
  },
  {
    q: 'Can ng-forge run side by side with ngx-formly during a migration?',
    a: 'Yes. Different package names, different injection tokens, different component selectors. Install ng-forge, port one form at a time, deprecate formly when nothing imports `@ngx-formly/*`.',
  },
  {
    q: 'How do I share a config across multiple forms?',
    a: "`FormConfig` is a plain TypeScript object — extract reusable pieces (a field, a validator entry, a default `props` object) as named consts and import them. For application-wide defaults, use `defaultProps` on the form or adapter-level providers like `withMaterialFields({ appearance: 'fill' })`.",
  },
  {
    q: 'How do I localise labels and validation messages?',
    a: 'Labels, placeholders, and hint text accept `string | Signal<string> | Observable<string>` — wire them to your i18n service. Validation `kind`s map to messages via per-field `validationMessages` or form-level `defaultValidationMessages`. See the [i18n guide](/dynamic-behavior/i18n).',
  },
  {
    q: 'How do I export the submitted form value as plain JSON?',
    a: 'The `(submitted)` event emits the form value directly — `JSON.stringify(value)` is enough. To strip hidden, disabled, or readonly fields, set `excludeValueIfHidden` (and the sibling options) on the form config or via `withValueExclusionDefaults()`. See [Value exclusion](/recipes/value-exclusion).',
  },
  {
    q: 'Are hidden field values still in the submitted form value?',
    a: "Yes by default — ng-forge keeps hidden values live so a hide/show toggle preserves what the user typed. Opt out with `excludeValueIfHidden: true` to strip them at submission output time, or wire a `derivation` that clears the value when the hide condition is true (formly's `resetOnHide` behaviour).",
  },
  {
    q: 'How do I debounce a field, or commit a value only on blur?',
    a: "Debouncing happens on the consumer side: set `trigger: 'debounced'` and `debounceMs` on the derivation, condition, or HTTP validator that reads the value. **There is no `onBlur` / `updateOn: 'blur'` equivalent today** — the Signal Forms substrate commits on every change, and ng-forge's `LogicTrigger` only exposes `'onChange' | 'debounced'`. If formly's commit-on-blur was load-bearing for your form, debouncing is the closest workaround for now.",
  },
  {
    q: 'Does ng-forge work without one of the four official UI adapters?',
    a: 'Yes — every adapter is built on the same public surface, so you can ship a custom adapter for Kendo, NG-ZORRO, NativeScript, or an in-house design system. See [Building an adapter](/building-an-adapter).',
  },
  {
    q: 'Does ng-forge use Reactive Forms (`FormGroup` / `FormControl`)?',
    a: "No. ng-forge is built on Angular Signal Forms (`@angular/forms/signals`). The primitive is `FieldTree<T>` — a signal-native tree of value, validity, dirty/touched state, and errors. Reactive Forms still works in Angular, but the two systems don't share types or APIs.",
  },
];

const PITFALLS: readonly Pitfall[] = [
  {
    title: "`type: 'group'` is nesting my form value",
    symptom: 'You wanted a section, you got `{ section: { firstName, … } }` instead of flat keys.',
    fix: "Use `type: 'container'` for visual grouping (flat value + wrapper slot). Reserve `group` for genuine data nesting like `user.address`.",
    href: '/prebuilt/container-field',
  },
  {
    title: 'Hidden field values still appear in the submitted form',
    symptom: "A hidden field's previous value is in the `(submitted)` payload.",
    fix: 'ng-forge filters values at submission output, not state. Set `excludeValueIfHidden: true` on the form options, or apply globally via `withValueExclusionDefaults()`.',
    href: '/recipes/value-exclusion',
  },
  {
    title: 'Custom validator runs but no message renders',
    symptom: "Validator returns `{ kind: 'noSpaces' }`, field is invalid, no message appears, console warns about a missing kind.",
    fix: 'Validators only declare kinds. Messages live separately in `validationMessages` (per-field) or `defaultValidationMessages` (form-level), so the same kind can be reused and localised.',
    href: '/validation/custom-validators',
  },
  {
    title: 'Custom-function condition does not react to dependencies',
    symptom: "`condition: { type: 'custom', functionName: 'isAdult' }` reads `ctx.formValue.age` but doesn't re-evaluate when age changes.",
    fix: "Custom and HTTP variants can't be statically introspected. List dependencies explicitly with `dependsOn: ['age']`. Same applies to HTTP derivations.",
    href: '/dynamic-behavior/conditional-logic',
  },
  {
    title: 'Select options blank — backend returns `id` / `name` keys',
    symptom: 'Dropdown shows empty rows or `[object Object]`.',
    fix: "`FieldOption` is fixed at `{ value, label, disabled? }`. Remap once at the source, or inside a `targetProperty: 'options'` derivation with `responseExpression`.",
    href: '/field-types/selection',
  },
  {
    title: 'Two-or-more-dot derivation paths silently no-op',
    symptom: "`targetProperty: 'props.config.minDate'` never updates.",
    fix: 'Up to one level of nesting is supported (`options`, `label`, `props.minDate`). Deeper paths require a custom field type that reads the value off a sibling field directly.',
    href: '/dynamic-behavior/derivation',
  },
];

@Component({
  selector: 'app-feature-overview',
  imports: [LucideAngularModule],
  template: `
    <div class="overview">
      <header class="overview__hero">
        <span class="overview__eyebrow">Feature overview</span>
        <h1 class="overview__title">Find your way around ng-forge</h1>
        <p class="overview__lead">
          Six task-shaped paths into the docs — pick what you're trying to do, jump straight to the page that answers it. A general FAQ and
          the most common pitfalls are at the bottom.
        </p>
      </header>

      <section class="overview__nav">
        @for (section of nav; track section.id) {
          <article class="panel" [style.--accent]="section.accent">
            <header class="panel__head">
              <span class="panel__icon">
                <lucide-icon [img]="section.icon" size="22" />
              </span>
              <div class="panel__heading">
                <h2 class="panel__title">{{ section.title }}</h2>
                <p class="panel__subtitle">{{ section.subtitle }}</p>
              </div>
            </header>
            <div class="panel__cards">
              @for (card of section.cards; track card.title) {
                <a class="card" [href]="card.href">
                  <span class="card__icon">
                    <lucide-icon [img]="card.icon" size="18" />
                  </span>
                  <span class="card__body">
                    <span class="card__title" [innerHTML]="renderInline(card.title)"></span>
                    <span class="card__desc" [innerHTML]="renderInline(card.description)"></span>
                  </span>
                  <span class="card__arrow">
                    <lucide-icon [img]="ArrowRight" size="16" />
                  </span>
                </a>
              }
            </div>
          </article>
        }
      </section>

      <section class="overview__faq">
        <header class="overview__sectionhead">
          <span class="overview__sectionhead-icon overview__sectionhead-icon--cool">
            <lucide-icon [img]="LifeBuoy" size="20" />
          </span>
          <div>
            <h2 class="overview__h2">FAQ</h2>
            <p class="overview__h2-sub">General-purpose questions worth knowing the answer to before you start.</p>
          </div>
        </header>
        <div class="faq">
          @for (item of faq; track item.q; let i = $index) {
            <details class="faq__item" [open]="openFaq() === i" (toggle)="onFaqToggle(i, $event)">
              <summary class="faq__q">
                <span [innerHTML]="renderInline(item.q)"></span>
                <span class="faq__chevron" aria-hidden="true">
                  <lucide-icon [img]="Plus" size="16" />
                </span>
              </summary>
              <div class="faq__a" [innerHTML]="renderInline(item.a)"></div>
            </details>
          }
        </div>
      </section>

      <section class="overview__pitfalls">
        <header class="overview__sectionhead">
          <span class="overview__sectionhead-icon overview__sectionhead-icon--warn">
            <lucide-icon [img]="Atom" size="20" />
          </span>
          <div>
            <h2 class="overview__h2">Common pitfalls</h2>
            <p class="overview__h2-sub">The patterns that trip people up — symptom, fix, and a link to the canonical doc.</p>
          </div>
        </header>
        <div class="pitfalls">
          @for (p of pitfalls; track p.title) {
            <article class="pitfall">
              <h3 class="pitfall__title" [innerHTML]="renderInline(p.title)"></h3>
              <p class="pitfall__row">
                <span class="pitfall__label">Symptom</span>
                <span class="pitfall__text" [innerHTML]="renderInline(p.symptom)"></span>
              </p>
              <p class="pitfall__row">
                <span class="pitfall__label pitfall__label--fix">Fix</span>
                <span class="pitfall__text" [innerHTML]="renderInline(p.fix)"></span>
              </p>
              <a class="pitfall__more" [href]="p.href"> Read the full guide <lucide-icon [img]="ArrowRight" size="14" /> </a>
            </article>
          }
        </div>
      </section>

      <section class="overview__cta">
        <div class="cta">
          <span class="cta__icon">
            <lucide-icon [img]="Box" size="22" />
          </span>
          <div class="cta__copy">
            <h3>Still stuck?</h3>
            <p>
              The MCP server lets an LLM in your IDE scaffold configs for you. Discord is the fastest way to ask a real human. GitHub takes
              long-form bug reports.
            </p>
          </div>
          <div class="cta__buttons">
            <a class="cta__btn cta__btn--primary" href="/ai-integration"> <lucide-icon [img]="Sparkles" size="14" /> MCP server </a>
            <a class="cta__btn" href="https://discord.gg/qpzzvFagj3" target="_blank" rel="noopener">
              <lucide-icon [img]="MessagesSquare" size="14" /> Discord
            </a>
            <a class="cta__btn" href="https://github.com/ng-forge/ng-forge/issues" target="_blank" rel="noopener">
              <lucide-icon [img]="Code" size="14" /> GitHub
            </a>
          </div>
        </div>
      </section>
    </div>
  `,
  styleUrl: './feature-overview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class FeatureOverviewComponent {
  readonly nav = NAV;
  readonly faq = FAQ;
  readonly pitfalls = PITFALLS;

  readonly ArrowRight = ArrowRight;
  readonly Plus = Plus;
  readonly LifeBuoy = LifeBuoy;
  readonly Atom = Atom;
  readonly Box = Box;
  readonly Sparkles = Sparkles;
  readonly MessagesSquare = MessagesSquare;
  readonly Code = Code;

  readonly openFaq = signal<number | null>(null);

  onFaqToggle(index: number, event: Event): void {
    const el = event.target as HTMLDetailsElement;
    if (el.open) {
      this.openFaq.set(index);
    } else if (this.openFaq() === index) {
      this.openFaq.set(null);
    }
  }

  /** Inline-only markdown for backtick-code, links, and bold. SSR-safe. */
  renderInline(text: string): string {
    const escaped = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return escaped
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  }
}
