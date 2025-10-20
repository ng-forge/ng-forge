ng-forge provides a flexible architecture that allows you to integrate with any UI framework. We maintain official integrations for popular frameworks and provide tools to create custom integrations.

## Official Integrations

### Material Design
Complete integration with Angular Material, providing beautiful Material Design components.

- **Package**: `@ng-forge/dynamic-form-material`
- **Features**: Material Design styling, enhanced props, accessibility support
- **Documentation**: [Material Design Integration](./material)

### Coming Soon

**PrimeNG Integration**
- Rich set of UI components with advanced features
- Package: `@ng-forge/dynamic-form-primeng` (in development)

**Bootstrap Integration** 
- Bootstrap styling with utility classes
- Package: `@ng-forge/dynamic-form-bootstrap` (in development)

## Creating Custom Integrations

You can create your own UI framework integration by implementing field components and registering them with ng-forge.

### Basic Integration Pattern

```typescript
import { Component } from '@angular/core';
import { provideField } from '@ng-forge/dynamic-form';

// 1. Create your field component
@Component({
  selector: 'custom-input',
  template: `
    <div class="custom-field">
      <label>{{ props.label }}</label>
      <input 
        [value]="value()"
        (input)="onInput($event)"
        [placeholder]="props.placeholder"
        [required]="props.required"
      />
    </div>
  `
})
export class CustomInputComponent {
  // Implementation details...
}

// 2. Create a provider function
export function withCustomFields() {
  return [
    provideField('input', CustomInputComponent),
    provideField('select', CustomSelectComponent),
    provideField('checkbox', CustomCheckboxComponent),
    // Add more field types as needed
  ];
}

// 3. Use in your app
export const appConfig: ApplicationConfig = {
  providers: [
    provideDynamicForm(),
    withCustomFields()
  ]
};
```

### Field Component Requirements

Custom field components should implement:

- **Value binding**: Handle form value changes
- **Validation**: Display validation errors
- **Props**: Accept and use field configuration properties
- **Accessibility**: Proper ARIA attributes and keyboard navigation

### Helper Functions

You can also provide helper functions for common field configurations:

```typescript
export function submitButton(props: SubmitButtonProps): FieldConfig {
  return {
    key: '_submit',
    type: 'submit',
    props: {
      label: 'Submit',
      variant: 'primary',
      ...props
    }
  };
}
```

## Integration Guidelines

When creating UI framework integrations:

1. **Maintain API Compatibility**: Keep the same field configuration structure
2. **Enhance with Framework Features**: Add framework-specific props and styling
3. **Provide TypeScript Support**: Include proper type definitions
4. **Follow Accessibility Standards**: Ensure components are accessible
5. **Document Extensions**: Clearly document any additional props or features

## Contributing

We welcome contributions for additional UI framework integrations. Please see our [contribution guidelines] for more information on how to create and submit new integrations.