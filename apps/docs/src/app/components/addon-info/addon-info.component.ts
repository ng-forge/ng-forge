import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import type { AdapterName } from '@ng-forge/sandbox-harness';
import { ActiveAdapterService } from '../../services/active-adapter.service';
import { CodeHighlightDirective } from '../../directives/code-highlight.directive';

type UiAdapterName = Exclude<AdapterName, 'custom'>;

type AddonInfoField =
  | 'quickstart'
  | 'kinds-table'
  | 'rendering-mechanism'
  | 'provider-setup'
  | 'preset-handler-context'
  | 'custom-extension-name'
  | 'three-variants'
  | 'reactive-hidden-snippet'
  | 'actions-wiring'
  | 'custom-kind-invocation';

interface AddonAdapterData {
  iconKind: string;
  buttonKind: string;
  iconLibrary: string;
  iconRender: string;
  searchIcon: string;
  clearIcon: string;
  inputComponentName: string;
  withFieldsHelper: string;
  withAddonsHelper: string;
  typeOverrideToken: string;
  customExtensionInterface: string;
  presetRunner: string;
  packageName: string;
  buttonShortName: string;
  prefixSlotDescription: string;
}

const ADAPTER_DATA: Record<UiAdapterName, AddonAdapterData> = {
  material: {
    iconKind: 'mat-icon',
    buttonKind: 'mat-button',
    iconLibrary: 'Material Icons',
    iconRender: '<mat-icon>search</mat-icon>',
    searchIcon: 'search',
    clearIcon: 'close',
    inputComponentName: 'mat-input',
    withFieldsHelper: 'withMaterialFields',
    withAddonsHelper: 'withMaterialAddons',
    typeOverrideToken: 'MAT_INPUT_TYPE_OVERRIDE',
    customExtensionInterface: 'MatAddonExtensions',
    presetRunner: 'runMatPresetAction',
    packageName: '@ng-forge/dynamic-forms-material',
    buttonShortName: 'mat-button',
    prefixSlotDescription:
      "Addons render as direct <code>&lt;mat-form-field&gt;</code> children with <code>matPrefix</code> / <code>matSuffix</code> attribute directives applied to <code>&lt;df-addon-slot&gt;</code> — Material's native projection API.",
  },
  bootstrap: {
    iconKind: 'bs-icon',
    buttonKind: 'bs-button',
    iconLibrary: 'Bootstrap Icons',
    iconRender: '<i class="bi bi-search">',
    searchIcon: 'search',
    clearIcon: 'x',
    inputComponentName: 'bs-input',
    withFieldsHelper: 'withBootstrapFields',
    withAddonsHelper: 'withBootstrapAddons',
    typeOverrideToken: 'BS_INPUT_TYPE_OVERRIDE',
    customExtensionInterface: 'BsAddonExtensions',
    presetRunner: 'runBsPresetAction',
    packageName: '@ng-forge/dynamic-forms-bootstrap',
    buttonShortName: 'bs-button',
    prefixSlotDescription:
      'The input switches to a <code>&lt;div class=&quot;input-group&quot;&gt;</code> wrapper when any addon is present; addons render in <code>&lt;span class=&quot;input-group-text&quot;&gt;</code> flanking the input. The floating-label branch nests <code>&lt;div class=&quot;form-floating&quot;&gt;</code> inside the group.',
  },
  primeng: {
    iconKind: 'prime-icon',
    buttonKind: 'prime-button',
    iconLibrary: 'PrimeIcons',
    iconRender: '<i class="pi pi-search">',
    searchIcon: 'search',
    clearIcon: 'times',
    inputComponentName: 'prime-input',
    withFieldsHelper: 'withPrimeNGFields',
    withAddonsHelper: 'withPrimeNGAddons',
    typeOverrideToken: 'PRIME_INPUT_TYPE_OVERRIDE',
    customExtensionInterface: 'PrimeAddonExtensions',
    presetRunner: 'runPrimePresetAction',
    packageName: '@ng-forge/dynamic-forms-primeng',
    buttonShortName: 'prime-button',
    prefixSlotDescription:
      'The input switches to a <code>&lt;p-inputgroup&gt;</code> wrapper with <code>&lt;p-inputgroup-addon&gt;</code> flanking the input. The wrapper is dropped entirely when every addon is reactively hidden.',
  },
  ionic: {
    iconKind: 'ion-icon',
    buttonKind: 'ion-button',
    iconLibrary: 'Ionicons',
    iconRender: '<ion-icon name="search-outline">',
    searchIcon: 'search-outline',
    clearIcon: 'close-outline',
    inputComponentName: 'ionic-input',
    withFieldsHelper: 'withIonicFields',
    withAddonsHelper: 'withIonicAddons',
    typeOverrideToken: 'IONIC_INPUT_TYPE_OVERRIDE',
    customExtensionInterface: 'IonAddonExtensions',
    presetRunner: 'runIonicPresetAction',
    packageName: '@ng-forge/dynamic-forms-ionic',
    buttonShortName: 'ion-button',
    prefixSlotDescription:
      'Addons render as <code>&lt;span slot=&quot;start&quot;&gt;</code> / <code>&lt;span slot=&quot;end&quot;&gt;</code> wrappers inside <code>&lt;ion-input&gt;</code> for shadow-DOM projection.',
  },
};

