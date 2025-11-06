The `@ng-forge/dynamic-form-primeng` package provides PrimeNG field components with a beautiful, modern design system.

> **Note:** When using PrimeNG fields alongside Material fields in the same application, import from `@ng-forge/dynamic-form-primeng/no-augmentation` to avoid TypeScript conflicts.

## Installation

```bash
npm install @ng-forge/dynamic-form-primeng primeng primeicons
```

## Setup

Configure providers:

```typescript
// app.config.ts
import { provideDynamicForm } from '@ng-forge/dynamic-form';
import { withPrimeNGFields } from '@ng-forge/dynamic-form-primeng';

export const appConfig: ApplicationConfig = {
  providers: [provideDynamicForm(...withPrimeNGFields())],
};
```

Import PrimeNG theme:

```scss
// styles.scss
@import 'primeng/resources/themes/lara-light-blue/theme.css';
@import 'primeng/resources/primeng.css';
@import 'primeicons/primeicons.css';
```

### Using with Other Field Libraries

If you're using PrimeNG fields alongside Material fields in the same app:

```typescript
// Use the no-augmentation entry point
import { withPrimeNGFields } from '@ng-forge/dynamic-form-primeng/no-augmentation';

@Component({
  providers: [provideDynamicForm(...withPrimeNGFields())],
})
export class MyPrimeNGComponent {}
```

## Field Components

### Input

Text input with PrimeNG styling.

{{ NgDocActions.demo("InputDemoComponent") }}

**Props:**

- `type`: `'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search'`
- `styleClass`: CSS class for the input element
- `hint`: Help text displayed below the input
- `size`: `'small' | 'large'`
- `variant`: `'outlined' | 'filled'`

### Select

Dropdown selection with search capability.

{{ NgDocActions.demo("SelectDemoComponent") }}

**Props:**

- `styleClass`: CSS class for the dropdown
- `placeholder`: Dropdown placeholder text
- `filter`: Enable search/filter functionality (boolean)
- `showClear`: Show clear button (boolean)
- `virtualScroll`: Enable virtual scrolling for large lists (boolean)
- `virtualScrollItemSize`: Height of each item for virtual scroll

### Checkbox

Boolean checkbox control.

{{ NgDocActions.demo("CheckboxDemoComponent") }}

**Props:**

- `styleClass`: CSS class for the checkbox
- `binary`: Treat as boolean (true/false) instead of checked/unchecked
- `trueValue`: Value when checked (default: true)
- `falseValue`: Value when unchecked (default: false)

### Radio

Radio button group.

{{ NgDocActions.demo("RadioDemoComponent") }}

**Props:**

- `styleClass`: CSS class for the radio group
- `hint`: Help text displayed below the group

### Multi-Checkbox

Multiple checkbox selection.

{{ NgDocActions.demo("MultiCheckboxDemoComponent") }}

**Props:**

- `styleClass`: CSS class for the checkbox group
- `hint`: Help text displayed below the group

### Toggle

Slide toggle switch (InputSwitch).

{{ NgDocActions.demo("ToggleDemoComponent") }}

**Props:**

- `styleClass`: CSS class for the toggle
- `trueValue`: Value when toggled on (default: true)
- `falseValue`: Value when toggled off (default: false)
- `hint`: Help text displayed below the toggle

### Textarea

Multi-line text input.

{{ NgDocActions.demo("TextareaDemoComponent") }}

**Field properties:**

- `maxLength`: Maximum character limit

**Props:**

- `rows`: Number of visible rows (default: 4)
- `cols`: Number of visible columns
- `autoResize`: Auto-resize based on content (boolean)
- `styleClass`: CSS class for the textarea
- `hint`: Help text

### Datepicker

Date selection with calendar popup (p-calendar).

{{ NgDocActions.demo("DatepickerDemoComponent") }}

**Field properties:**

- `minDate`: Minimum selectable date (Date | string | null)
- `maxDate`: Maximum selectable date (Date | string | null)

**Props:**

- `styleClass`: CSS class for the datepicker
- `dateFormat`: Date format string (default: 'mm/dd/yy')
- `showIcon`: Show calendar icon (boolean)
- `showButtonBar`: Show today/clear buttons (boolean)
- `inline`: Display calendar inline (boolean)
- `hint`: Help text

### Slider

Numeric slider control.

{{ NgDocActions.demo("SliderDemoComponent") }}

**Field properties:**

- `minValue`: Minimum value (default: 0)
- `maxValue`: Maximum value (default: 100)
- `step`: Increment step (default: 1)

**Props:**

- `styleClass`: CSS class for the slider
- `orientation`: `'horizontal' | 'vertical'` (default: 'horizontal')
- `hint`: Help text

### Buttons

PrimeNG provides multiple prebuilt button types for common form actions.

