# Datepicker

Date selection field with Material Design calendar popup for choosing dates.

## Live Demo

{{ NgDocActions.demo("DatepickerIframeDemoComponent") }}

## Basic Usage

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

## Field Properties

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

## Props (Material-Specific)

| Prop              | Type                                | Default     | Description                 |
| ----------------- | ----------------------------------- | ----------- | --------------------------- |
| `appearance`      | `'fill' \| 'outline'`               | `'outline'` | Visual style                |
| `color`           | `'primary' \| 'accent' \| 'warn'`   | `'primary'` | Material theme color        |
| `startView`       | `'month' \| 'year' \| 'multi-year'` | `'month'`   | Initial calendar view       |
| `touchUi`         | `boolean`                           | `false`     | Touch-optimized calendar UI |
| `subscriptSizing` | `'fixed' \| 'dynamic'`              | `'fixed'`   | Error/hint sizing           |
| `hint`            | `string`                            | -           | Help text below field       |

## Examples

### Basic Datepicker

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

### With Date Range Constraints

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

### Date of Birth (Past Dates Only)

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

### Future Dates Only

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

### With Start View Year

```typescript
{
  key: 'graduationYear',
  type: 'datepicker',
  value: null,
  label: 'Graduation Date',
  required: true,
  props: {
    startView: 'year',
    appearance: 'outline',
  },
}
```

### Touch-Optimized Calendar

```typescript
{
  key: 'travelDate',
  type: 'datepicker',
  value: null,
  label: 'Travel Date',
  required: true,
  props: {
    touchUi: true,
    appearance: 'fill',
    hint: 'Touch-friendly date picker',
  },
}
```

### With Pre-Selected Date

```typescript
{
  key: 'startDate',
  type: 'datepicker',
  value: new Date(),
  label: 'Start Date',
  required: true,
  props: {
    appearance: 'outline',
    color: 'accent',
  },
}
```

### Custom Start Position

```typescript
{
  key: 'meetingDate',
  type: 'datepicker',
  value: null,
  label: 'Meeting Date',
  startAt: new Date(new Date().setMonth(new Date().getMonth() + 1)),
  props: {
    appearance: 'outline',
    hint: 'Calendar opens to next month',
  },
}
```

## Validation

### Required Date

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

### Date Range Validation

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

### Business Days Only

```typescript
{
  key: 'businessDate',
  type: 'datepicker',
  value: null,
  label: 'Business Day',
  required: true,
  validators: [{
    type: 'custom',
    validator: (value) => {
      if (!value) return null;
      const date = new Date(value);
      const day = date.getDay();
      return day !== 0 && day !== 6 ? null : { notBusinessDay: true };
    },
    errorMessage: 'Please select a weekday (Monday-Friday)',
  }],
  props: {
    appearance: 'outline',
  },
}
```

## Conditional Logic

### Dependent Date Fields

```typescript
const config = {
  fields: [
    {
      key: 'startDate',
      type: 'datepicker',
      value: null,
      label: 'Start Date',
      required: true,
      minDate: new Date(),
      props: {
        appearance: 'outline',
      },
    },
    {
      key: 'endDate',
      type: 'datepicker',
      value: null,
      label: 'End Date',
      required: true,
      logic: [
        {
          type: 'required',
          condition: {
            type: 'custom',
            validator: (_, formValue) => !!formValue.startDate,
          },
          errorMessage: 'End date is required',
        },
      ],
      validators: [
        {
          type: 'custom',
          validator: (value, formValue) => {
            if (!value || !formValue.startDate) return null;
            const start = new Date(formValue.startDate);
            const end = new Date(value);
            return end > start ? null : { invalidDateRange: true };
          },
          errorMessage: 'End date must be after start date',
        },
      ],
      props: {
        appearance: 'outline',
      },
    },
  ],
} as const satisfies FormConfig;
```

### Show Field Based on Date Selection

```typescript
const config = {
  fields: [
    {
      key: 'eventDate',
      type: 'datepicker',
      value: null,
      label: 'Event Date',
      required: true,
      props: {
        appearance: 'outline',
      },
    },
    {
      key: 'rushProcessing',
      type: 'checkbox',
      checked: false,
      label: 'Rush processing (+$50)',
      logic: [
        {
          type: 'hidden',
          condition: {
            type: 'custom',
            validator: (_, formValue) => {
              if (!formValue.eventDate) return true;
              const eventDate = new Date(formValue.eventDate);
              const today = new Date();
              const daysUntil = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
              return daysUntil > 30;
            },
          },
        },
      ],
    },
  ],
} as const satisfies FormConfig;
```

