The `@ng-forge/dynamic-form-ionic` package provides Ionic field components with a mobile-first design optimized for iOS and Android.

## Installation

```bash
npm install @ng-forge/dynamic-form-ionic @ionic/angular
```

## Setup

Configure providers:

```typescript
// app.config.ts
import { provideDynamicForm } from '@ng-forge/dynamic-form';
import { withIonicFields } from '@ng-forge/dynamic-form-ionic';

export const appConfig: ApplicationConfig = {
  providers: [provideDynamicForm(...withIonicFields())],
};
```

Import Ionic styles:

```scss
// styles.scss
@import '../../../../../../node_modules/.pnpm/@ionic+angular@8.7.10-nightly.20251107_@angular+core@21.0.0-next.10_@angular+forms@21.0.0-nex_p245zkhux3vntezcrg5kzkydla/node_modules/@ionic/angular/css/core.css';
@import 'normalize.css';
@import 'structure.css';
@import 'typography.css';
```

## Field Components

### Input

Text input with Ionic styling and mobile keyboard optimization.

{{ NgDocActions.demo("InputIframeDemoComponent") }}

**Props:**

- `type`: `'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search'`
- `placeholder`: Placeholder text
- `clearInput`: Show clear button (boolean)
- `inputmode`: Mobile keyboard type
- `autocomplete`: Autocomplete attribute

### Select

Dropdown selection with Ionic action sheet on mobile.

{{ NgDocActions.demo("SelectIframeDemoComponent") }}

**Props:**

- `placeholder`: Placeholder text
- `multiple`: Allow multiple selections (boolean)
- `interface`: `'action-sheet' | 'alert' | 'popover'`
- `cancelText`: Cancel button text
- `okText`: OK button text

### Checkbox

Boolean checkbox control with Ionic styling.

{{ NgDocActions.demo("CheckboxIframeDemoComponent") }}

**Props:**

- `labelPlacement`: `'start' | 'end'` - Label position
- `justify`: `'start' | 'end' | 'space-between'`
- `alignment`: `'start' | 'center'`

### Toggle

Slide toggle switch (ion-toggle).

{{ NgDocActions.demo("ToggleIframeDemoComponent") }}

**Props:**

- `labelPlacement`: `'start' | 'end' | 'fixed'`
- `justify`: `'start' | 'end' | 'space-between'`
- `enableOnOffLabels`: Show on/off labels (boolean)

### Radio

Radio button group.

{{ NgDocActions.demo("RadioIframeDemoComponent") }}

**Props:**

- `labelPlacement`: `'start' | 'end' | 'fixed'`
- `justify`: `'start' | 'end' | 'space-between'`
- `alignment`: `'start' | 'center'`

### Multi-Checkbox

Multiple checkbox selection.

{{ NgDocActions.demo("MultiCheckboxIframeDemoComponent") }}

**Props:**

- `labelPlacement`: `'start' | 'end' | 'fixed'`
- `justify`: `'start' | 'end' | 'space-between'`
- `alignment`: `'start' | 'center'`

### Textarea

Multi-line text input with auto-grow support.

{{ NgDocActions.demo("TextareaIframeDemoComponent") }}

**Field properties:**

- `maxLength`: Maximum character limit

**Props:**

- `rows`: Number of visible rows (default: 4)
- `autoGrow`: Auto-resize based on content (boolean)
- `placeholder`: Placeholder text

### Datepicker

Date and time selection with native mobile pickers.

{{ NgDocActions.demo("DatepickerIframeDemoComponent") }}

**Field properties:**

- `minDate`: Minimum selectable date (Date | string | null)
- `maxDate`: Maximum selectable date (Date | string | null)

**Props:**

- `presentation`: `'date' | 'time' | 'date-time' | 'month' | 'year'`
- `placeholder`: Placeholder text
- `showDefaultButtons`: Show cancel/done buttons (boolean)
- `cancelText`: Cancel button text
- `doneText`: Done button text

### Slider

Range slider control with pin display.

{{ NgDocActions.demo("SliderIframeDemoComponent") }}

**Field properties:**

- `minValue`: Minimum value (default: 0)
- `maxValue`: Maximum value (default: 100)
- `step`: Increment step (default: 1)

**Props:**

- `pin`: Show value pin above knob (boolean)
- `ticks`: Show tick marks (boolean)
- `snaps`: Snap to tick marks (boolean)
- `activeBarStart`: Start position of active bar

