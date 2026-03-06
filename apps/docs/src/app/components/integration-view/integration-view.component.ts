import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { NgDocCopyButtonComponent } from '@ng-doc/app/components/copy-button';
import { ActiveAdapterService } from '../../services/active-adapter.service';
import { CodeHighlightDirective } from '../../directives/code-highlight.directive';
import { DocsInstallCommandComponent } from '../install-command/install-command.component';

type AdapterName = 'material' | 'bootstrap' | 'primeng' | 'ionic' | 'custom';

interface IntegrationData {
  packages: string;
  stylesCode?: string;
  setupCode: string;
  features: { name: string; description: string }[];
}

const INTEGRATION_DATA: Record<AdapterName, IntegrationData> = {
  custom: {
    packages: '@ng-forge/dynamic-forms',
    setupCode: `import { provideDynamicForm } from '@ng-forge/dynamic-forms';
import { withCustomFields } from './my-custom-fields';

export const appConfig: ApplicationConfig = {
  providers: [
    provideDynamicForm(...withCustomFields()),
  ],
};`,
    features: [
      { name: 'FieldTypeDefinition', description: 'Define a field type with a key, component, and optional mapper' },
      { name: 'ValueFieldComponent', description: 'Implement value-based fields by handling value and valueChange signals' },
      {
        name: 'CheckedFieldComponent',
        description: 'Implement checked-based fields (checkbox, toggle) with checked and checkedChange signals',
      },
      { name: 'withCustomFields()', description: 'Bundle your field definitions into a provider factory alongside withMaterialFields()' },
    ],
  },
  material: {
    packages: '@ng-forge/dynamic-forms @ng-forge/dynamic-forms-material @angular/material @angular/cdk',
    setupCode: `import { provideDynamicForm } from '@ng-forge/dynamic-forms';
import { withMaterialFields } from '@ng-forge/dynamic-forms-material';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(),
    provideDynamicForm(...withMaterialFields()),
  ],
};`,
    features: [
      { name: 'appearance', description: "Set 'fill' or 'outline' on text inputs, select, and datepicker via the appearance prop" },
      { name: 'color', description: "Apply Material theme palette ('primary', 'accent', 'warn') to radio, checkbox, toggle, and slider" },
      { name: 'labelPosition', description: "Control label placement ('before' | 'after') on radio, checkbox, toggle, and multi-checkbox" },
      { name: 'hint', description: 'Show helper text below any field via the hint prop' },
      { name: 'thumbLabel', description: 'Display the current value above the slider thumb' },
    ],
  },
  bootstrap: {
    packages: '@ng-forge/dynamic-forms @ng-forge/dynamic-forms-bootstrap bootstrap',
    stylesCode: `// styles.scss
@import 'bootstrap/dist/css/bootstrap.min.css';`,
    setupCode: `import { provideDynamicForm } from '@ng-forge/dynamic-forms';
import { withBootstrapFields } from '@ng-forge/dynamic-forms-bootstrap';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(),
    provideDynamicForm(...withBootstrapFields()),
  ],
};`,
    features: [
      { name: 'floatingLabel', description: 'Enable Bootstrap 5 floating label style on text inputs and select' },
      { name: 'size', description: "Apply 'sm' or 'lg' sizing to inputs, select, and datepicker" },
      { name: 'switch', description: 'Render checkbox and multi-checkbox as Bootstrap switch toggles' },
      { name: 'buttonGroup', description: 'Render radio options as a Bootstrap button group' },
      { name: 'hint', description: 'Show helper text below any field via the hint prop' },
    ],
  },
  primeng: {
    packages: '@ng-forge/dynamic-forms @ng-forge/dynamic-forms-primeng primeng',
    stylesCode: `// styles.scss
@import 'primeicons/primeicons.css';`,
    setupCode: `import { provideDynamicForm } from '@ng-forge/dynamic-forms';
import { withPrimeNGFields } from '@ng-forge/dynamic-forms-primeng';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(),
    providePrimeNG({ theme: { preset: Aura } }),
    provideDynamicForm(...withPrimeNGFields()),
  ],
};`,
    features: [
      { name: 'variant', description: "Switch input between 'outlined' and 'filled' styles" },
      { name: 'filter', description: 'Add a search filter inside the select dropdown' },
      { name: 'selectionMode', description: "Datepicker supports 'single', 'multiple', or 'range' selection" },
      { name: 'range', description: 'Enable dual-handle range mode on slider' },
      { name: 'hint', description: 'Show helper text below any field via the hint prop' },
    ],
  },
  ionic: {
    packages: '@ng-forge/dynamic-forms @ng-forge/dynamic-forms-ionic @ionic/angular',
    stylesCode: `// styles.scss
@import '@ionic/angular/css/core.css';
@import '@ionic/angular/css/normalize.css';
@import '@ionic/angular/css/structure.css';
@import '@ionic/angular/css/typography.css';`,
    setupCode: `import { provideDynamicForm } from '@ng-forge/dynamic-forms';
import { withIonicFields } from '@ng-forge/dynamic-forms-ionic';
import { provideIonicAngular } from '@ionic/angular/standalone';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(),
    provideIonicAngular({ mode: 'md' }),
    provideDynamicForm(...withIonicFields()),
  ],
};`,
    features: [
      { name: 'labelPlacement', description: "Position labels as 'start', 'end', 'fixed', 'stacked', or 'floating' on all field types" },
      { name: 'fill', description: "Choose 'solid' or 'outline' fill style for inputs, textarea, and select" },
      { name: 'interface', description: "Select picker presentation: 'action-sheet', 'popover', or 'alert'" },
      { name: 'presentation', description: "Datepicker format: 'date', 'date-time', 'time', 'month-year', 'year'" },
      { name: 'dualKnobs', description: 'Enable two-handle range mode on slider' },
    ],
  },
};

@Component({
  selector: 'docs-integration-view',
  imports: [DocsInstallCommandComponent, NgDocCopyButtonComponent, CodeHighlightDirective],
  templateUrl: './integration-view.component.html',
  styleUrl: './integration-view.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocsIntegrationViewComponent {
  private readonly activeAdapter = inject(ActiveAdapterService);

  readonly data = computed(() => INTEGRATION_DATA[this.activeAdapter.adapter() as AdapterName]);
}
