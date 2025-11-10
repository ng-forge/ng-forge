# Interactive Fields

Interactive fields provide advanced user input controls with Material Design styling. These fields enable settings configuration, value ranges, and date selection with intuitive interactions.

---

## Toggle

Slide toggle switch with Material Design styling for boolean on/off selections.

### Live Demo

{{ NgDocActions.demo("ToggleIframeDemoComponent") }}

### Basic Usage

```typescript
import { FormConfig } from '@ng-forge/dynamic-form';

const config = {
  fields: [
    {
      key: 'notifications',
      type: 'toggle',
      checked: false,
      label: 'Enable notifications',
    },
  ],
} as const satisfies FormConfig;
```

### Field Properties

| Property   | Type       | Description                            |
| ---------- | ---------- | -------------------------------------- |
| `key`      | `string`   | Unique field identifier                |
| `type`     | `'toggle'` | Field type                             |
| `checked`  | `boolean`  | Initial toggle state                   |
| `label`    | `string`   | Toggle label                           |
| `required` | `boolean`  | Makes field required (must be checked) |
| `disabled` | `boolean`  | Disables the toggle                    |
| `readonly` | `boolean`  | Makes field read-only                  |
| `hidden`   | `boolean`  | Hides the field                        |

### Props (Material-Specific)

| Prop            | Type                              | Default     | Description            |
| --------------- | --------------------------------- | ----------- | ---------------------- |
| `color`         | `'primary' \| 'accent' \| 'warn'` | `'primary'` | Material theme color   |
| `labelPosition` | `'before' \| 'after'`             | `'after'`   | Position of label text |

### Examples

#### Basic Toggle

```typescript
{
  key: 'darkMode',
  type: 'toggle',
  checked: false,
  label: 'Enable dark mode',
  props: {
    color: 'primary',
  },
}
```

#### With Accent Color

```typescript
{
  key: 'emailNotifications',
  type: 'toggle',
  checked: true,
  label: 'Email notifications',
  props: {
    color: 'accent',
    labelPosition: 'after',
  },
}
```

---

## Slider

Numeric slider control with Material Design styling for selecting values from a range.

### Live Demo

{{ NgDocActions.demo("SliderIframeDemoComponent") }}

### Basic Usage

```typescript
import { FormConfig } from '@ng-forge/dynamic-form';

const config = {
  fields: [
    {
      key: 'volume',
      type: 'slider',
      value: 50,
      label: 'Volume',
      minValue: 0,
      maxValue: 100,
      step: 1,
    },
  ],
} as const satisfies FormConfig;
```

### Field Properties

| Property   | Type       | Default | Description             |
| ---------- | ---------- | ------- | ----------------------- |
| `key`      | `string`   | -       | Unique field identifier |
| `type`     | `'slider'` | -       | Field type              |
| `value`    | `number`   | -       | Initial value           |
| `label`    | `string`   | -       | Field label             |
| `minValue` | `number`   | `0`     | Minimum value           |
| `maxValue` | `number`   | `100`   | Maximum value           |
| `step`     | `number`   | `1`     | Increment step          |
| `disabled` | `boolean`  | -       | Disables the slider     |
| `readonly` | `boolean`  | -       | Makes field read-only   |
| `hidden`   | `boolean`  | -       | Hides the field         |

### Props (Material-Specific)

| Prop                            | Type                              | Default     | Description                  |
| ------------------------------- | --------------------------------- | ----------- | ---------------------------- |
| `thumbLabel` / `showThumbLabel` | `boolean`                         | `false`     | Show value tooltip on thumb  |
| `tickInterval`                  | `number \| 'auto'`                | -           | Show tick marks at intervals |
| `color`                         | `'primary' \| 'accent' \| 'warn'` | `'primary'` | Material theme color         |
| `hint`                          | `string`                          | -           | Help text below slider       |

### Examples

#### Basic Slider

```typescript
{
  key: 'brightness',
  type: 'slider',
  value: 75,
  label: 'Screen Brightness',
  minValue: 0,
  maxValue: 100,
  step: 5,
  props: {
    showThumbLabel: true,
    color: 'primary',
  },
}
```

#### With Thumb Label and Tick Marks

```typescript
{
  key: 'rating',
  type: 'slider',
  value: 5,
  label: 'Rate Your Experience',
  minValue: 1,
  maxValue: 10,
  step: 1,
  props: {
    showThumbLabel: true,
    tickInterval: 1,
    color: 'primary',
  },
}
```

---

## Datepicker

Date selection field with Material Design calendar popup for choosing dates.

### Live Demo

{{ NgDocActions.demo("DatepickerIframeDemoComponent") }}

### Basic Usage

```typescript
import { FormConfig } from '@ng-forge/dynamic-form';

const config = {
  fields: [
    {
      key: 'birthdate',
      type: 'datepicker',
      value: null,
      label: 'Date of Birth',
      required: true,
    },
  ],
} as const satisfies FormConfig;
```

