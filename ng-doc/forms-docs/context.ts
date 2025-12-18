// @ts-nocheck
import { Provider } from '@angular/core';
import { NG_DOC_CONTEXT, NG_DOC_ROUTE_PREFIX, NG_DOC_SHIKI_THEME } from '@ng-doc/app/tokens';

export function provideNgDocContext(): Provider[] {
  return [
    {
      provide: NG_DOC_CONTEXT,
      useValue: {
        navigation: [],
      },
    },
    {
      provide: NG_DOC_ROUTE_PREFIX,
      useValue: '',
    },
    {
      provide: NG_DOC_SHIKI_THEME,
      useValue: {
        light: '',
        dark: '',
      },
    },
  ];
}
