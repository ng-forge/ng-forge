# Material Design Integration

The `@ng-forge/dynamic-form-material` package provides Material Design field components.

## Installation

```bash
npm install @ng-forge/dynamic-form-material @angular/material @angular/cdk
```

## Setup

Configure providers:

```typescript
// app.config.ts
import { provideDynamicForm } from '@ng-forge/dynamic-form';
import { withMaterialFields } from '@ng-forge/dynamic-form-material';

export const appConfig: ApplicationConfig = {
  providers: [provideDynamicForm(withMaterialFields())],
};
```

Import Material theme:

```scss
// styles.scss
@import '@angular/material/prebuilt-themes/indigo-pink.css';
```

## Field Components

### Input

Text input with Material styling.

{{ NgDocActions.demo("InputDemoComponent") }}

**Props:**

- `type`: `'text' | 'email' | 'password' | 'number' | 'tel' | 'url'`
- `appearance`: `'fill' | 'outline'`
- `hint`: Help text
- `placeholder`: Input placeholder

### Select

Dropdown selection (single or multi-select).

{{ NgDocActions.demo("SelectDemoComponent") }}

**Props:**

- `multiple`: Enable multi-select
- `appearance`: `'fill' | 'outline'`
- `placeholder`: Dropdown placeholder

### Checkbox

Boolean checkbox control.

{{ NgDocActions.demo("CheckboxDemoComponent") }}

**Props:**

- `color`: `'primary' | 'accent' | 'warn'`
- `labelPosition`: `'before' | 'after'`

### Radio

Radio button group.

{{ NgDocActions.demo("RadioDemoComponent") }}

**Props:**

- `color`: `'primary' | 'accent' | 'warn'`
- `labelPosition`: `'before' | 'after'`

### Multi-Checkbox

Multiple checkbox selection.

{{ NgDocActions.demo("MultiCheckboxDemoComponent") }}

**Props:**

- `color`: `'primary' | 'accent' | 'warn'`
- `labelPosition`: `'before' | 'after'`

### Toggle

Slide toggle switch.

{{ NgDocActions.demo("ToggleDemoComponent") }}

**Props:**

- `color`: `'primary' | 'accent' | 'warn'`
- `labelPosition`: `'before' | 'after'`

### Textarea

Multi-line text input.

{{ NgDocActions.demo("TextareaDemoComponent") }}

**Field properties:**

- `maxLength`: Maximum character limit

**Props:**

- `rows`: Number of visible rows (default: 4)
- `cols`: Number of visible columns
- `resize`: `'none' | 'both' | 'horizontal' | 'vertical'` (default: 'vertical')
- `appearance`: `'fill' | 'outline'`
- `subscriptSizing`: `'fixed' | 'dynamic'`
- `hint`: Help text

### Datepicker

Date selection with calendar popup.

{{ NgDocActions.demo("DatepickerDemoComponent") }}

**Field properties:**

- `minDate`: Minimum selectable date (Date | string | null)
- `maxDate`: Maximum selectable date (Date | string | null)
- `startAt`: Initial calendar date (Date | null)

**Props:**

- `appearance`: `'fill' | 'outline'`
- `color`: `'primary' | 'accent' | 'warn'`
- `startView`: `'month' | 'year' | 'multi-year'` (default: 'month')
- `touchUi`: Enable touch-optimized UI (boolean)
- `subscriptSizing`: `'fixed' | 'dynamic'`
- `hint`: Help text

### Slider

Numeric slider control.

{{ NgDocActions.demo("SliderDemoComponent") }}

**Field properties:**

- `minValue`: Minimum value (default: 0)
- `maxValue`: Maximum value (default: 100)
- `step`: Increment step (default: 1)

**Props:**

- `thumbLabel` or `showThumbLabel`: Show value tooltip (boolean)
- `tickInterval`: Show tick marks (number | undefined)
- `color`: `'primary' | 'accent' | 'warn'` (default: 'primary')
- `hint`: Help text

### Submit Button

Form submission button (automatically disabled when form is invalid).

{{ NgDocActions.demo("SubmitDemoComponent") }}

**Props:**

- `color`: `'primary' | 'accent' | 'warn'`
- `type`: `'button' | 'submit' | 'reset'` (default: 'button')

## Comprehensive Examples

### All Field Types

{{ NgDocActions.demo("MaterialFieldTypesComponent") }}

### Theming

{{ NgDocActions.demo("MaterialThemingComponent") }}

### Validation

{{ NgDocActions.demo("MaterialValidationComponent") }}

### Type-Safe Implementation

{{ NgDocActions.demo("ControlFieldTypesDemoComponent") }}

### Complete Form

{{ NgDocActions.demo("CompleteMaterialFormComponent") }}

## Type Safety

Material fields use specialized control types:

- **ValueControlFieldType**: Single-value fields (input, select, textarea, datepicker, radio, slider, toggle)
- **CheckboxControlFieldType**: Checkbox fields (checkbox, multi-checkbox)

Benefits:

- Full TypeScript type inference
- Angular signal forms integration
- No `ControlValueAccessor` boilerplate
- Automatic property handling

## Theming Props

**color**: Theme color for interactive elements

- `'primary'` (default)
- `'accent'`
- `'warn'`

**appearance**: Form field style

- `'fill'` (default)
- `'outline'`

**labelPosition**: Label placement for toggles/checkboxes

- `'before'`
- `'after'` (default)

**type**: Button type

- `'button'` (default)
- `'submit'`
- `'reset'`

## Accessibility

All components include:

- Proper ARIA attributes
- Keyboard navigation
- Screen reader support
- Focus management
- Error announcements
