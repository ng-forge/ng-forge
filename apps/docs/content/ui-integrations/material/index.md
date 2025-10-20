The `@ng-forge/dynamic-form-material` package provides beautiful Material Design field components that integrate seamlessly with Angular Material.

## Installation

```bash group="install" name="npm"
npm install @ng-forge/dynamic-form-material @angular/material @angular/cdk
```

```bash group="install" name="yarn"
yarn add @ng-forge/dynamic-form-material @angular/material @angular/cdk
```

```bash group="install" name="pnpm"
pnpm add @ng-forge/dynamic-form-material @angular/material @angular/cdk
```

## Setup

### 1. Configure Providers

```typescript
// app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideDynamicForm } from '@ng-forge/dynamic-form';
import { withMaterialFields } from '@ng-forge/dynamic-form-material';
import { provideAnimations } from '@angular/platform-browser/animations';

export const appConfig: ApplicationConfig = {
  providers: [provideAnimations(), provideDynamicForm(), withMaterialFields()],
};
```

### 2. Import Material Theme

Add to your `styles.scss`:

```scss
@import '@angular/material/prebuilt-themes/indigo-pink.css';
```

## Material Field Types

All field components use type-safe implementations with Angular's signal forms, implementing both FormControl interfaces and field-specific interfaces using specialized control field types.

### Input Field

Enhanced text inputs with various types and validation:

{{ NgDocActions.demo("InputDemoComponent") }}

### Select Field

Dropdown selection with single or multiple options:

{{ NgDocActions.demo("SelectDemoComponent") }}

### Checkbox Field

Single boolean checkbox with Material styling:

{{ NgDocActions.demo("CheckboxDemoComponent") }}

### Radio Field

Single selection from radio button group:

{{ NgDocActions.demo("RadioDemoComponent") }}

### Multi-Checkbox Field

Multiple selections with checkboxes:

{{ NgDocActions.demo("MultiCheckboxDemoComponent") }}

### Toggle Field

Material slide toggle for boolean values:

{{ NgDocActions.demo("ToggleDemoComponent") }}

### Textarea Field

Multi-line text input:

{{ NgDocActions.demo("TextareaDemoComponent") }}

### Datepicker Field

Date selection with Material calendar:

{{ NgDocActions.demo("DatepickerDemoComponent") }}

### Slider Field

Numeric input with slider control:

{{ NgDocActions.demo("SliderDemoComponent") }}

### Submit Button

Action buttons with Material Design styling:

{{ NgDocActions.demo("SubmitDemoComponent") }}

### Comprehensive Examples

#### All Field Types Showcase

Complete demonstration of every field type:

{{ NgDocActions.demo("MaterialFieldTypesComponent") }}

#### Theming & Appearances

Material Design themes, colors, and styling options:

{{ NgDocActions.demo("MaterialThemingComponent") }}

#### Validation Examples

Error handling and validation patterns:

{{ NgDocActions.demo("MaterialValidationComponent") }}

#### Control Field Types Implementation

Type-safe implementation details:

{{ NgDocActions.demo("ControlFieldTypesDemoComponent") }}

## Type-Safe Implementation

Material fields use specialized control field types for seamless Angular signal forms integration:

- **ValueControlFieldType**: For single-value fields (input, select, textarea, datepicker, radio, slider, toggle)
- **CheckboxControlFieldType**: For checkbox-style fields (checkbox, multi-checkbox)

### Key Benefits

- **Type Safety**: Full TypeScript support with interface enforcement
- **Signal Forms**: Native Angular signal form integration
- **No Boilerplate**: No ControlValueAccessor implementation needed
- **Automatic Property Exclusion**: FormControl properties are handled automatically

Explore the implementation details in the interactive examples above.

## Theming & Styling

Material fields automatically inherit your Angular Material theme. Customize appearance with:

- **color**: `'primary' | 'accent' | 'warn'` - Theme color for interactive elements
- **appearance**: `'fill' | 'outline'` - Form field container style
- **labelPosition**: `'before' | 'after'` - Label placement for checkboxes/toggles
- **variant**: `'basic' | 'raised' | 'stroked' | 'flat'` - Button styles

## Complete Material Form Example

Comprehensive form using all Material components:

{{ NgDocActions.demo("CompleteMaterialFormComponent") }}

## Advanced Features

- **Form field appearance**: Consistent with Angular Material design system
- **Error handling**: Material-style error messages
- **Accessibility**: Full a11y support with proper ARIA attributes
- **Theming**: Seamless integration with Material color palettes
- **Responsive**: Mobile-first design principles