@Component({
  selector: 'docs-addon-info',
  imports: [CodeHighlightDirective],
  styleUrl: './addon-info.component.scss',
  template: `
    @if (isCustomAdapter()) {
      <div class="addon-info-empty">
        <p>
          Pick a UI adapter (Material, Bootstrap, PrimeNG, or Ionic) from the adapter switcher to view its addon-specific reference. The
          Custom adapter docs the underlying building blocks — addon configuration is identical to whichever UI adapter your custom adapter
          is layered on top of.
        </p>
      </div>
    } @else {
      @let d = data();
      @switch (field()) {
        @case ('quickstart') {
          <pre class="addon-code"><code [codeHighlight]="quickstartCode()" language="typescript"></code></pre>
        }
        @case ('kinds-table') {
          <div class="addon-table-wrap">
            <table class="addon-table">
              <thead>
                <tr>
                  <th>Kind</th>
                  <th>Renders</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <code>{{ d.iconKind }}</code>
                  </td>
                  <td>
                    <code>{{ d.iconRender }}</code>
                  </td>
                  <td>{{ d.iconLibrary }} name. Add <code>ariaLabel</code> for non-decorative icons.</td>
                </tr>
                <tr>
                  <td>
                    <code>{{ d.buttonKind }}</code>
                  </td>
                  <td>
                    <code>{{ buttonRender() }}</code>
                  </td>
                  <td>
                    Exactly one of <code>preset</code> / <code>actionRef</code> / <code>action</code>. Severity/color, label, icon all
                    supported.
                  </td>
                </tr>
                <tr>
                  <td><code>text</code></td>
                  <td><code>&lt;span&gt;</code> with <code>DynamicText</code></td>
                  <td>Universal; supports plain strings, signals, observables, i18n keys.</td>
                </tr>
                <tr>
                  <td><code>template</code></td>
                  <td>Named <code>&lt;ng-template&gt;</code></td>
                  <td>Reference by <code>templateKey</code>. JSON-safe — backend ships the key, FE supplies the template.</td>
                </tr>
                <tr>
                  <td><code>component</code></td>
                  <td>Arbitrary Angular component</td>
                  <td>Code-only — dropped from JSON-derived configs.</td>
                </tr>
              </tbody>
            </table>
          </div>
        }
        @case ('rendering-mechanism') {
          <p class="addon-prose" [innerHTML]="d.prefixSlotDescription"></p>
        }
        @case ('provider-setup') {
          <pre class="addon-code"><code [codeHighlight]="providerSetupCode()" language="typescript"></code></pre>
        }
        @case ('preset-handler-context') {
          <p class="addon-prose">
            Preset semantics live in <code>{{ d.presetRunner }}</code> (clear / reset / paste / copy / toggle-password-visibility) wired via
            the <code>ADDON_PRESET_HANDLER</code> token at the <code>{{ d.inputComponentName }}</code> field-component scope. The
            <code>'toggle-password-visibility'</code> preset writes to a per-field <code>{{ d.typeOverrideToken }}</code> signal that the
            input reads to compute its effective <code>type</code> attribute.
          </p>
        }
        @case ('custom-extension-name') {
          <pre class="addon-code"><code [codeHighlight]="extensionAugmentationCode()" language="typescript"></code></pre>
        }
        @case ('three-variants') {
          <pre class="addon-code"><code [codeHighlight]="threeVariantsCode()" language="typescript"></code></pre>
        }
        @case ('reactive-hidden-snippet') {
          <pre class="addon-code"><code [codeHighlight]="reactiveHiddenCode()" language="typescript"></code></pre>
        }
        @case ('actions-wiring') {
          <pre class="addon-code"><code [codeHighlight]="actionsWiringCode()" language="typescript"></code></pre>
        }
        @case ('custom-kind-invocation') {
          <pre class="addon-code"><code [codeHighlight]="customKindInvocationCode()" language="typescript"></code></pre>
        }
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocsAddonInfoComponent {
  readonly field = input.required<AddonInfoField>();

  private readonly activeAdapter = inject(ActiveAdapterService);

  protected readonly isCustomAdapter = computed(() => this.activeAdapter.adapter() === 'custom');

  protected readonly data = computed<AddonAdapterData>(() => {
    const name = this.activeAdapter.adapter();
    return name === 'custom' ? ADAPTER_DATA.material : ADAPTER_DATA[name as UiAdapterName];
  });

  protected readonly buttonRender = computed(() => {
    const d = this.data();
    if (d.iconKind.startsWith('mat')) return '<button mat-button> / <button mat-icon-button>';
    if (d.iconKind.startsWith('bs')) return '<button class="btn btn-outline-{severity}">';
    if (d.iconKind.startsWith('prime')) return '<p-button> with [loading]';
    return '<ion-button> with <ion-spinner>';
  });

  protected readonly quickstartCode = computed(() => {
    const d = this.data();
    return `{
  key: 'search',
  type: 'input',
  label: 'Search',
  addons: [
    { slot: 'prefix', kind: '${d.iconKind}', icon: '${d.searchIcon}', ariaLabel: 'Search' },
    { slot: 'suffix', kind: '${d.buttonKind}', icon: '${d.clearIcon}', ariaLabel: 'Clear', preset: 'clear' },
  ],
}`;
  });

  protected readonly providerSetupCode = computed(() => {
    const d = this.data();
    return `import { provideDynamicForm } from '@ng-forge/dynamic-forms';
import { ${d.withFieldsHelper} } from '${d.packageName}';

// ${d.iconKind} + ${d.buttonKind} work out of the box.
provideDynamicForm(...${d.withFieldsHelper}());

// Standalone — addon kinds without the field types:
// provideDynamicForm(...myCustomFields(), ${d.withAddonsHelper}());`;
  });

  protected readonly extensionAugmentationCode = computed(() => {
    const d = this.data();
    return `declare module '${d.packageName}' {
  interface ${d.customExtensionInterface} {
    'rating': RatingAddon;
  }
}

// Now valid in TS — \`kind: 'rating'\` is part of the ${d.inputComponentName} addon union.
{ type: 'input', key: 'review', addons: [{ slot: 'suffix', kind: 'rating', value: 4 }] }`;
  });

  protected readonly threeVariantsCode = computed(() => {
    const d = this.data();
    return `// 1. Built-in preset — JSON-safe, no code required.
{ slot: 'suffix', kind: '${d.buttonKind}', icon: '${d.clearIcon}', ariaLabel: 'Clear', preset: 'clear' }

// 2. Registered handler — JSON-safe, looked up by name.
{ slot: 'suffix', kind: '${d.buttonKind}', icon: '${d.searchIcon}', ariaLabel: 'Search', actionRef: 'runSearch' }

// 3. Inline function — code-only, dropped from JSON-derived configs by the validator.
{ slot: 'suffix', kind: '${d.buttonKind}', icon: '${d.clearIcon}', ariaLabel: 'Append marker',
  action: (ctx) => ctx.setValue?.(((typeof ctx.value === 'string' ? ctx.value : '') + '+')) }`;
  });

  protected readonly reactiveHiddenCode = computed(() => {
    const d = this.data();
    return `const hasValue = computed(() => (formValue()?.search?.length ?? 0) > 0);

{
  slot: 'suffix',
  kind: '${d.buttonKind}',
  icon: '${d.clearIcon}',
  ariaLabel: 'Clear',
  preset: 'clear',
  hidden: computed(() => !hasValue()),
}`;
  });

  protected readonly actionsWiringCode = computed(() => {
    const d = this.data();
    return `import { ApplicationConfig } from '@angular/core';
import { provideDynamicForm, provideAddonActions } from '@ng-forge/dynamic-forms';
import { ${d.withFieldsHelper} } from '${d.packageName}';

export const appConfig: ApplicationConfig = {
  providers: [
    provideDynamicForm(...${d.withFieldsHelper}()),
    provideAddonActions({
      runSearch: (ctx) => mySearchService.search(ctx.value),
      submitDraft: (ctx) => myDraftService.save(ctx.field.key, ctx.value),
    }),
  ],
};`;
  });

  protected readonly customKindInvocationCode = computed(() => {
    const d = this.data();
    return `import { ApplicationConfig } from '@angular/core';
import { provideDynamicForm, withCustomAddon } from '@ng-forge/dynamic-forms';
import { ${d.withFieldsHelper} } from '${d.packageName}';
import { RATING_KIND } from './rating-addon';

export const appConfig: ApplicationConfig = {
  providers: [
    provideDynamicForm(...${d.withFieldsHelper}(), withCustomAddon(RATING_KIND)),
  ],
};`;
  });
}
