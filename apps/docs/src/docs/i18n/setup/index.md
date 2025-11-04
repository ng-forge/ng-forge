# i18n Setup

Configure internationalization for form labels, hints, validation messages, and field options.

## Angular i18n Integration

ng-forge integrates with Angular's i18n system.

### 1. Configure Angular i18n

```typescript
// app.config.ts
import { provideHttpClient } from '@angular/common/http';
import { provideTransloco } from '@jsverse/transloco';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    provideTransloco({
      config: {
        availableLangs: ['en', 'es', 'fr', 'de'],
        defaultLang: 'en',
        reRenderOnLangChange: true,
      },
      loader: TranslocoHttpLoader,
    }),
    provideDynamicForm(),
  ],
};
```

### 2. Translation Files

Create translation files for each language:

```json
// assets/i18n/en.json
{
  "form": {
    "labels": {
      "firstName": "First Name",
      "lastName": "Last Name",
      "email": "Email Address"
    },
    "placeholders": {
      "email": "Enter your email"
    },
    "hints": {
      "email": "We'll never share your email"
    }
  },
  "validation": {
    "required": "This field is required",
    "email": "Invalid email address",
    "minLength": "Minimum {length} characters"
  }
}
```

```json
// assets/i18n/es.json
{
  "form": {
    "labels": {
      "firstName": "Nombre",
      "lastName": "Apellido",
      "email": "Correo Electrónico"
    },
    "placeholders": {
      "email": "Ingrese su correo"
    },
    "hints": {
      "email": "Nunca compartiremos su correo"
    }
  },
  "validation": {
    "required": "Este campo es obligatorio",
    "email": "Dirección de correo inválida",
    "minLength": "Mínimo {length} caracteres"
  }
}
```

## Form Configuration with i18n

Use translation keys in field configuration:

```typescript
import { TranslocoService } from '@jsverse/transloco';

@Component({...})
export class MyFormComponent {
  transloco = inject(TranslocoService);

  config = {
    fields: [
      {
        key: 'firstName',
        type: 'input',
        label: this.transloco.selectTranslate('form.labels.firstName'),
        props: {
          placeholder: this.transloco.selectTranslate('form.placeholders.firstName'),
        },
      },
      {
        key: 'email',
        type: 'input',
        label: this.transloco.selectTranslate('form.labels.email'),
        email: true,
        props: {
          hint: this.transloco.selectTranslate('form.hints.email'),
        },
      },
    ],
  };
}
```

## Translated Validation Messages

Configure validation messages:

```typescript
import { provideValidationMessages } from '@ng-forge/dynamic-form';
import { TranslocoService } from '@jsverse/transloco';

export function provideTranslatedValidation() {
  return provideValidationMessages((errors, transloco: TranslocoService) => {
    const key = Object.keys(errors)[0];
    return transloco.translate(`validation.${key}`, errors[key]);
  });
}
```

## Translated Select Options

Translate dropdown options:

```typescript
{
  key: 'country',
  type: 'select',
  label: this.transloco.selectTranslate('form.labels.country'),
  options: this.transloco.selectTranslateObject('countries').pipe(
    map(translations => [
      { value: 'us', label: translations.us },
      { value: 'es', label: translations.es },
      { value: 'fr', label: translations.fr },
    ])
  ),
}
```

## Language Switching

Switch languages at runtime:

```typescript
@Component({
  template: `
    <select (change)="changeLanguage($event)">
      <option value="en">English</option>
      <option value="es">Español</option>
      <option value="fr">Français</option>
    </select>

    <dynamic-form [config]="formConfig" />
  `,
})
export class MyFormComponent {
  transloco = inject(TranslocoService);

  changeLanguage(event: Event) {
    const lang = (event.target as HTMLSelectElement).value;
    this.transloco.setActiveLang(lang);
  }
}
```

Forms automatically update when language changes due to `reRenderOnLangChange: true`.

## Best Practices

**Namespace translations:**

```json
{
  "forms": {
    "user": { "firstName": "First Name" },
    "company": { "name": "Company Name" }
  }
}
```

**Use template strings for dynamic values:**

```json
{
  "validation": {
    "minLength": "Minimum {{min}} characters",
    "between": "Value must be between {{min}} and {{max}}"
  }
}
```

**Provide fallbacks:**

```typescript
label: this.transloco.selectTranslate('form.label', {}, 'en');
```
