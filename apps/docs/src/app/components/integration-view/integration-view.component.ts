import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';

import { ActiveAdapterService } from '../../services/active-adapter.service';
import { CodeHighlightDirective } from '../../directives/code-highlight.directive';
import { DocsInstallCommandComponent } from '../install-command/install-command.component';
import { CopyButtonComponent } from '../copy-button/copy-button.component';

type AdapterName = 'material' | 'bootstrap' | 'primeng' | 'ionic' | 'custom';

interface IntegrationData {
  packages: string;
  stylesCode?: string;
  setupCode: string;
  featuresTitle: string;
  features: { name: string; description: string }[];
}

const INTEGRATION_DATA: Record<AdapterName, IntegrationData> = {
  material: {
    packages: '@ng-forge/dynamic-forms @ng-forge/dynamic-forms-material @angular/material @angular/cdk',
    stylesCode: `// styles.scss — add a prebuilt Material theme (required)
@import '@angular/material/prebuilt-themes/azure-blue.css';`,
    setupCode: `import { provideDynamicForm } from '@ng-forge/dynamic-forms';
import { withMaterialFields } from '@ng-forge/dynamic-forms-material';
import { provideAnimations } from '@angular/platform-browser/animations';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(),
    provideDynamicForm(...withMaterialFields()),
  ],
};`,
    featuresTitle: 'Notable Adapter Props',
    features: [
      { name: 'appearance', description: "Set 'fill' or 'outline' on text inputs, select, and datepicker" },
      { name: 'color', description: "Theme palette ('primary', 'accent', 'warn') for checkbox, toggle, radio, and slider" },
      { name: 'labelPosition', description: "Label placement ('before' | 'after') on checkbox, radio, and multi-checkbox" },
      { name: 'subscriptSizing', description: "'fixed' reserves space for hint/error; 'dynamic' collapses when empty" },
      { name: 'floatLabel', description: "'auto', 'always', or 'never' label float behavior" },
      { name: 'hideRequiredMarker', description: 'Hide the required asterisk on form fields' },
      { name: 'hint', description: 'Helper text below any field' },
    ],
  },
  bootstrap: {
    packages: '@ng-forge/dynamic-forms @ng-forge/dynamic-forms-bootstrap bootstrap',
    stylesCode: `// styles.scss
@import 'bootstrap/dist/css/bootstrap.min.css';`,
    setupCode: `import { provideDynamicForm } from '@ng-forge/dynamic-forms';
import { withBootstrapFields } from '@ng-forge/dynamic-forms-bootstrap';
import { provideAnimations } from '@angular/platform-browser/animations';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(),
    provideDynamicForm(...withBootstrapFields()),
  ],
};`,
    featuresTitle: 'Notable Adapter Props',
    features: [
      { name: 'floatingLabel', description: 'Bootstrap 5 floating label style on text inputs and select' },
      { name: 'size', description: "'sm' or 'lg' sizing for inputs, select, and datepicker" },
      { name: 'switch', description: 'Render checkbox and multi-checkbox as Bootstrap switch toggles' },
      { name: 'buttonGroup', description: 'Render radio options as a Bootstrap button group' },
      { name: 'hint', description: 'Helper text below any field' },
    ],
  },
  primeng: {
    packages: '@ng-forge/dynamic-forms @ng-forge/dynamic-forms-primeng primeng @primeng/themes primeicons',
    stylesCode: `// styles.scss
@import 'primeicons/primeicons.css';`,
    setupCode: `import { provideDynamicForm } from '@ng-forge/dynamic-forms';
import { withPrimeNGFields } from '@ng-forge/dynamic-forms-primeng';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';
import { provideAnimations } from '@angular/platform-browser/animations';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(),
    providePrimeNG({ theme: { preset: Aura } }),
    provideDynamicForm(...withPrimeNGFields()),
  ],
};`,
    featuresTitle: 'Notable Adapter Props',
    features: [
      { name: 'variant', description: "Switch inputs between 'outlined' and 'filled' styles" },
      { name: 'size', description: "'small' or 'large' size variant for form inputs" },
      { name: 'filter', description: 'Search filter inside the select dropdown' },
      { name: 'selectionMode', description: "Datepicker supports 'single', 'multiple', or 'range' selection" },
      { name: 'range', description: 'Dual-handle range mode on slider' },
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
import { provideAnimations } from '@angular/platform-browser/animations';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(),
    provideIonicAngular({ mode: 'md' }),
    provideDynamicForm(...withIonicFields()),
  ],
};`,
    featuresTitle: 'Notable Adapter Props',
    features: [
      { name: 'labelPlacement', description: "Label position: 'start', 'end', 'fixed', 'stacked', or 'floating'" },
      { name: 'fill', description: "'solid' or 'outline' fill style for inputs, textarea, and select" },
      { name: 'interface', description: "Select picker: 'action-sheet', 'popover', or 'alert'" },
      { name: 'presentation', description: "Datepicker format: 'date', 'date-time', 'time', 'month-year', 'year'" },
      { name: 'dualKnobs', description: 'Two-handle range mode on slider' },
    ],
  },
  custom: {
    packages: '@ng-forge/dynamic-forms',
    setupCode: `import { provideDynamicForm } from '@ng-forge/dynamic-forms';
import { withCustomFields } from './my-adapter/my-custom-fields';

export const appConfig: ApplicationConfig = {
  providers: [
    provideDynamicForm(...withCustomFields()),
  ],
};`,
    featuresTitle: 'What to Implement',
    features: [
      { name: 'FieldTypeDefinition', description: 'A field key, the Angular component to render, and an optional value mapper' },
      { name: 'ValueFieldComponent', description: 'Implement value-based fields using the value() input and valueChange() output signals' },
      {
        name: 'CheckedFieldComponent',
        description: 'Implement checked-based fields (checkbox, toggle) via the checked() and checkedChange() signals',
      },
      {
        name: 'withCustomFields()',
        description: 'Bundle your field definitions into a provider factory — mirrors withMaterialFields() in structure',
      },
    ],
  },
};

@Component({
  selector: 'docs-integration-view',
  imports: [DocsInstallCommandComponent, CodeHighlightDirective, CopyButtonComponent],
  templateUrl: './integration-view.component.html',
  styleUrl: './integration-view.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class DocsIntegrationViewComponent {
  private readonly activeAdapter = inject(ActiveAdapterService);

  readonly data = computed(() => INTEGRATION_DATA[this.activeAdapter.adapter() as AdapterName]);
}
