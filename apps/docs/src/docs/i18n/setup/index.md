ng-forge supports internationalization through Angular's reactive primitives: **Observables** and **Signals**. It's framework-agnostic - use any translation library that provides these types.

## How i18n Works

ng-forge uses the `DynamicText` type for all text properties:

```typescript
type DynamicText = string | Observable<string> | Signal<string>;
```

Any property that accepts text (`label`, `placeholder`, `hint`, `validationMessages`, etc.) accepts:

- Static strings
- Observables (from translation libraries like Transloco, ngx-translate, etc.)
- Signals

## Basic Example

With any translation service that returns Observables:

```typescript
import { Component, inject } from '@angular/core';

@Component({...})
export class MyFormComponent {
  translationService = inject(YourTranslationService);

  config = {
    fields: [
      {
        key: 'firstName',
        type: 'input',
        label: this.translationService.translate('form.firstName'), // Observable<string>
        value: '',
      },
      {
        key: 'email',
        type: 'input',
        label: this.translationService.translate('form.email'),
        email: true,
        validationMessages: {
          required: this.translationService.translate('validation.required'),
          email: this.translationService.translate('validation.email'),
        },
        value: '',
      },
    ],
  };
}
```

The form automatically updates when translations change.

## Example with Transloco

Here's a complete example using [@jsverse/transloco](https://jsverse.github.io/transloco/):

```typescript
// app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideTransloco } from '@jsverse/transloco';
import { provideDynamicForm } from '@ng-forge/dynamic-form';
import { withMaterialFields } from '@ng-forge/dynamic-form-material';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    provideTransloco({
      config: {
        availableLangs: ['en', 'es'],
        defaultLang: 'en',
        reRenderOnLangChange: true,
      },
      loader: TranslocoHttpLoader,
    }),
    provideDynamicForm(...withMaterialFields()),
  ],
};
```

```typescript
// my-form.component.ts
import { Component, inject } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { DynamicForm } from '@ng-forge/dynamic-form';

@Component({
  selector: 'app-my-form',
  imports: [DynamicForm],
  template: ` <dynamic-form [config]="formConfig" /> `,
})
export class MyFormComponent {
  transloco = inject(TranslocoService);

  formConfig = {
    fields: [
      {
        key: 'username',
        type: 'input',
        label: this.transloco.selectTranslate('form.username'),
        value: '',
        required: true,
        validationMessages: {
          required: this.transloco.selectTranslate('validation.required'),
        },
      },
    ],
  };

  // Optional: Switch languages
  changeLanguage(lang: string) {
    this.transloco.setActiveLang(lang);
    // Form automatically updates due to reRenderOnLangChange: true
  }
}
```

## Example with Signals

Use Angular signals for translations:

```typescript
import { Component, signal, computed } from '@angular/core';

@Component({...})
export class MyFormComponent {
  currentLang = signal<'en' | 'es'>('en');

  translations = computed(() => ({
    en: {
      username: 'Username',
      required: 'This field is required',
    },
    es: {
      username: 'Nombre de usuario',
      required: 'Este campo es obligatorio',
    },
  }[this.currentLang()]));

  formConfig = computed(() => ({
    fields: [
      {
        key: 'username',
        type: 'input',
        label: this.translations().username,  // Signal<string>
        value: '',
        required: true,
        validationMessages: {
          required: this.translations().required,
        },
      },
    ],
  }));

  switchLanguage(lang: 'en' | 'es') {
    this.currentLang.set(lang);
    // Form automatically updates
  }
}
```

## Translated Select Options

Options also support `DynamicText`:

```typescript
{
  key: 'country',
  type: 'select',
  label: translationService.translate('form.country'),
  value: '',
  options: translationService.translate('countries').pipe(
    map(countries => [
      { value: 'us', label: countries.us },
      { value: 'es', label: countries.es },
    ])
  ),
}
```

## Other Translation Libraries

ng-forge works with any library that provides Observables or Signals:

**ngx-translate:**

```typescript
label: this.translate.get('form.username'); // Observable<string>
```

**Custom service:**

```typescript
label: this.myTranslationService.translate('key'); // Observable<string> or Signal<string>
```

The key is that your translation method returns `Observable<string>` or `Signal<string>`.
