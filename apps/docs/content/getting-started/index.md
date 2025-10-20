Welcome to **ng-forge** - the most intuitive dynamic forms library for Angular using the latest Angular 21 signal forms architecture.

## Quick Installation

```bash group="install" name="npm"
npm install @ng-forge/dynamic-form @ng-forge/dynamic-form-material
```

```bash group="install" name="yarn"
yarn add @ng-forge/dynamic-form @ng-forge/dynamic-form-material
```

```bash group="install" name="pnpm"
pnpm add @ng-forge/dynamic-form @ng-forge/dynamic-form-material
```

## 5-Minute Setup

### 1. Configure Providers

```typescript name="app.config.ts"
import { ApplicationConfig } from '@angular/core';
import { provideDynamicForm } from '@ng-forge/dynamic-form';
import { withMaterialFields } from '@ng-forge/dynamic-form-material';

export const appConfig: ApplicationConfig = {
  providers: [provideDynamicForm(withMaterialFields())],
};
```

### 2. Create Your First Form

```typescript name="user-form.component.ts"
import { Component, signal } from '@angular/core';
import { DynamicFormComponent, FieldConfig } from '@ng-forge/dynamic-form';

@Component({
  selector: 'app-user-form',
  imports: [DynamicForm],
  template: ` <dynamic-form [fields]="fields" [model]="model" (modelChange)="onModelChange($event)" (formSubmit)="onSubmit($event)" /> `,
})
export class UserFormComponent {
  model = signal({
    firstName: '',
    email: '',
    newsletter: false,
  });

  fields: FieldConfig[] = [
    {
      key: 'firstName',
      type: 'input',
      props: {
        label: 'First Name',
        placeholder: 'Enter your name',
        required: true,
      },
      validators: {
        required: true,
        minLength: 2,
      },
    },
    {
      key: 'email',
      type: 'input',
      props: {
        label: 'Email',
        type: 'email',
        required: true,
      },
      validators: {
        required: true,
        email: true,
      },
    },
    {
      key: 'newsletter',
      type: 'checkbox',
      props: {
        label: 'Subscribe to newsletter',
      },
    },
  ];

  onModelChange(newModel: any) {
    this.model.set(newModel);
  }

  onSubmit(formData: any) {
    console.log('Form submitted:', formData);
  }
}
```

### 3. Run Your App

```bash
ng serve
```

That's it! You now have a fully functional dynamic form with validation and Material Design styling.

## Live Demo

Try out ng-forge with this interactive demo:

{{ NgDocActions.playground("DemoFormPlayground") }}

## What Makes ng-forge Different?

- ✅ **Angular 21 Native**: Built specifically for Angular 21's signal forms
- ✅ **Type Safe**: Full TypeScript support with intelligent autocomplete
- ✅ **Zero Boilerplate**: No `ControlValueAccessor` implementation needed
- ✅ **Signal-First**: Reactive forms using Angular signals
- ✅ **Extensible**: Easy to create custom field types
- ✅ **UI Agnostic**: Works with Material, PrimeNG, Bootstrap, Ionic, or custom components

## Next Steps

- [Field Types](../field-types) - Explore all available field types
- [API Reference](../api-reference) - Complete API documentation
