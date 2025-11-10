# Slider

Numeric slider control with Material Design styling for selecting values from a range.

## Live Demo

{{ NgDocActions.demo("SliderIframeDemoComponent") }}

## Basic Usage

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

## Field Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `key` | `string` | - | Unique field identifier |
| `type` | `'slider'` | - | Field type |
| `value` | `number` | - | Initial value |
| `label` | `string` | - | Field label |
| `minValue` | `number` | `0` | Minimum value |
| `maxValue` | `number` | `100` | Maximum value |
| `step` | `number` | `1` | Increment step |
| `disabled` | `boolean` | - | Disables the slider |
| `readonly` | `boolean` | - | Makes field read-only |
| `hidden` | `boolean` | - | Hides the field |

## Props (Material-Specific)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `thumbLabel` / `showThumbLabel` | `boolean` | `false` | Show value tooltip on thumb |
| `tickInterval` | `number \| 'auto'` | - | Show tick marks at intervals |
| `color` | `'primary' \| 'accent' \| 'warn'` | `'primary'` | Material theme color |
| `hint` | `string` | - | Help text below slider |

## Examples

### Basic Slider

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

### With Thumb Label

```typescript
{
  key: 'volume',
  type: 'slider',
  value: 50,
  label: 'Volume Level',
  minValue: 0,
  maxValue: 100,
  step: 1,
  props: {
    thumbLabel: true,
    color: 'accent',
    hint: 'Adjust the volume level',
  },
}
```

### With Tick Marks

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

### Auto Tick Interval

```typescript
{
  key: 'temperature',
  type: 'slider',
  value: 22,
  label: 'Temperature (°C)',
  minValue: 16,
  maxValue: 30,
  step: 0.5,
  props: {
    showThumbLabel: true,
    tickInterval: 'auto',
    color: 'primary',
    hint: 'Set your preferred temperature',
  },
}
```

### Large Range with Step

```typescript
{
  key: 'budget',
  type: 'slider',
  value: 5000,
  label: 'Budget',
  minValue: 0,
  maxValue: 20000,
  step: 500,
  props: {
    thumbLabel: true,
    tickInterval: 5,
    color: 'primary',
    hint: 'Select your budget range',
  },
}
```

### Fine-Grained Control

```typescript
{
  key: 'opacity',
  type: 'slider',
  value: 1.0,
  label: 'Opacity',
  minValue: 0,
  maxValue: 1,
  step: 0.01,
  props: {
    showThumbLabel: true,
    color: 'accent',
  },
}
```

### With Accent Color

```typescript
{
  key: 'progress',
  type: 'slider',
  value: 75,
  label: 'Completion Progress',
  minValue: 0,
  maxValue: 100,
  step: 5,
  props: {
    color: 'accent',
    thumbLabel: true,
    tickInterval: 10,
    hint: 'Track your progress',
  },
}
```

### Negative to Positive Range

```typescript
{
  key: 'adjustment',
  type: 'slider',
  value: 0,
  label: 'Balance',
  minValue: -10,
  maxValue: 10,
  step: 1,
  props: {
    showThumbLabel: true,
    tickInterval: 2,
    hint: 'Adjust left (-) or right (+)',
  },
}
```

## Validation

### Required Slider

```typescript
{
  key: 'priority',
  type: 'slider',
  value: 5,
  label: 'Task Priority',
  minValue: 1,
  maxValue: 10,
  step: 1,
  required: true,
  props: {
    thumbLabel: true,
    tickInterval: 1,
    hint: '1 = Low, 10 = Critical',
  },
}
```

### Custom Min/Max Validation

```typescript
{
  key: 'age',
  type: 'slider',
  value: 25,
  label: 'Age',
  minValue: 18,
  maxValue: 100,
  step: 1,
  validators: [{
    type: 'min',
    value: 21,
    errorMessage: 'You must be at least 21 years old',
  }],
  props: {
    showThumbLabel: true,
  },
}
```

### Range Validation

```typescript
{
  key: 'discount',
  type: 'slider',
  value: 10,
  label: 'Discount Percentage',
  minValue: 0,
  maxValue: 50,
  step: 5,
  validators: [
    {
      type: 'max',
      value: 25,
      errorMessage: 'Maximum discount is 25%',
    },
  ],
  props: {
    thumbLabel: true,
    color: 'primary',
  },
}
```

## Conditional Logic

### Show Field Based on Slider Value

```typescript
const config = {
  fields: [
    {
      key: 'teamSize',
      type: 'slider',
      value: 1,
      label: 'Team Size',
      minValue: 1,
      maxValue: 50,
      step: 1,
      props: {
        showThumbLabel: true,
        tickInterval: 5,
      },
    },
    {
      key: 'teamLead',
      type: 'input',
      value: '',
      label: 'Team Lead Name',
      logic: [{
        type: 'hidden',
        condition: {
          type: 'custom',
          validator: (_, formValue) => formValue.teamSize <= 1,
        },
      }, {
        type: 'required',
        condition: {
          type: 'custom',
          validator: (_, formValue) => formValue.teamSize > 1,
        },
        errorMessage: 'Team lead is required for teams larger than 1',
      }],
      props: {
        appearance: 'outline',
      },
    },
  ],
} as const satisfies FormConfig;
```

### Dynamic Validation Based on Slider

