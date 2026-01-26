Dynamic Forms supports internationalization through Angular's reactive primitives: **Observables** and **Signals**. It's framework-agnostic - use any translation library that provides these types.

## How i18n Works

Dynamic Forms uses the `DynamicText` type for all text properties:

```typescript
type DynamicText = string | Observable<string> | Signal<string>;
```

Any property that accepts text (`label`, `placeholder`, `validationMessages`, and UI-integration specific props like `hint`) accepts:

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

## Default Validation Messages

Define common validation messages once at the form level using `defaultValidationMessages`. These act as fallback messages when fields don't have their own custom `validationMessages`:

```typescript
import { Component, inject } from '@angular/core';

@Component({...})
export class MyFormComponent {
  translationService = inject(YourTranslationService);

  config = {
    // Define default messages for all fields
    defaultValidationMessages: {
      required: this.translationService.translate('validation.required'),
      email: this.translationService.translate('validation.email'),
      minLength: this.translationService.translate('validation.minLength'),
      maxLength: this.translationService.translate('validation.maxLength'),
    },
    fields: [
      {
        key: 'email',
        type: 'input',
        label: this.translationService.translate('form.email'),
        email: true,
        required: true,
        // Uses defaultValidationMessages for required and email errors
      },
      {
        key: 'password',
        type: 'input',
        label: this.translationService.translate('form.password'),
        required: true,
        minLength: 8,
        // Override default for this field only
        validationMessages: {
          required: this.translationService.translate('validation.password.required'),
          minLength: this.translationService.translate('validation.password.minLength'),
        },
      },
      {
        key: 'username',
        type: 'input',
        label: this.translationService.translate('form.username'),
        required: true,
        minLength: 3,
        // Uses default for both required and minLength
      },
    ],
  };
}
```

The message resolution priority is:

1. **Field-level** `validationMessages` (highest priority)
2. **Form-level** `defaultValidationMessages` (fallback)
3. **No message** - If neither is provided, the error is not displayed and a warning is logged to the console

This approach is especially useful when you have many fields with the same validation rules - define the translations once instead of repeating them for each field.

## Example with Transloco

Here's a complete example using [@jsverse/transloco](https://jsverse.github.io/transloco/):

```typescript name="app.config.ts"
import { ApplicationConfig } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideTransloco } from '@jsverse/transloco';
import { provideDynamicForm } from '@ng-forge/dynamic-forms';
import { withMaterialFields } from '@ng-forge/dynamic-forms-material';

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

```typescript name="my-form.component.ts"
import { Component, inject } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { DynamicForm } from '@ng-forge/dynamic-forms';

@Component({
  selector: 'app-my-form',
  imports: [DynamicForm],
  template: ` <form [dynamic-form]="formConfig"></form> `,
})
export class MyFormComponent {
  transloco = inject(TranslocoService);

  formConfig = {
    // Define default validation messages for all fields
    defaultValidationMessages: {
      required: this.transloco.selectTranslate('validation.required'),
      email: this.transloco.selectTranslate('validation.email'),
    },
    fields: [
      {
        key: 'username',
        type: 'input',
        label: this.transloco.selectTranslate('form.username'),
        value: '',
        required: true,
        // Uses defaultValidationMessages for required
      },
      {
        key: 'email',
        type: 'input',
        label: this.transloco.selectTranslate('form.email'),
        value: '',
        required: true,
        email: true,
        // Uses defaultValidationMessages for required and email
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

Use Angular signals for translations by wrapping the config in `computed()`:

```typescript
import { Component, signal, computed } from '@angular/core';

@Component({...})
export class MyFormComponent {
  currentLang = signal<'en' | 'es'>('en');

  translations = computed(() => ({
    en: {
      username: 'Username',
      email: 'Email',
      required: 'This field is required',
      email_format: 'Please enter a valid email address',
    },
    es: {
      username: 'Nombre de usuario',
      email: 'Correo electrónico',
      required: 'Este campo es obligatorio',
      email_format: 'Por favor ingrese una dirección de correo válida',
    },
  }[this.currentLang()]));

  // Wrap entire config in computed() - rebuilds when language changes
  formConfig = computed(() => ({
    defaultValidationMessages: {
      required: this.translations().required,
      email: this.translations().email_format,
    },
    fields: [
      {
        key: 'username',
        type: 'input',
        label: this.translations().username,
        value: '',
        required: true,
      },
      {
        key: 'email',
        type: 'input',
        label: this.translations().email,
        value: '',
        required: true,
        email: true,
      },
    ],
  }));

  switchLanguage(lang: 'en' | 'es') {
    this.currentLang.set(lang);
    // Config recomputes → form updates with new translations
  }
}
```

**How it works:** The `computed()` wrapper tracks the `currentLang` signal dependency. When `currentLang` changes, the entire config is recomputed with new translation values, and the form updates automatically.

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

Dynamic Forms works with any library that provides Observables or Signals:

**ngx-translate:**

```typescript
label: this.translate.get('form.username'); // Observable<string>
```

**Custom service:**

```typescript
label: this.myTranslationService.translate('key'); // Observable<string> or Signal<string>
```

The key is that your translation method returns `Observable<string>` or `Signal<string>`.
