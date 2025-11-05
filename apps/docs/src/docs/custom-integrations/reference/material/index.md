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

### Buttons

Material provides multiple prebuilt button types for common form actions.

{{ NgDocActions.demo("SubmitDemoComponent") }}

#### Submit Button

Form submission button - automatically disabled when the form is invalid.

```typescript
import { submitButton } from '@ng-forge/dynamic-form-material';

const config = {
  fields: [
    { key: 'name', type: 'input', value: '', label: 'Name', required: true },
    { key: 'email', type: 'input', value: '', label: 'Email', required: true, email: true },
    {
      key: 'terms',
      type: 'checkbox',
      value: false,
      label: 'I accept the terms and conditions',
      required: true,
    },
    submitButton({
      key: 'submit',
      label: 'Create Account',
      props: { color: 'primary' },
    }),
  ],
} as const satisfies FormConfig;

// The submit button will be disabled until all required fields are valid
```

Alternative syntax without helper function:

```typescript
{ type: 'submit', key: 'submit', label: 'Create Account', props: { color: 'primary' } }
```

#### Next/Previous Buttons

Navigation buttons for multi-step (paged) forms.

```typescript
import { nextPageButton, previousPageButton, submitButton } from '@ng-forge/dynamic-form-material';

const config = {
  fields: [
    {
      key: 'personalInfo',
      type: 'page',
      title: 'Personal Information',
      description: 'Tell us about yourself',
      fields: [
        { key: 'firstName', type: 'input', value: '', label: 'First Name', required: true },
        { key: 'lastName', type: 'input', value: '', label: 'Last Name', required: true },
        { key: 'birthdate', type: 'date', value: null, label: 'Date of Birth' },
        {
          key: 'navigation',
          type: 'row',
          fields: [
            nextPageButton({
              key: 'nextToContact',
              label: 'Continue to Contact Info',
              props: { color: 'primary' },
            }),
          ],
        },
      ],
    },
    {
      key: 'contactInfo',
      type: 'page',
      title: 'Contact Information',
      description: 'How can we reach you?',
      fields: [
        { key: 'email', type: 'input', value: '', label: 'Email Address', required: true, email: true },
        { key: 'phone', type: 'input', value: '', label: 'Phone Number', props: { type: 'tel' } },
        {
          key: 'subscribe',
          type: 'checkbox',
          value: false,
          label: 'Subscribe to newsletter',
        },
        {
          key: 'navigation',
          type: 'row',
          fields: [
            previousPageButton({
              key: 'backToPersonal',
              label: 'Back',
            }),
            submitButton({
              key: 'submit',
              label: 'Complete Registration',
              props: { color: 'primary' },
            }),
          ],
        },
      ],
    },
  ],
} as const satisfies FormConfig;
```

Alternative syntax without helper functions:

```typescript
{ type: 'next', key: 'next', label: 'Continue' }
{ type: 'previous', key: 'back', label: 'Back' }
{ type: 'submit', key: 'submit', label: 'Complete' }
```

#### Custom Action Button

Generic button for custom events. Use this for application-specific actions.

```typescript
import { actionButton } from '@ng-forge/dynamic-form-material';
import { FormEvent, FormEventConstructor } from '@ng-forge/dynamic-form';

// Define your custom event
class SaveDraftEvent extends FormEvent {
  static override readonly eventName = 'SaveDraft';
}

const config = {
  fields: [
    { key: 'title', type: 'input', value: '', label: 'Document Title', required: true },
    { key: 'content', type: 'textarea', value: '', label: 'Content' },
    {
      key: 'actions',
      type: 'row',
      fields: [
        actionButton({
          key: 'saveDraft',
          label: 'Save as Draft',
          event: SaveDraftEvent,
          props: { color: 'accent' },
        }),
        submitButton({
          key: 'publish',
          label: 'Publish',
          props: { color: 'primary' },
        }),
      ],
    },
  ],
} as const satisfies FormConfig;
```

Then listen for the event in your component:

```typescript
import { EventBus } from '@ng-forge/dynamic-form';

class MyComponent {
  private eventBus = inject(EventBus);

  ngOnInit() {
    this.eventBus.on(SaveDraftEvent).subscribe(() => {
      console.log('Save draft clicked', this.form.value);
      // Handle draft saving logic
    });
  }
}
```

**Button Props:**

- `color`: `'primary' | 'accent' | 'warn'` - Material theme color
- `type`: `'button' | 'submit' | 'reset'` - HTML button type (default: 'button')

**Button Types:**

- `type: 'submit'` - Preconfigured with SubmitEvent, auto-disables when form invalid
- `type: 'next'` - Preconfigured with NextPageEvent for page navigation
- `type: 'previous'` - Preconfigured with PreviousPageEvent for page navigation
- `type: 'button'` - Generic button requiring custom `event` property

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