### Field Properties

| Property      | Type                     | Description                |
| ------------- | ------------------------ | -------------------------- |
| `key`         | `string`                 | Unique field identifier    |
| `type`        | `'datepicker'`           | Field type                 |
| `value`       | `Date \| string \| null` | Initial date value         |
| `label`       | `string`                 | Field label                |
| `placeholder` | `string`                 | Placeholder text           |
| `minDate`     | `Date \| string \| null` | Minimum selectable date    |
| `maxDate`     | `Date \| string \| null` | Maximum selectable date    |
| `startAt`     | `Date \| null`           | Initial calendar view date |
| `required`    | `boolean`                | Makes field required       |
| `disabled`    | `boolean`                | Disables the field         |
| `readonly`    | `boolean`                | Makes field read-only      |
| `hidden`      | `boolean`                | Hides the field            |

### Props (Material-Specific)

| Prop              | Type                                | Default     | Description                 |
| ----------------- | ----------------------------------- | ----------- | --------------------------- |
| `appearance`      | `'fill' \| 'outline'`               | `'outline'` | Visual style                |
| `color`           | `'primary' \| 'accent' \| 'warn'`   | `'primary'` | Material theme color        |
| `startView`       | `'month' \| 'year' \| 'multi-year'` | `'month'`   | Initial calendar view       |
| `touchUi`         | `boolean`                           | `false`     | Touch-optimized calendar UI |
| `subscriptSizing` | `'fixed' \| 'dynamic'`              | `'fixed'`   | Error/hint sizing           |
| `hint`            | `string`                            | -           | Help text below field       |

### Examples

#### Basic Datepicker

```typescript
{
  key: 'appointmentDate',
  type: 'datepicker',
  value: null,
  label: 'Appointment Date',
  required: true,
  props: {
    appearance: 'outline',
    hint: 'Select your preferred date',
  },
}
```

#### With Date Range Constraints

```typescript
{
  key: 'checkIn',
  type: 'datepicker',
  value: null,
  label: 'Check-in Date',
  required: true,
  minDate: new Date(),
  maxDate: new Date(new Date().setMonth(new Date().getMonth() + 6)),
  props: {
    appearance: 'outline',
    hint: 'Available dates for the next 6 months',
  },
}
```

#### Date of Birth (Past Dates Only)

```typescript
{
  key: 'birthdate',
  type: 'datepicker',
  value: null,
  label: 'Date of Birth',
  required: true,
  maxDate: new Date(),
  minDate: new Date(new Date().setFullYear(new Date().getFullYear() - 120)),
  props: {
    startView: 'multi-year',
    appearance: 'outline',
  },
}
```

#### Future Dates Only

```typescript
{
  key: 'eventDate',
  type: 'datepicker',
  value: null,
  label: 'Event Date',
  required: true,
  minDate: new Date(),
  props: {
    appearance: 'outline',
    color: 'primary',
    hint: 'Select a future date',
  },
}
```

### Validation

#### Required Date

```typescript
{
  key: 'deadline',
  type: 'datepicker',
  value: null,
  label: 'Project Deadline',
  required: true,
  validationMessages: {
    required: 'Please select a deadline date',
  },
  props: {
    appearance: 'outline',
  },
}
```

#### Date Range Validation

```typescript
{
  key: 'availableDate',
  type: 'datepicker',
  value: null,
  label: 'Available From',
  required: true,
  minDate: new Date(),
  maxDate: new Date(new Date().setDate(new Date().getDate() + 90)),
  validationMessages: {
    required: 'Please select your availability date',
  },
  validators: [{
    type: 'custom',
    validator: (value) => {
      if (!value) return null;
      const date = new Date(value);
      const minDays = 7;
      const minDate = new Date();
      minDate.setDate(minDate.getDate() + minDays);
      return date >= minDate ? null : { tooSoon: true };
    },
    errorMessage: 'Date must be at least 7 days in the future',
  }],
  props: {
    appearance: 'outline',
  },
}
```

### Working with Date Values

Datepicker values can be:

- `Date` objects
- ISO date strings (e.g., `'2024-01-15'`)
- `null` for no selection

Always handle date parsing when processing form values:

```typescript
onSubmit(value: any) {
  const dateValue = value.date;
  const date = dateValue instanceof Date ? dateValue : new Date(dateValue);
  console.log('Selected date:', date.toLocaleDateString());
}
```

---

## Related

- [Text Input Fields](../text-inputs) - Input and textarea fields
- [Selection Fields](../selection-fields) - Select, radio, checkbox options
- [Buttons & Actions](../buttons-actions) - Submit and navigation buttons
- [Validation](../../../../../core/validation/) - Form validation guide
- [Conditional Logic](../../../../../core/conditional-logic/) - Dynamic field behavior
