# Documentation Restructure Plan

## Current State Analysis

### Directory Structure

```
apps/docs/
├── content/               # Markdown documentation (separated from code)
│   ├── getting-started/
│   ├── field-types/
│   ├── type-inference/
│   ├── ui-integrations/
│   │   ├── material/
│   │   ├── bootstrap/
│   │   ├── primeng/
│   │   └── ionic/
│   └── api-reference/
└── src/
    └── app/
        └── components/    # All demo components (not co-located)
            ├── demo-form.component.ts
            └── material/  # Material demos grouped separately
```

### Issues Identified

1. **Separation**: Documentation (markdown) is separated from example components
2. **No Co-location**: Components are not organized with their related documentation
3. **Styling Not Isolated**: Material styling bleeds globally via `styles.scss`
4. **Missing Categories**: No clear organization for Logic, Validation, i18n, Prebuilt Components
5. **Content Overlap**: `type-inference` and `field-types` have unclear boundaries
6. **UI Integration Focus**: Current structure emphasizes UI frameworks over functionality

---

## Target Architecture

### New Directory Structure

```
apps/docs/
├── ng-doc.config.ts
├── project.json
└── src/
    ├── index.html
    ├── main.ts
    ├── styles.scss        # Minimal global styles only
    ├── app/
    │   ├── app.ts
    │   ├── app.html
    │   ├── app.config.ts
    │   └── app.routes.ts
    └── docs/              # All documentation content moves here
        ├── getting-started/
        │   ├── index.md
        │   ├── ng-doc.page.ts
        │   └── examples/
        │       └── quick-start-demo.component.ts
        │
        ├── core/          # Logic & Validation category
        │   ├── ng-doc.category.ts
        │   ├── field-types/
        │   │   ├── index.md
        │   │   ├── ng-doc.page.ts
        │   │   └── examples/
        │   │       ├── text-field.component.ts
        │   │       ├── select-field.component.ts
        │   │       └── ...
        │   ├── validation/
        │   │   ├── index.md
        │   │   ├── ng-doc.page.ts
        │   │   └── examples/
        │   │       ├── built-in-validators.component.ts
        │   │       ├── custom-validators.component.ts
        │   │       └── async-validators.component.ts
        │   ├── type-safety/
        │   │   ├── index.md        # Merged/rewritten from type-inference
        │   │   ├── ng-doc.page.ts
        │   │   └── examples/
        │   │       ├── typed-forms.component.ts
        │   │       └── nested-types.component.ts
        │   └── conditional-logic/
        │       ├── index.md
        │       ├── ng-doc.page.ts
        │       └── examples/
        │           ├── conditional-fields.component.ts
        │           └── dynamic-validation.component.ts
        │
        ├── i18n/          # Internationalization category
        │   ├── ng-doc.category.ts
        │   ├── setup/
        │   │   ├── index.md
        │   │   └── ng-doc.page.ts
        │   └── examples-page/
        │       ├── index.md
        │       ├── ng-doc.page.ts
        │       └── examples/
        │           ├── translated-labels.component.ts
        │           └── translated-validation.component.ts
        │
        ├── prebuilt/      # Prebuilt Components category
        │   ├── ng-doc.category.ts
        │   ├── form-rows/
        │   │   ├── index.md
        │   │   ├── ng-doc.page.ts
        │   │   └── examples/
        │   │       └── row-layouts.component.ts
        │   ├── form-groups/
        │   │   ├── index.md
        │   │   ├── ng-doc.page.ts
        │   │   └── examples/
        │   │       └── grouped-fields.component.ts
        │   ├── form-pages/
        │   │   ├── index.md
        │   │   ├── ng-doc.page.ts
        │   │   └── examples/
        │   │       └── wizard-pages.component.ts
        │   └── text-components/
        │       ├── index.md
        │       ├── ng-doc.page.ts
        │       └── examples/
        │           └── rich-text.component.ts
        │
        ├── custom-integrations/  # Guide for building UI integrations
        │   ├── ng-doc.category.ts
        │   ├── guide/
        │   │   ├── index.md       # How to build your own
        │   │   └── ng-doc.page.ts
        │   └── reference/
        │       ├── material/
        │       │   ├── index.md
        │       │   ├── ng-doc.page.ts
        │       │   ├── material.container.ts    # Design system container
        │       │   └── examples/                # Co-located examples
        │       │       ├── input-demo.component.ts
        │       │       ├── select-demo.component.ts
        │       │       └── ...
        │       ├── bootstrap/
        │       │   ├── index.md
        │       │   ├── ng-doc.page.ts
        │       │   └── bootstrap.container.ts
        │       ├── primeng/
        │       │   ├── index.md
        │       │   ├── ng-doc.page.ts
        │       │   └── primeng.container.ts
        │       └── ionic/
        │           ├── index.md
        │           ├── ng-doc.page.ts
        │           └── ionic.container.ts
        │
        └── api-reference/
            └── ng-doc.api.ts
```