```typescript
const config = {
  fields: [
    {
      key: 'risk',
      type: 'slider',
      value: 5,
      label: 'Risk Level',
      minValue: 1,
      maxValue: 10,
      step: 1,
      props: {
        showThumbLabel: true,
        tickInterval: 1,
        hint: '1 = Low Risk, 10 = High Risk',
      },
    },
    {
      key: 'justification',
      type: 'textarea',
      value: '',
      label: 'Risk Justification',
      logic: [{
        type: 'hidden',
        condition: {
          type: 'custom',
          validator: (_, formValue) => formValue.risk < 7,
        },
      }, {
        type: 'required',
        condition: {
          type: 'custom',
          validator: (_, formValue) => formValue.risk >= 7,
        },
        errorMessage: 'Justification required for high-risk levels',
      }],
      props: {
        rows: 4,
        hint: 'Explain why this risk level is necessary',
      },
    },
  ],
} as const satisfies FormConfig;
```

## Complete Example

```typescript
import { Component, signal, computed } from '@angular/core';
import { FormConfig, DynamicFormComponent } from '@ng-forge/dynamic-form';

const config = {
  fields: [
    {
      key: 'productName',
      type: 'input',
      value: '',
      label: 'Product Name',
      required: true,
      props: {
        appearance: 'outline',
      },
    },
    {
      key: 'quantity',
      type: 'slider',
      value: 1,
      label: 'Quantity',
      minValue: 1,
      maxValue: 100,
      step: 1,
      props: {
        showThumbLabel: true,
        tickInterval: 10,
        color: 'primary',
        hint: 'Select quantity (1-100)',
      },
    },
    {
      key: 'quality',
      type: 'slider',
      value: 5,
      label: 'Quality Level',
      minValue: 1,
      maxValue: 10,
      step: 1,
      props: {
        thumbLabel: true,
        tickInterval: 1,
        color: 'accent',
        hint: '1 = Basic, 10 = Premium',
      },
    },
    {
      key: 'discount',
      type: 'slider',
      value: 0,
      label: 'Discount (%)',
      minValue: 0,
      maxValue: 50,
      step: 5,
      props: {
        showThumbLabel: true,
        tickInterval: 5,
        color: 'primary',
      },
    },
    {
      key: 'bulkOrderDiscount',
      type: 'slider',
      value: 0,
      label: 'Bulk Order Discount (%)',
      minValue: 0,
      maxValue: 20,
      step: 5,
      logic: [{
        type: 'hidden',
        condition: {
          type: 'custom',
          validator: (_, formValue) => formValue.quantity < 10,
        },
      }],
      props: {
        thumbLabel: true,
        color: 'accent',
        hint: 'Available for orders of 10+',
      },
    },
    {
      type: 'submit',
      key: 'submit',
      label: 'Calculate Price',
      props: { color: 'primary' },
    },
  ],
} as const satisfies FormConfig;

@Component({
  selector: 'app-pricing-calculator',
  imports: [DynamicFormComponent],
  template: `
    <df-dynamic-form
      [config]="config"
      [(value)]="formValue"
      (formSubmit)="onSubmit($event)"
    />

    @if (totalPrice()) {
      <div class="price-summary">
        <h3>Price Summary</h3>
        <p>Quantity: {{ formValue().quantity }}</p>
        <p>Quality Level: {{ formValue().quality }}/10</p>
        <p>Base Price: ${{ basePrice() }}</p>
        <p>Discount: {{ totalDiscount() }}%</p>
        <p><strong>Total: ${{ totalPrice() }}</strong></p>
      </div>
    }
  `,
})
export class PricingCalculatorComponent {
  config = config;
  formValue = signal({
    productName: '',
    quantity: 1,
    quality: 5,
    discount: 0,
    bulkOrderDiscount: 0,
  });

  basePrice = computed(() => {
    const data = this.formValue();
    const qualityMultiplier = data.quality / 5; // Quality affects base price
    return data.quantity * 10 * qualityMultiplier;
  });

  totalDiscount = computed(() => {
    const data = this.formValue();
    return data.discount + (data.quantity >= 10 ? data.bulkOrderDiscount : 0);
  });

  totalPrice = computed(() => {
    const base = this.basePrice();
    const discount = this.totalDiscount();
    return (base * (1 - discount / 100)).toFixed(2);
  });

  onSubmit(value: typeof this.formValue) {
    console.log('Price calculated:', {
      ...value(),
      basePrice: this.basePrice(),
      totalDiscount: this.totalDiscount(),
      totalPrice: this.totalPrice(),
    });
  }
}
```

## Type Inference

Slider fields infer as `number`:

```typescript
const config = {
  fields: [
    { key: 'volume', type: 'slider', value: 50, minValue: 0, maxValue: 100 },
  ],
} as const satisfies FormConfig;

// Type: { volume: number }
```

## Accessibility

Slider fields include:
- Proper ARIA slider role
- Keyboard navigation (Arrow keys, Page Up/Down, Home/End)
- Screen reader value announcements
- Focus management
- Label associations
- Min/max value announcements

## Related

- **[Input](../../text-input/input/)** - For text-based number input
- **[Select](../../selection/select/)** - For discrete value selection
- **[Conditional Logic](../../../../../../core/conditional-logic/basics/)** - Dynamic field behavior
- **[Validation](../../../../../../core/validation/basics/)** - Form validation guide
