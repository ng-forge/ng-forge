ng-forge provides pre-built field components for four popular UI libraries. Pick the one that matches your project.

<docs-adapter-picker></docs-adapter-picker>

---

## Angular Material

Angular Material Design components with Material theming support.

**Install:**

```bash group="material" name="npm"
npm install @ng-forge/dynamic-forms @ng-forge/dynamic-forms-material @angular/material @angular/cdk
```

```bash group="material" name="pnpm"
pnpm add @ng-forge/dynamic-forms @ng-forge/dynamic-forms-material @angular/material @angular/cdk
```

**Setup:**

```typescript
import { provideDynamicForm } from '@ng-forge/dynamic-forms';
import { withMaterialFields } from '@ng-forge/dynamic-forms-material';

export const appConfig: ApplicationConfig = {
  providers: [provideAnimations(), provideDynamicForm(...withMaterialFields())],
};
```

<docs-live-example scenario="examples/complete-form"></docs-live-example>

---

## Bootstrap

Bootstrap 5 field components with responsive layout support.

**Install:**

```bash group="bootstrap" name="npm"
npm install @ng-forge/dynamic-forms @ng-forge/dynamic-forms-bootstrap bootstrap
```

```bash group="bootstrap" name="pnpm"
pnpm add @ng-forge/dynamic-forms @ng-forge/dynamic-forms-bootstrap bootstrap
```

**Setup:**

```typescript
import { provideDynamicForm } from '@ng-forge/dynamic-forms';
import { withBootstrapFields } from '@ng-forge/dynamic-forms-bootstrap';

export const appConfig: ApplicationConfig = {
  providers: [provideAnimations(), provideDynamicForm(...withBootstrapFields())],
};
```

---

## PrimeNG

PrimeNG component library with extensive theming capabilities.

**Install:**

```bash group="primeng" name="npm"
npm install @ng-forge/dynamic-forms @ng-forge/dynamic-forms-primeng primeng
```

```bash group="primeng" name="pnpm"
pnpm add @ng-forge/dynamic-forms @ng-forge/dynamic-forms-primeng primeng
```

**Setup:**

```typescript
import { provideDynamicForm } from '@ng-forge/dynamic-forms';
import { withPrimeNGFields } from '@ng-forge/dynamic-forms-primeng';
import { providePrimeNG } from 'primeng/config';

export const appConfig: ApplicationConfig = {
  providers: [provideAnimations(), providePrimeNG({ theme: { preset: Aura } }), provideDynamicForm(...withPrimeNGFields())],
};
```

---

## Ionic

Ionic Framework field components for mobile-first applications.

**Install:**

```bash group="ionic" name="npm"
npm install @ng-forge/dynamic-forms @ng-forge/dynamic-forms-ionic @ionic/angular
```

```bash group="ionic" name="pnpm"
pnpm add @ng-forge/dynamic-forms @ng-forge/dynamic-forms-ionic @ionic/angular
```

**Setup:**

```typescript
import { provideDynamicForm } from '@ng-forge/dynamic-forms';
import { withIonicFields } from '@ng-forge/dynamic-forms-ionic';
import { provideIonicAngular } from '@ionic/angular/standalone';

export const appConfig: ApplicationConfig = {
  providers: [provideAnimations(), provideIonicAngular({ mode: 'md' }), provideDynamicForm(...withIonicFields())],
};
```

---

## Field Types

All integrations implement the same core field types. Use the adapter toggle above to see each integration's rendering.

| Field Type       | Description                           |
| ---------------- | ------------------------------------- |
| `input`          | Text, email, password, number inputs  |
| `textarea`       | Multi-line text input                 |
| `select`         | Dropdown selection (single/multi)     |
| `radio`          | Radio button group                    |
| `checkbox`       | Single boolean checkbox               |
| `multi-checkbox` | Multiple checkboxes from options list |
| `toggle`         | Slide toggle switch                   |
| `slider`         | Numeric range slider                  |
| `datepicker`     | Date picker with calendar             |
| `text`           | Static text/heading display           |
| `hidden`         | Hidden field with value               |

See [Field Types](/schema-fields/field-types) for complete configuration reference.

---

## Custom Integrations

Need to use a different UI library? See [Custom Integrations](/advanced/custom-integrations) to implement your own adapter.