{{ NgDocActions.demo("ButtonDemoComponent") }}

#### Submit Button

Form submission button - automatically disabled when the form is invalid.

```typescript
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
    {
      type: 'submit',
      key: 'submit',
      label: 'Create Account',
      props: { severity: 'primary' },
    },
  ],
} as const satisfies FormConfig;

// The submit button will be disabled until all required fields are valid
```

Alternative using helper function:

```typescript
import { submitButton } from '@ng-forge/dynamic-form-primeng';

submitButton({
  key: 'submit',
  label: 'Create Account',
  props: { severity: 'primary' },
});
```

#### Next/Previous Buttons

Navigation buttons for multi-step (paged) forms.

```typescript
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
        {
          key: 'navigation',
          type: 'row',
          fields: [
            {
              type: 'next',
              key: 'nextToContact',
              label: 'Continue',
              props: { severity: 'primary' },
            },
          ],
        },
      ],
    },
    {
      key: 'contactInfo',
      type: 'page',
      title: 'Contact Information',
      fields: [
        { key: 'email', type: 'input', value: '', label: 'Email', required: true, email: true },
        {
          key: 'navigation',
          type: 'row',
          fields: [
            { type: 'previous', key: 'back', label: 'Back' },
            { type: 'submit', key: 'submit', label: 'Complete', props: { severity: 'primary' } },
          ],
        },
      ],
    },
  ],
} as const satisfies FormConfig;
```

Alternative using helper functions:

```typescript
import { nextPageButton, previousPageButton, submitButton } from '@ng-forge/dynamic-form-primeng';

nextPageButton({ key: 'next', label: 'Continue', props: { severity: 'primary' } });
previousPageButton({ key: 'back', label: 'Back' });
submitButton({ key: 'submit', label: 'Complete' });
```

#### Custom Action Button

Generic button for custom events. Use this for application-specific actions.

```typescript
import { FormEvent } from '@ng-forge/dynamic-form';

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
        {
          type: 'button',
          key: 'saveDraft',
          label: 'Save as Draft',
          event: SaveDraftEvent,
          props: { severity: 'secondary' },
        },
        {
          type: 'submit',
          key: 'publish',
          label: 'Publish',
          props: { severity: 'primary' },
        },
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

Alternative using helper function:

```typescript
import { actionButton } from '@ng-forge/dynamic-form-primeng';

actionButton({
  key: 'saveDraft',
  label: 'Save as Draft',
  event: SaveDraftEvent,
  props: { severity: 'secondary' },
});
```

**Button Props:**

- `severity`: `'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'help' | 'danger'` - Button theme
- `outlined`: Outlined button style (boolean)
- `text`: Text-only button style (boolean)
- `raised`: Raised button style (boolean)
- `rounded`: Rounded button style (boolean)
- `icon`: Icon class (e.g., 'pi pi-check')
- `iconPos`: `'left' | 'right' | 'top' | 'bottom'` - Icon position
- `size`: `'small' | 'large'`
- `styleClass`: Additional CSS classes

**Button Types:**

- `type: 'submit'` - Preconfigured with SubmitEvent, auto-disables when form invalid
- `type: 'next'` - Preconfigured with NextPageEvent for page navigation
- `type: 'previous'` - Preconfigured with PreviousPageEvent for page navigation
- `type: 'button'` - Generic button requiring custom `event` property

## Complete Example

### Full Form

{{ NgDocActions.demo("CompletePrimeFormComponent") }}

## Type Safety

PrimeNG fields use specialized control types:

- **ValueControlFieldType**: Single-value fields (input, select, textarea, datepicker, radio, slider, toggle)
- **CheckboxControlFieldType**: Checkbox fields (checkbox, multi-checkbox)

Benefits:

- Full TypeScript type inference
- Angular signal forms integration
- No `ControlValueAccessor` boilerplate
- Automatic property handling

## Theming

PrimeNG supports extensive theming through CSS variables. See [PrimeNG Theming Guide](https://primeng.org/theming) for customization options.

**severity**: Button/component theme

- `'primary'` (default)
- `'secondary'`
- `'success'`
- `'info'`
- `'warning'`
- `'help'`
- `'danger'`

**size**: Component size variants

- `'small'`
- `'large'`
- Default (medium)

**styleClass**: Custom CSS classes for all components

## Accessibility

All components include:

- Proper ARIA attributes
- Keyboard navigation
- Screen reader support
- Focus management
- Error announcements

## Angular 21 Compatibility

**Current Status:** Experimental with Angular 21.0.0-next.9 and PrimeNG 20.3.0

Some PrimeNG components may encounter signal-related issues in Angular 21 during testing. These are PrimeNG framework limitations and should be resolved in future PrimeNG releases.

For production-ready implementations with Angular 21, consider using `@ng-forge/dynamic-form-material`.
