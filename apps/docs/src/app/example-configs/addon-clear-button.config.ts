import { FormConfig } from '@ng-forge/dynamic-forms';

type ConcreteAdapter = 'material' | 'bootstrap' | 'primeng' | 'ionic';

const ICON_NAME: Record<ConcreteAdapter, { search: string; clear: string }> = {
  material: { search: 'search', clear: 'close' },
  bootstrap: { search: 'search', clear: 'x' },
  primeng: { search: 'search', clear: 'times' },
  ionic: { search: 'search-outline', clear: 'close-outline' },
};

const ICON_KIND: Record<ConcreteAdapter, string> = {
  material: 'mat-icon',
  bootstrap: 'bs-icon',
  primeng: 'prime-icon',
  ionic: 'ion-icon',
};

const BUTTON_KIND: Record<ConcreteAdapter, string> = {
  material: 'mat-button',
  bootstrap: 'bs-button',
  primeng: 'prime-button',
  ionic: 'ion-button',
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
          { slot: 'prefix', kind: ICON_KIND[adapter], icon: icons.search, ariaLabel: 'Search' },
          { slot: 'suffix', kind: BUTTON_KIND[adapter], icon: icons.clear, ariaLabel: 'Clear', preset: 'clear' },
        ],
      },
    ],
  } as FormConfig;
}
