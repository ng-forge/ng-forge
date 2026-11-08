---
title: Advanced Controls
slug: field-types/advanced-controls
description: 'Slider and datepicker field types for ng-forge dynamic forms. Configure numeric ranges, date selection, min/max bounds, and adapter-specific props.'
---

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

#### Adapter Props

<docs-adapter-props field="slider"></docs-adapter-props>

<docs-live-example scenario="examples/slider" hideForCustom="true" showHeading="true"></docs-live-example>

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
  placeholder: 'Select your birth date',
}
```

**Core Properties (all optional):**

- `minDate`: Minimum selectable date (`Date | string | null`)
- `maxDate`: Maximum selectable date (`Date | string | null`)
- `startAt`: Initial calendar view date (`Date | null`)
- `placeholder`: Placeholder text (at field level, not in props)

#### Adapter Props

<docs-adapter-props field="datepicker"></docs-adapter-props>

#### Date formats and locale

Each adapter follows its UI library's locale setup:

- **Material** uses the app's `DateAdapter`, `MAT_DATE_FORMATS` and `MAT_DATE_LOCALE` when provided, and falls back to the native adapter otherwise. The native adapter only parses typed dates in US order or ISO format, so apps that expect input like `15.12.2026` should provide a parsing adapter such as `provideDateFnsAdapter()`. With the date-fns adapter, `MAT_DATE_LOCALE` takes a date-fns `Locale` object (for example `de` from `date-fns/locale`), not a string.
- **Bootstrap** renders a native `<input type="date">`, which uses the browser's locale.
- **PrimeNG** parses and displays dates with the `dateFormat` prop, for example `'dd.mm.yy'`. Month and day names come from PrimeNG's translation config.
- **Ionic** passes the `locale` prop to `ion-datetime` and uses it for the displayed value. It defaults to the browser locale.

<docs-live-example scenario="examples/datepicker" hideForCustom="true" showHeading="true"></docs-live-example>
