import { ChangeDetectionStrategy, Component } from '@angular/core';

interface Item {
  readonly label: string;
  readonly code?: string;
  readonly href?: string;
  readonly caption?: string;
  readonly accent?: 'core' | 'hot' | 'glow';
}

interface Section {
  readonly id: string;
  readonly title: string;
  readonly subtitle?: string;
  readonly items: readonly Item[];
}

const SECTIONS: readonly Section[] = [
  {
    id: 'field-types',
    title: 'Field types',
    subtitle: 'Built-in field types you can use across all four official adapters.',
    items: [
      { label: 'input', code: "type: 'input'", accent: 'core', caption: 'HTML input — text, email, number, password, tel, url' },
      { label: 'textarea', code: "type: 'textarea'", accent: 'core' },
      { label: 'select', code: "type: 'select'", accent: 'core', caption: 'Single-select dropdown' },
      { label: 'multi-checkbox', code: "type: 'multi-checkbox'", accent: 'core' },
      { label: 'checkbox', code: "type: 'checkbox'", accent: 'core' },
      { label: 'radio', code: "type: 'radio'", accent: 'core' },
      { label: 'datepicker', code: "type: 'datepicker'", accent: 'core' },
      { label: 'toggle', code: "type: 'toggle'", accent: 'core' },
      { label: 'slider', code: "type: 'slider'", accent: 'core' },
      { label: 'group', code: "type: 'group'", accent: 'hot', caption: 'Nested value shape' },
      { label: 'container', code: "type: 'container'", accent: 'hot', caption: 'Flat value, wrapper chain' },
      { label: 'page', code: "type: 'page'", accent: 'hot', caption: 'Multi-step wizard' },
      { label: 'row', code: "type: 'row'", accent: 'hot', caption: 'Horizontal flex layout' },
      { label: 'array', code: "type: 'array'", accent: 'hot', caption: 'Verbose or simplified flavors' },
      { label: 'submit / next / previous', code: 'first-class action buttons', accent: 'glow' },
      { label: 'addArrayItem / removeArrayItem / …', code: 'placeable array actions', accent: 'glow' },
      { label: 'text', code: "type: 'text'", accent: 'glow', caption: 'Display-only label / heading' },
      { label: 'hidden', code: "type: 'hidden'", accent: 'glow', caption: 'In value, not rendered' },
    ],
  },
  {
    id: 'validators',
    title: 'Validators',
    subtitle: 'Three pillars by execution model, plus shorthand helpers on the field.',
    items: [
      { label: 'Sync', code: 'customFnConfig.validators', accent: 'core', caption: 'Local checks: regex, range, predicates' },
      { label: 'HTTP', code: 'customFnConfig.httpValidators', accent: 'hot', caption: 'Ping the server with the value' },
      {
        label: 'Async (resource)',
        code: 'customFnConfig.asyncValidators',
        accent: 'glow',
        caption: 'Arbitrary Angular resource() workflows',
      },
      { label: 'Shorthand', code: 'required / email / min / max / pattern', accent: 'core', caption: 'Built-in helpers on the field' },
    ],
  },
  {
    id: 'conditions',
    title: 'Conditional logic',
    subtitle: 'Drives `hidden`, `disabled`, `readonly`, `required`, and validator gating.',
    items: [
      { label: 'fieldValue', code: "condition: { type: 'fieldValue' }", accent: 'core', caption: 'Auto-detects deps from `fieldPath`' },
      {
        label: 'JavaScript expression',
        code: "condition: { type: 'javascript' }",
        accent: 'hot',
        caption: 'String evaluated against `formValue` (CSP-safe)',
      },
      {
        label: 'Custom function',
        code: "condition: { type: 'custom' }",
        accent: 'hot',
        caption: 'Registered via `customFnConfig` — needs explicit `dependsOn`',
      },
      { label: 'HTTP', code: "condition: { type: 'http' }", accent: 'glow', caption: 'Hide / disable based on a server flag' },
      { label: 'Form state', code: "condition: 'formInvalid' | …", accent: 'glow', caption: 'For action buttons' },
    ],
  },
  {
    id: 'derivations',
    title: 'Derivations',
    subtitle: 'Compute values or properties (options, label, disabled, …) from other fields or HTTP.',
    items: [
      { label: 'Shorthand', code: "derivation: 'formValue.x * formValue.y'", accent: 'core', caption: 'String expression at field level' },
      { label: 'Structured', code: "logic: [{ type: 'derivation', value | functionName }]", accent: 'hot' },
      { label: 'HTTP-driven', code: "source: 'http'", accent: 'hot', caption: 'Fetch and project a response' },
      {
        label: 'Property derivation',
        code: "targetProperty: 'options' | 'label' | …",
        accent: 'glow',
        caption: 'Compute field props, not just values',
      },
    ],
  },
  {
    id: 'schema',
    title: 'Schema validation',
    subtitle: 'Form-level validation — Standard Schema spec, plus build-time codegen.',
    items: [
      { label: 'Zod', code: 'standardSchema(zodSchema)', href: '/schema-validation/zod', accent: 'core' },
      { label: 'Valibot', code: 'standardSchema(valibotSchema)', accent: 'core' },
      { label: 'ArkType', code: 'standardSchema(arkSchema)', accent: 'core' },
      {
        label: 'Angular Schema',
        code: 'AngularSchemaCallback',
        href: '/schema-validation/angular-schema',
        accent: 'hot',
        caption: 'Native Signal Forms callback',
      },
      {
        label: 'OpenAPI generator',
        code: '@ng-forge/openapi-generator',
        href: '/openapi-generator',
        accent: 'glow',
        caption: 'Build-time codegen → typed FormConfig',
      },
    ],
  },
  {
    id: 'layout',
    title: 'Layout primitives',
    subtitle: 'How fields organise in the rendered tree and in the form value.',
    items: [
      {
        label: 'group',
        code: 'nested value',
        href: '/prebuilt/form-groups',
        accent: 'core',
        caption: 'Use when shape matters: `user.address.street`',
      },
      {
        label: 'container',
        code: 'flat value',
        href: '/prebuilt/container-field',
        accent: 'hot',
        caption: 'Visual grouping (card, section) without nesting',
      },
      { label: 'row', code: 'flat value', href: '/prebuilt/form-rows', accent: 'hot', caption: 'Horizontal flex layout' },
      {
        label: 'page',
        code: 'flat value',
        href: '/prebuilt/form-pages',
        accent: 'glow',
        caption: 'Multi-step wizard with auto navigation',
      },
      {
        label: 'array',
        code: 'array value',
        href: '/prebuilt/form-arrays/complete',
        accent: 'glow',
        caption: 'Verbose or simplified (template + auto-buttons)',
      },
    ],
  },
  {
    id: 'adapters',
    title: 'UI adapters',
    subtitle: 'Drop-in adapters that ship a curated set of field components.',
    items: [
      { label: 'Material', code: '@ng-forge/dynamic-forms-material', accent: 'core' },
      { label: 'Bootstrap', code: '@ng-forge/dynamic-forms-bootstrap', accent: 'core' },
      { label: 'PrimeNG', code: '@ng-forge/dynamic-forms-primeng', accent: 'core' },
      { label: 'Ionic', code: '@ng-forge/dynamic-forms-ionic', accent: 'core' },
      {
        label: 'Custom adapter',
        code: 'provideDynamicForm(...)',
        href: '/building-an-adapter',
        accent: 'glow',
        caption: 'Bring any UI library — first-class workflow',
      },
    ],
  },
];