---

## Design System Container Pattern

### Purpose

Isolate UI framework styling to prevent global pollution and allow side-by-side comparisons.

### Implementation

```typescript
// material/material.container.ts
import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'docs-material-container',
  standalone: true,
  template: `<div class="material-integration"><ng-content /></div>`,
  styles: [
    `
      @import '@angular/material/prebuilt-themes/indigo-pink.css';

      .material-integration {
        /* Material-specific styles isolated here */
        --primary-color: #1976d2;
        --accent-color: #ff4081;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MaterialDesignContainer {}
```

### Usage in Examples

```typescript
@Component({
  selector: 'docs-input-demo',
  standalone: true,
  imports: [MaterialDesignContainer, DynamicFormComponent],
  template: `
    <docs-material-container>
      <dynamic-form [config]="formConfig" />
    </docs-material-container>
  `,
})
export class InputDemoComponent {}
```

---

## Content Category Mapping

### 1. Logic & Validation (`/core`)

**Combines and clarifies:**

- Field Types (kept, enhanced)
- Type Safety (merged from type-inference)
- Validation (new, extracted from various places)
- Conditional Logic (new)

**Focus:** Core ng-forge functionality independent of UI framework

### 2. Internationalization (`/i18n`)

**New category**

- Setup and configuration
- Examples with translated content
- Best practices

### 3. Prebuilt Components (`/prebuilt`)

**New category**

- Form rows
- Form groups
- Form pages/wizards
- Text components

### 4. Custom Integrations (`/custom-integrations`)

**Replaces ui-integrations/**

- Guide: How to build your own integration
- Reference: Material, Bootstrap, PrimeNG, Ionic as examples

### 5. Getting Started

**Kept as-is** with minimal changes

### 6. API Reference

**Kept as-is** with auto-generation

---

## Content Resolution: type-inference vs field-types

### Current State

- **field-types**: Documents FieldConfig API and available field types
- **type-inference**: Documents TypeScript type safety features

### Problem

Unclear boundary - type inference is a feature OF field types, not separate.

### Solution: Merge into Two Clear Pages

#### 1. **core/field-types/** - "Field Types Reference"

- Documents ALL available field types
- FieldConfig API structure
- Options for each field type
- Code examples showing configuration

#### 2. **core/type-safety/** - "Type Safety & Inference"

- How TypeScript types work with forms
- Compile-time type checking
- IntelliSense support
- Nested form types
- Advanced type patterns

**Relationship**: Type safety is a feature that works across all field types.

---

## Migration Steps

### Phase 1: Foundation

1. Create `src/docs/` directory structure
2. Create all ng-doc.category.ts files
3. Create design system container components

### Phase 2: Content Migration

4. Move getting-started/ → src/docs/getting-started/
5. Move field-types/ → src/docs/core/field-types/
6. Rewrite type-inference → src/docs/core/type-safety/
7. Create new validation/ page
8. Create new conditional-logic/ page

### Phase 3: New Categories

9. Create i18n/ category with pages
10. Create prebuilt/ category with pages
11. Restructure ui-integrations/ → custom-integrations/

### Phase 4: Component Co-location

12. Move material demos to custom-integrations/reference/material/examples/
13. Co-locate all example components with their documentation
14. Wrap examples with design system containers

### Phase 5: Cleanup

15. Update all ng-doc.page.ts references
16. Update imports in markdown files
17. Update ng-doc.config.ts paths
18. Remove old content/ directory
19. Update styles.scss to remove Material global import
20. Test and verify all routes work

---

## Writing Standards Applied

### Before (Verbose)

```markdown
In this section, we'll explore how to use field types. Field types are an important
concept in ng-forge that allow you to define different kinds of form fields. You can
use field types to create inputs, selects, checkboxes, and more. Let's take a look at
how field types work and how you can use them in your applications.
```

### After (Direct)

```markdown
Field types define form control behavior. Available types:

- `input`: Text, email, password, number
- `select`: Single or multi-select dropdown
- `checkbox`: Boolean toggle
- `radio`: Single selection from options

Configure via `FieldConfig.type`:

\`\`\`typescript
const config: FormConfig = {
fields: [
{ key: 'email', type: 'input', inputType: 'email', label: 'Email' }
]
};
\`\`\`
```

---

## Success Criteria

- [ ] All content in `src/docs/` directory
- [ ] Example components co-located with documentation
- [ ] Design system containers isolate UI framework styling
- [ ] Clear separation: Core functionality vs UI integrations
- [ ] No duplicate or overlapping content
- [ ] Direct, technical writing throughout
- [ ] All builds pass
- [ ] All routes functional
- [ ] Navigation clear and logical
