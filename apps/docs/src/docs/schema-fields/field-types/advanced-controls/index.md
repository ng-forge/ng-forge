Specialized controls for numeric ranges and date selection.

## slider

Numeric range selection.

```typescript
{
  key: 'volume',
  type: 'slider',
  label: 'Volume',
  value: 50,
  minValue: 0,    // optional
  maxValue: 100,  // optional
  step: 5,        // optional
}
```

**Core Properties (all optional):**

- `minValue`: Minimum slider value
- `maxValue`: Maximum slider value
- `step`: Step increment value

<docs-live-example scenario="examples/slider"></docs-live-example>

## datepicker

Date selection control.

```typescript
{
  key: 'birthDate',
  type: 'datepicker',
  label: 'Birth Date',
  value: null,
  required: true,
  minDate: new Date(1900, 0, 1),  // optional
  maxDate: new Date(),            // optional
  props: {
    placeholder: 'Select your birth date',
  }
}
```

**Core Properties (all optional):**

- `minDate`: Minimum selectable date — `Date | string | null`
- `maxDate`: Maximum selectable date — `Date | string | null`
- `startAt`: Initial calendar view date — `Date | null`

**Core Props:**

- `placeholder`: Placeholder text
- `format`: Date format string (UI-integration specific)

<docs-live-example scenario="examples/datepicker"></docs-live-example>
