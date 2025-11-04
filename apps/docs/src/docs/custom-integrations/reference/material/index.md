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

**Props:**

- `rows`: Number of visible rows
- `appearance`: `'fill' | 'outline'`
- `autosize`: Auto-grow to fit content

### Datepicker

Date selection with calendar popup.

{{ NgDocActions.demo("DatepickerDemoComponent") }}

**Props:**

- `minDate`: Minimum selectable date
- `maxDate`: Maximum selectable date
- `appearance`: `'fill' | 'outline'`

### Slider

Numeric slider control.

{{ NgDocActions.demo("SliderDemoComponent") }}

**Props:**

- `min`: Minimum value
- `max`: Maximum value
- `step`: Increment step
- `thumbLabel`: Show value tooltip
- `color`: `'primary' | 'accent' | 'warn'`

### Submit Button

Form submission button.

{{ NgDocActions.demo("SubmitDemoComponent") }}

**Props:**

- `color`: `'primary' | 'accent' | 'warn'`
- `variant`: `'basic' | 'raised' | 'stroked' | 'flat'`

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

**variant**: Button style

- `'basic'`
- `'raised'` (default)
- `'stroked'`
- `'flat'`

## Accessibility

All components include:

- Proper ARIA attributes
- Keyboard navigation
- Screen reader support
- Focus management
- Error announcements