/**
 * Self-contained capability overview rendered as a stack of chip-grid sections.
 * Used once on the Feature Overview page; no inputs, no presets, no
 * registry — just a static visual catalog of what ng-forge ships.
 */
@Component({
  selector: 'docs-feature-overview',
  template: `
    <div class="fo">
      @for (section of sections; track section.id) {
        <section class="fo__section" [attr.aria-label]="section.title">
          <h3 class="fo__title" [id]="section.id">{{ section.title }}</h3>
          @if (section.subtitle) {
            <p class="fo__subtitle">{{ section.subtitle }}</p>
          }
          <ul class="fo__grid">
            @for (item of section.items; track item.label) {
              @if (item.href) {
                <li class="fo__cell">
                  <a class="fo__chip fo__chip--link" [class]="chipClass(item)" [href]="item.href">
                    <span class="fo__label">{{ item.label }}</span>
                    @if (item.code) {
                      <code class="fo__code">{{ item.code }}</code>
                    }
                    @if (item.caption) {
                      <span class="fo__caption">{{ item.caption }}</span>
                    }
                  </a>
                </li>
              } @else {
                <li class="fo__cell">
                  <div class="fo__chip" [class]="chipClass(item)">
                    <span class="fo__label">{{ item.label }}</span>
                    @if (item.code) {
                      <code class="fo__code">{{ item.code }}</code>
                    }
                    @if (item.caption) {
                      <span class="fo__caption">{{ item.caption }}</span>
                    }
                  </div>
                </li>
              }
            }
          </ul>
        </section>
      }
    </div>
  `,
  styles: `
    @use 'tokens' as *;

    :host {
      display: block;
    }

    .fo {
      display: flex;
      flex-direction: column;
      gap: $space-6;
    }

    .fo__section {
      margin: 0;
    }

    .fo__title {
      margin: 0 0 $space-1;
      font-size: $text-lg;
      font-weight: 600;
      color: var(--forge-text, #e8e4de);
      letter-spacing: -0.01em;
      scroll-margin-top: 96px;
    }

    .fo__subtitle {
      margin: 0 0 $space-3;
      font-size: $text-sm;
      color: var(--forge-text-muted, #9a958c);
      line-height: 1.5;
    }

    .fo__grid {
      list-style: none;
      margin: 0;
      padding: 0;
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: $space-3;
    }

    .fo__cell {
      margin: 0;
    }

    .fo__chip {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: $space-1;
      height: 100%;
      padding: $space-3;
      border: 1px solid var(--forge-border-color, #2a2824);
      border-radius: $radius-sm;
      background: var(--forge-base-1, #131210);
      transition:
        border-color $transition-fast,
        transform $transition-fast;
    }

    .fo__chip--link {
      cursor: pointer;
      text-decoration: none;
      color: inherit;

      &:hover {
        border-color: $ember-glow;
        transform: translateY(-1px);
      }

      &:focus-visible {
        outline: 2px solid $ember-glow;
        outline-offset: 2px;
      }
    }

    .fo__chip--core {
      border-left: 3px solid $ember-core;
    }

    .fo__chip--hot {
      border-left: 3px solid $ember-hot;
    }

    .fo__chip--glow {
      border-left: 3px solid $ember-glow;
    }

    .fo__label {
      font-weight: 600;
      font-size: $text-sm;
      color: var(--forge-text, #e8e4de);
      letter-spacing: -0.01em;
    }

    .fo__code {
      font-family: $font-mono;
      font-size: $text-xs;
      color: var(--forge-text, #e8e4de);
      background: var(--forge-base-0, #0a0908);
      padding: 1px 6px;
      border-radius: 4px;
      max-width: 100%;
      overflow-wrap: break-word;
      word-break: break-word;
    }

    .fo__caption {
      font-size: $text-xs;
      color: var(--forge-text-muted, #9a958c);
      line-height: 1.4;
    }

    @media (max-width: 768px) {
      .fo__grid {
        grid-template-columns: 1fr;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class FeatureOverviewComponent {
  protected readonly sections = SECTIONS;

  protected readonly chipClass = (item: Item) => (item.accent ? `fo__chip--${item.accent}` : '');
}
