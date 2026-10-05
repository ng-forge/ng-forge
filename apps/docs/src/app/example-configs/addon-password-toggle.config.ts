import { FormConfig } from '@ng-forge/dynamic-forms';

type ConcreteAdapter = 'material' | 'bootstrap' | 'primeng' | 'ionic' | 'native';

const ICON_NAME: Record<ConcreteAdapter, string> = {
  material: 'visibility',
  bootstrap: 'eye',
  primeng: 'eye',
  ionic: 'eye-outline',
  native: 'eye',
};

const BUTTON_TYPE: Record<ConcreteAdapter, string> = {
  material: 'mat-button',
  bootstrap: 'bs-button',
  primeng: 'prime-button',
  ionic: 'ion-button',
  // The native fields have no addons yet; the docs show that instead of the form.
  native: 'button',
};

export function addonPasswordToggleConfig(adapter: ConcreteAdapter): FormConfig {
  return {
    fields: [
      {
        key: 'password',
        type: 'input',
        label: 'Password',
        value: 'hunter2',
        props: { type: 'password' },
        addons: [
          {
            slot: 'suffix',
            type: BUTTON_TYPE[adapter],
            icon: ICON_NAME[adapter],
            ariaLabel: 'Toggle password visibility',
            preset: 'toggle-password-visibility',
          },
        ],
      },
    ],
  } as FormConfig;
}
