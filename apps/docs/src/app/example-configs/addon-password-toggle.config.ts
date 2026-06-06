import { FormConfig } from '@ng-forge/dynamic-forms';

type ConcreteAdapter = 'material' | 'bootstrap' | 'primeng' | 'ionic';

const ICON_NAME: Record<ConcreteAdapter, string> = {
  material: 'visibility',
  bootstrap: 'eye',
  primeng: 'eye',
  ionic: 'eye-outline',
};

const BUTTON_TYPE: Record<ConcreteAdapter, string> = {
  material: 'mat-button',
  bootstrap: 'bs-button',
  primeng: 'prime-button',
  ionic: 'ion-button',
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
