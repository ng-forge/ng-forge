import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';

import { ActiveAdapterService } from '../../services/active-adapter.service';
import { CodeHighlightDirective } from '../../directives/code-highlight.directive';
import { CopyButtonComponent } from '../copy-button/copy-button.component';

type AdapterName = 'material' | 'bootstrap' | 'primeng' | 'ionic' | 'custom';

interface ConfigOption {
  name: string;
  type: string;
  default: string;
  description: string;
}

interface AdapterConfigData {
  providerFunction: string;
  configInterface: string;
  typeAlias: string;
  typeAliasImport: string;
  providerExample: string;
  formLevelExample: string;
  options: ConfigOption[];
}

const ADAPTER_CONFIG_DATA: Record<AdapterName, AdapterConfigData> = {
  material: {
    providerFunction: 'withMaterialFields',
    configInterface: 'MaterialConfig',
    typeAlias: 'MatFormConfig',
    typeAliasImport: '@ng-forge/dynamic-forms-material',
    providerExample: `provideDynamicForm(
  ...withMaterialFields({
    appearance: 'outline',
    subscriptSizing: 'dynamic',
    color: 'primary',
    disableRipple: false,
    labelPosition: 'after',
  })
)`,
    formLevelExample: `import { MatFormConfig } from '@ng-forge/dynamic-forms-material';

const config = {
  defaultProps: {
    appearance: 'fill',  // overrides the library-level setting
    color: 'accent',
  },
  fields: [
    { type: 'input', key: 'name', label: 'Name' },
    // This field overrides at field level:
    { type: 'input', key: 'email', label: 'Email', props: { appearance: 'outline' } },
  ],
} as const satisfies MatFormConfig;`,
    options: [
      { name: 'appearance', type: "'fill' | 'outline'", default: "'outline'", description: 'Default appearance for Material form fields' },
      {
        name: 'subscriptSizing',
        type: "'fixed' | 'dynamic'",
        default: "'dynamic'",
        description: 'Controls space reserved for hint/error messages',
      },
      { name: 'disableRipple', type: 'boolean', default: 'false', description: 'Disable Material ripple effects on interactive controls' },
      {
        name: 'color',
        type: "'primary' | 'accent' | 'warn'",
        default: "'primary'",
        description: 'Default theme color for checkboxes, radios, sliders, and toggles',
      },
      {
        name: 'labelPosition',
        type: "'before' | 'after'",
        default: "'after'",
        description: 'Default label position for checkboxes and radios',
      },
      {
        name: 'floatLabel',
        type: "'auto' | 'always' | 'never'",
        default: "'auto'",
        description: "Default float label behavior for Material form fields ('auto', 'always', or 'never')",
      },
      {
        name: 'hideRequiredMarker',
        type: 'boolean',
        default: 'false',
        description: 'Hide the required asterisk on form fields by default',
      },
    ],
  },
  bootstrap: {
    providerFunction: 'withBootstrapFields',
    configInterface: 'BootstrapConfig',
    typeAlias: 'BsFormConfig',
    typeAliasImport: '@ng-forge/dynamic-forms-bootstrap',
    providerExample: `provideDynamicForm(
  ...withBootstrapFields({
    size: 'sm',
    floatingLabel: true,
    variant: 'primary',
    outline: false,
    block: false,
  })
)`,
    formLevelExample: `import { BsFormConfig } from '@ng-forge/dynamic-forms-bootstrap';

const config = {
  defaultProps: {
    size: 'lg',        // overrides the library-level setting
    floatingLabel: false,
  },
  fields: [
    { type: 'input', key: 'name', label: 'Name' },
    { type: 'input', key: 'email', label: 'Email', props: { size: 'sm' } },
  ],
} as const satisfies BsFormConfig;`,
    options: [
      { name: 'size', type: "'sm' | 'lg'", default: 'undefined', description: 'Default size for form controls' },
      {
        name: 'floatingLabel',
        type: 'boolean',
        default: 'false',
        description: 'Use Bootstrap floating label style on text inputs and select',
      },
      {
        name: 'variant',
        type: "'primary' | 'secondary' | 'success' | 'danger' | ...",
        default: "'primary'",
        description: 'Default Bootstrap color variant for buttons',
      },
      { name: 'outline', type: 'boolean', default: 'false', description: 'Render buttons as outlined by default' },
      { name: 'block', type: 'boolean', default: 'false', description: 'Render buttons as block-level (full width) by default' },
    ],
  },
  primeng: {
    providerFunction: 'withPrimeNGFields',
    configInterface: 'PrimeNGConfig',
    typeAlias: 'PrimeFormConfig',
    typeAliasImport: '@ng-forge/dynamic-forms-primeng',
    providerExample: `provideDynamicForm(
  ...withPrimeNGFields({
    size: 'small',
    variant: 'outlined',
    severity: 'primary',
    text: false,
    outlined: false,
    raised: false,
    rounded: false,
  })
)`,
    formLevelExample: `import { PrimeFormConfig } from '@ng-forge/dynamic-forms-primeng';

const config = {
  defaultProps: {
    variant: 'filled',  // overrides the library-level setting
    size: 'large',
  },
  fields: [
    { type: 'input', key: 'name', label: 'Name' },
    { type: 'input', key: 'email', label: 'Email', props: { variant: 'outlined' } },
  ],
} as const satisfies PrimeFormConfig;`,
    options: [
      { name: 'size', type: "'small' | 'large'", default: 'undefined', description: 'Default size variant for form inputs' },
      { name: 'variant', type: "'outlined' | 'filled'", default: "'outlined'", description: 'Default visual variant for form inputs' },
      {
        name: 'severity',
        type: "'primary' | 'secondary' | 'success' | 'danger' | ...",
        default: "'primary'",
        description: 'Default severity (color) for buttons',
      },
      { name: 'text', type: 'boolean', default: 'false', description: 'Render buttons as text-only by default' },
      { name: 'outlined', type: 'boolean', default: 'false', description: 'Render buttons with outlined style by default' },
      { name: 'raised', type: 'boolean', default: 'false', description: 'Apply raised shadow effect to buttons by default' },
      { name: 'rounded', type: 'boolean', default: 'false', description: 'Apply rounded corners to buttons by default' },
    ],
  },
  ionic: {
    providerFunction: 'withIonicFields',
    configInterface: 'IonicConfig',
    typeAlias: 'IonicFormConfig',
    typeAliasImport: '@ng-forge/dynamic-forms-ionic',
    providerExample: `provideDynamicForm(
  ...withIonicFields({
    fill: 'outline',
    shape: undefined,
    labelPlacement: 'floating',
    color: 'primary',
    size: 'default',
    expand: undefined,
    buttonFill: 'solid',
    strong: false,
  })
)`,
    formLevelExample: `import { IonicFormConfig } from '@ng-forge/dynamic-forms-ionic';

const config = {
  defaultProps: {
    fill: 'solid',     // overrides the library-level setting
    labelPlacement: 'stacked',
  },
  fields: [
    { type: 'input', key: 'name', label: 'Name' },
    { type: 'input', key: 'email', label: 'Email', props: { fill: 'outline' } },
  ],
} as const satisfies IonicFormConfig;`,
    options: [
      { name: 'fill', type: "'solid' | 'outline'", default: "'solid'", description: 'Default fill style for form inputs' },
      { name: 'shape', type: "'round'", default: 'undefined', description: 'Default shape for form controls' },
      {
        name: 'labelPlacement',
        type: "'start' | 'end' | 'fixed' | 'stacked' | 'floating'",
        default: "'start'",
        description: 'Default label position relative to inputs',
      },
      {
        name: 'color',
        type: "'primary' | 'secondary' | 'tertiary' | ...",
        default: "'primary'",
        description: 'Default Ionic color theme for form controls',
      },
      {
        name: 'size',
        type: "'small' | 'default' | 'large'",
        default: "'default'",
        description: 'Default size for buttons',
      },
      { name: 'expand', type: "'full' | 'block'", default: 'undefined', description: 'Default expand behavior for buttons' },
      {
        name: 'buttonFill',
        type: "'clear' | 'outline' | 'solid' | 'default'",
        default: "'solid'",
        description: 'Default fill style for buttons (overrides general fill)',
      },
      { name: 'strong', type: 'boolean', default: 'false', description: 'Render buttons in bold (strong) by default' },
    ],
  },
  custom: {
    providerFunction: 'withCustomFields',
    configInterface: '(your config interface)',
    typeAlias: '(your form config type)',
    typeAliasImport: '(your adapter package)',
    providerExample: `// Define your own config interface:
export interface MyAdapterConfig {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'lg';
}

// Pass it to withCustomFields():
provideDynamicForm(
  ...withCustomFields({ variant: 'primary', size: 'sm' })
)`,
    formLevelExample: `// Define a typed FormConfig alias using your config:
import { FormConfig } from '@ng-forge/dynamic-forms';
import { MyAdapterConfig } from './my-adapter';

type MyFormConfig = FormConfig<any, any, MyAdapterConfig>;

const config = {
  defaultProps: {
    variant: 'secondary',
  },
  fields: [
    { type: 'my-input', key: 'name', label: 'Name' },
  ],
} as const satisfies MyFormConfig;`,
    options: [],
  },
};