## Complete Example

```typescript
import { Component, signal } from '@angular/core';
import { FormConfig, DynamicFormComponent } from '@ng-forge/dynamic-form';

const config = {
  fields: [
    {
      key: 'fullName',
      type: 'input',
      value: '',
      label: 'Full Name',
      required: true,
      props: {
        appearance: 'outline',
      },
    },
    {
      key: 'checkInDate',
      type: 'datepicker',
      value: null,
      label: 'Check-in Date',
      required: true,
      minDate: new Date(),
      maxDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      props: {
        appearance: 'outline',
        color: 'primary',
        hint: 'Select your arrival date',
      },
    },
    {
      key: 'checkOutDate',
      type: 'datepicker',
      value: null,
      label: 'Check-out Date',
      required: true,
      validators: [
        {
          type: 'custom',
          validator: (value, formValue) => {
            if (!value || !formValue.checkInDate) return null;
            const checkIn = new Date(formValue.checkInDate);
            const checkOut = new Date(value);

            // Must be after check-in
            if (checkOut <= checkIn) {
              return { invalidCheckOut: true };
            }

            // Minimum 1 night stay
            const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
            if (nights < 1) {
              return { minimumStay: true };
            }

            return null;
          },
          errorMessage: 'Check-out must be at least 1 day after check-in',
        },
      ],
      props: {
        appearance: 'outline',
        color: 'primary',
        hint: 'Select your departure date',
      },
    },
    {
      key: 'roomType',
      type: 'select',
      value: '',
      label: 'Room Type',
      required: true,
      options: [
        { value: 'single', label: 'Single Room' },
        { value: 'double', label: 'Double Room' },
        { value: 'suite', label: 'Suite' },
        { value: 'deluxe', label: 'Deluxe Suite' },
      ],
      props: {
        appearance: 'outline',
      },
    },
    {
      key: 'specialRequests',
      type: 'textarea',
      value: '',
      label: 'Special Requests',
      props: {
        appearance: 'outline',
        rows: 3,
        hint: 'Any special requirements or preferences',
      },
    },
    {
      type: 'submit',
      key: 'submit',
      label: 'Book Reservation',
      props: { color: 'primary' },
    },
  ],
} as const satisfies FormConfig;

@Component({
  selector: 'app-hotel-booking',
  imports: [DynamicFormComponent],
  template: `
    <df-dynamic-form [config]="config" [(value)]="formValue" (formSubmit)="onSubmit($event)" />

    @let nightCount = nights(); @let cost = totalCost(); @if (nightCount > 0) {
    <div class="booking-summary">
      <h3>Booking Summary</h3>
      <p>Nights: {{ nightCount }}</p>
      <p>Total: ${{ cost }}</p>
    </div>
    }
  `,
})
export class HotelBookingComponent {
  config = config;
  formValue = signal({
    fullName: '',
    checkInDate: null,
    checkOutDate: null,
    roomType: '',
    specialRequests: '',
  });

  nights = computed(() => {
    const data = this.formValue();
    if (!data.checkInDate || !data.checkOutDate) return 0;

    const checkIn = new Date(data.checkInDate);
    const checkOut = new Date(data.checkOutDate);
    return Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
  });

  totalCost = computed(() => {
    const data = this.formValue();
    const nightCount = this.nights();
    if (nightCount === 0) return 0;

    const roomRates: Record<string, number> = {
      single: 100,
      double: 150,
      suite: 250,
      deluxe: 400,
    };

    return nightCount * (roomRates[data.roomType] || 0);
  });

  onSubmit(value: typeof this.formValue) {
    console.log('Reservation details:', {
      ...value(),
      nights: this.nights(),
      totalCost: this.totalCost(),
    });
  }
}
```

## Type Inference

Datepicker fields infer as `Date | string | null | undefined`:

```typescript
const config = {
  fields: [{ key: 'date', type: 'datepicker', value: null }],
} as const satisfies FormConfig;

// Type: { date?: Date | string | null }
```

## Working with Date Values

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

## Accessibility

Datepicker fields include:

- Proper ARIA attributes
- Keyboard navigation (Arrow keys, Page Up/Down, Home/End, Escape)
- Screen reader announcements
- Focus management
- Calendar grid navigation
- Date format announcements

## Related

- **[Input](../../text-input/input/)** - For text-based date input
- **[Validation](../../../../../../core/validation/basics/)** - Form validation guide
- **[Conditional Logic](../../../../../../core/conditional-logic/basics/)** - Dynamic field behavior
- **[Type Safety](../../../../../../core/type-safety/basics/)** - Type inference details
