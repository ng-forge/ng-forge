import { FormConfig } from '@ng-forge/dynamic-forms';

type ConcreteAdapter = 'material' | 'bootstrap' | 'primeng' | 'ionic' | 'native';

const ICON_NAME: Record<ConcreteAdapter, { search: string; clear: string }> = {
  material: { search: 'search', clear: 'close' },
  bootstrap: { search: 'search', clear: 'x' },
  primeng: { search: 'search', clear: 'times' },
  ionic: { search: 'search-outline', clear: 'close-outline' },
  native: { search: 'search', clear: 'close' },
};

const ICON_TYPE: Record<ConcreteAdapter, string> = {
  material: 'mat-icon',
  bootstrap: 'bs-icon',
  primeng: 'prime-icon',
  ionic: 'ion-icon',
  // The native fields have no addons yet; the docs show that instead of the form.
  native: 'icon',
};

const BUTTON_TYPE: Record<ConcreteAdapter, string> = {
  material: 'mat-button',
  bootstrap: 'bs-button',
  primeng: 'prime-button',
  ionic: 'ion-button',
  native: 'button',
};

export function addonClearButtonConfig(adapter: ConcreteAdapter): FormConfig {
  const icons = ICON_NAME[adapter];
  return {
    fields: [
      {
        key: 'search',
        type: 'input',
        label: 'Search',
        value: 'initial value',
        placeholder: 'Type to search…',
        addons: [
          { slot: 'prefix', type: ICON_TYPE[adapter], icon: icons.search, ariaLabel: 'Search' },
          { slot: 'suffix', type: BUTTON_TYPE[adapter], icon: icons.clear, ariaLabel: 'Clear', preset: 'clear' },
        ],
      },
    ],
  } as FormConfig;
}