@Component({
  selector: 'docs-configuration-view',
  imports: [CodeHighlightDirective, CopyButtonComponent],
  template: `
    <div class="config-view">
      @if (data().options.length > 0) {
        <section class="config-view__section">
          <h3 class="config-view__heading">Config Options</h3>
          <p class="config-view__desc">
            Pass these to
            <code>{{ data().providerFunction }}(&#123; ... &#125;)</code>
            for library-level defaults, or to <code>defaultProps</code> for form-level defaults.
          </p>
          <div class="table-scroll">
            <table class="config-view__table">
              <thead>
                <tr>
                  <th>Option</th>
                  <th>Type</th>
                  <th>Default</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                @for (opt of data().options; track opt.name) {
                  <tr>
                    <td>
                      <code>{{ opt.name }}</code>
                    </td>
                    <td>
                      <code>{{ opt.type }}</code>
                    </td>
                    <td>
                      <code>{{ opt.default }}</code>
                    </td>
                    <td>{{ opt.description }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </section>
      } @else {
        <section class="config-view__section">
          <h3 class="config-view__heading">Custom Adapter Config</h3>
          <p class="config-view__desc">
            Custom adapters define their own config interface. The cascade pattern works the same way — implement a config merger in your
            adapter to support library-level and form-level defaults. See
            <a href="/building-an-adapter">Building an Adapter</a> for a full guide.
          </p>
        </section>
      }

      <section class="config-view__section">
        <h3 class="config-view__heading">Library-level (provider)</h3>
        <div class="config-view__code">
          <docs-copy-button [code]="data().providerExample" />
          <div [codeHighlight]="data().providerExample"></div>
        </div>
      </section>

      <section class="config-view__section">
        <h3 class="config-view__heading">Form-level (defaultProps)</h3>
        <p class="config-view__desc">
          Use <code>{{ data().typeAlias }}</code> from <code>{{ data().typeAliasImport }}</code> for type-safe
          <code>defaultProps</code> with autocomplete.
        </p>
        <div class="config-view__code">
          <docs-copy-button [code]="data().formLevelExample" />
          <div [codeHighlight]="data().formLevelExample"></div>
        </div>
      </section>
    </div>
  `,
  styleUrl: './configuration-view.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class DocsConfigurationViewComponent {
  private readonly activeAdapter = inject(ActiveAdapterService);

  readonly data = computed(() => ADAPTER_CONFIG_DATA[this.activeAdapter.adapter() as AdapterName]);
}