### Buttons

Ionic provides multiple prebuilt button types for common form actions.

{{ NgDocActions.demo("ButtonIframeDemoComponent") }}

#### Submit Button

Form submission button - automatically disabled when the form is invalid.

```typescript
const config = {
  fields: [
    { key: 'name', type: 'input', value: '', label: 'Name', required: true },
    { key: 'email', type: 'input', value: '', label: 'Email', required: true, email: true },
    {
      type: 'submit',
      key: 'submit',
      label: 'Create Account',
      props: { color: 'primary' },
    },
  ],
} as const satisfies FormConfig;
```

Alternative using helper function:

```typescript
import { submitButton } from '@ng-forge/dynamic-form-ionic';

submitButton({
  key: 'submit',
  label: 'Create Account',
  props: { color: 'primary' },
});
```

#### Next/Previous Buttons

Navigation buttons for multi-step (paged) forms.

```typescript
import { nextPageButton, previousPageButton, submitButton } from '@ng-forge/dynamic-form-ionic';

nextPageButton({ key: 'next', label: 'Continue', props: { color: 'primary' } });
previousPageButton({ key: 'back', label: 'Back' });
submitButton({ key: 'submit', label: 'Complete' });
```

#### Custom Action Button

Generic button for custom events.

```typescript
import { actionButton } from '@ng-forge/dynamic-form-ionic';
import { FormEvent } from '@ng-forge/dynamic-form';

class SaveDraftEvent extends FormEvent {
  static override readonly eventName = 'SaveDraft';
}

actionButton({
  key: 'saveDraft',
  label: 'Save as Draft',
  event: SaveDraftEvent,
  props: { color: 'secondary' },
});
```

**Button Props:**

- `color`: `'primary' | 'secondary' | 'tertiary' | 'success' | 'warning' | 'danger' | 'light' | 'medium' | 'dark'`
- `fill`: `'solid' | 'outline' | 'clear'` (default: 'solid')
- `expand`: `'full' | 'block'` - Button width
- `shape`: `'round'` - Rounded button
- `size`: `'small' | 'default' | 'large'`
- `strong`: Use strong font weight (boolean)

**Button Types:**

- `type: 'submit'` - Preconfigured with SubmitEvent, auto-disables when form invalid
- `type: 'next'` - Preconfigured with NextPageEvent for page navigation
- `type: 'previous'` - Preconfigured with PreviousPageEvent for page navigation
- `type: 'button'` - Generic button requiring custom `event` property

## Complete Example

### Full Form

{{ NgDocActions.demo("CompleteFormIframeDemoComponent") }}

## Type Safety

Ionic fields use specialized control types:

- **ValueControlFieldType**: Single-value fields (input, select, textarea, datepicker, radio, slider, toggle)
- **CheckboxControlFieldType**: Checkbox fields (checkbox, multi-checkbox)

Benefits:

- Full TypeScript type inference
- Angular signal forms integration
- No `ControlValueAccessor` boilerplate
- Automatic property handling

## Theming

Ionic uses CSS variables for theming. See [Ionic Theming Guide](https://ionicframework.com/docs/theming/basics) for customization options.

**color**: Component color theme

- `'primary'` (default)
- `'secondary'`
- `'tertiary'`
- `'success'`
- `'warning'`
- `'danger'`
- `'light'`
- `'medium'`
- `'dark'`

**size**: Component size variants

- `'small'`
- `'default'`
- `'large'`

## Mobile Optimization

All Ionic components are optimized for mobile:

- **Touch targets**: Minimum 44x44px touch areas
- **Native keyboards**: Proper inputmode attributes
- **Platform styling**: iOS/Android adaptive styling
- **Gesture support**: Swipe, pull-to-refresh ready
- **Performance**: Hardware-accelerated animations

## Accessibility

All components include:

- Proper ARIA attributes
- Keyboard navigation
- Screen reader support
- Focus management
- Error announcements
- High contrast support

## Platform-Specific Styling

Ionic automatically adapts to the platform:

- **iOS**: Native iOS styling with SF Pro font
- **Android**: Material Design with Roboto font
- **Mode override**: Force specific platform style with `mode` prop

```typescript
{
  key: 'input',
  type: 'input',
  label: 'Name',
  props: {
    mode: 'ios', // Force iOS styling
  },
}
```
