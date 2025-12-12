# Coding Standards

This document defines the coding standards and conventions for the ng-forge dynamic forms project. These standards ensure consistency, maintainability, and code quality across the codebase.

## Table of Contents

- [General Principles](#general-principles)
- [TypeScript Standards](#typescript-standards)
- [Angular Standards](#angular-standards)
- [Component Standards](#component-standards)
- [State Management](#state-management)
- [Templates](#templates)
- [Styling](#styling)
- [Testing Standards](#testing-standards)
- [File Organization](#file-organization)
- [Naming Conventions](#naming-conventions)
- [Documentation Standards](#documentation-standards)
- [Performance Guidelines](#performance-guidelines)
- [Commit Messages](#commitlint)

## General Principles

### Code Quality

- **Write clean, readable code** - Code is read more than written
- **Follow DRY principle** - Don't Repeat Yourself
- **KISS principle** - Keep It Simple, Stupid
- **YAGNI principle** - You Aren't Gonna Need It
- **Single Responsibility** - One class/function, one purpose

### Best Practices

✅ **DO:**

- Write self-documenting code
- Keep functions small (< 20 lines ideally)
- Use meaningful variable and function names
- Comment complex logic (why, not what)
- Handle errors gracefully
- Write tests for all new code

❌ **DON'T:**

- Use magic numbers (define constants)
- Write deeply nested code (> 3 levels)
- Leave commented-out code
- Use abbreviations in names
- Ignore TypeScript errors
- Skip error handling

## TypeScript Standards

### Type Safety

✅ **DO:**

```typescript
// Use strict type checking
const user: User = { id: 1, name: 'John' };

// Prefer type inference
const count = 5; // TypeScript infers number

// Use unknown for uncertain types
function parse(input: unknown): User {
  if (typeof input === 'object' && input !== null) {
    return input as User;
  }
  throw new Error('Invalid input');
}

// Use const assertions
const config = {
  fields: [{ key: 'email', type: 'input' }],
} as const satisfies FormConfig;
```

❌ **DON'T:**

```typescript
// Avoid any
const user: any = { id: 1, name: 'John' };

// Don't disable strict checks
// @ts-ignore
const value = unknownFunction();

// Don't use loose typing
const items: object[] = []; // Use specific type
```

### Interfaces vs Types

✅ **Use interfaces for:**

- Object shapes
- Public API contracts
- When you might extend later

✅ **Use types for:**

- Union types
- Intersection types
- Mapped types
- Type aliases

```typescript
// Interface - object shape
interface User {
  id: number;
  name: string;
}

// Type - union
type Status = 'pending' | 'active' | 'inactive';

// Type - complex type
type ExtractFormValue<T> = T extends { fields: infer F } ? F : never;
```

### Enums

✅ **Prefer const enums** or **union types**:

```typescript
// Option 1: Const enum
const enum FieldType {
  INPUT = 'input',
  SELECT = 'select',
  CHECKBOX = 'checkbox',
}

// Option 2: Union type (preferred for exported types)
type FieldType = 'input' | 'select' | 'checkbox';
```

❌ **Avoid regular enums** (they generate runtime code)

## Angular Standards

### Component Architecture

✅ **ALWAYS:**

- Use standalone components
- Use OnPush change detection
- Use signals for state management
- Use `input()` and `output()` functions
- Use `inject()` for dependency injection

❌ **NEVER:**

- Use NgModules
- Use `@Input()` or `@Output()` decorators
- Use `@HostBinding()` or `@HostListener()` decorators
- Use constructor injection

### Modern Angular Patterns

✅ **DO:**

```typescript
@Component({
  selector: 'app-user-form',
  imports: [CommonModule, FormsModule],
  template: `
    @let user = userSignal();
    @if (user) {
      <div>{{ user.name }}</div>
    } @else {
      <div>Loading...</div>
    }
    @for (item of items(); track item.id) {
      <div>{{ item.name }}</div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'className()',
    '[attr.data-testid]': 'testId()',
    '(click)': 'onClick()',
  },
})
export class UserFormComponent {
  // Signals for state
  userSignal = signal<User | null>(null);
  items = signal<Item[]>([]);

  // Inputs
  className = input<string>('');
  testId = input<string>('');

  // Outputs
  submitted = output<User>();

  // Computed
  displayName = computed(() => {
    const user = this.userSignal();
    return user ? `${user.firstName} ${user.lastName}` : 'Guest';
  });

  // Dependency injection
  private http = inject(HttpClient);

  onClick(): void {
    // Handle click
  }
}
```

❌ **DON'T:**

```typescript
@Component({
  selector: 'app-user-form',
  template: `
    <div *ngIf="user">{{ user.name }}</div>
    <div *ngFor="let item of items">{{ item.name }}</div>
  `,
})
export class UserFormComponent {
  @Input() className?: string;
  @Output() submitted = new EventEmitter<User>();
  @HostBinding('class') get hostClass() {
    return this.className;
  }

  constructor(private http: HttpClient) {}
}
```

## Component Standards

### Component Structure

Organize component code in this order:

```typescript
@Component({
  // 1. Metadata
})
export class MyComponent {
  // 2. Inputs (required first, then optional)
  readonly field = input.required<FieldTree<string>>();
  readonly key = input.required<string>();
  readonly label = input<DynamicText>();

  // 3. Outputs
  readonly clicked = output<void>();

  // 4. Signals (state)
  private count = signal(0);

  // 5. Computed
  readonly displayCount = computed(() => this.count() * 2);

  // 6. Dependency injection
  private service = inject(MyService);

  // 7. Lifecycle hooks
  constructor() {
    effect(() => {
      console.log('Count:', this.count());
    });
  }

  // 8. Public methods
  increment(): void {
    this.count.update((c) => c + 1);
  }

  // 9. Private methods
  private helper(): void {
    // ...
  }
}
```

### Small, Focused Components

✅ **DO:**

- Keep components under 200 lines
- Extract complex logic to services
- Create child components for reusable parts
- Use composition over inheritance

## State Management

### Signals

✅ **DO:**

```typescript
// Use signals for reactive state
private count = signal(0);

// Use computed for derived state
readonly doubled = computed(() => this.count() * 2);

// Use set or update, not mutate
this.count.set(5);
this.count.update(c => c + 1);

// Use effect for side effects
constructor() {
  effect(() => {
    console.log('Count changed:', this.count());
  });
}
```

❌ **DON'T:**

```typescript
// Don't use mutate
this.items.mutate((items) => items.push(newItem)); // ❌

// Don't modify objects in signals directly
const user = this.user();
user.name = 'New Name'; // ❌
```

### RxJS

✅ **Use RxJS for:**

- HTTP requests
- Event streams
- Async operations
- Complex data transformations

✅ **Prefer signals for:**

- Component state
- Derived values
- Simple reactive data

## Templates

### Template Syntax

✅ **DO:**

```typescript
template: `
  @let user = userSignal();
  @let isAdmin = user?.role === 'admin';

  @if (user) {
    <div [class.highlight]="isAdmin">
      {{ user.name }}
    </div>
  } @else {
    <div>No user</div>
  }

  @for (item of items(); track item.id) {
    <div [style.color]="item.color">{{ item.name }}</div>
  }

  @switch (status()) {
    @case ('pending') { <span>Pending</span> }
    @case ('active') { <span>Active</span> }
    @default { <span>Unknown</span> }
  }
`;
```

❌ **DON'T:**

```typescript
template: `
  <div *ngIf="user">{{ user.name }}</div>
  <div *ngFor="let item of items">{{ item.name }}</div>
  <div [ngClass]="{ active: isActive }">Class</div>
  <div [ngStyle]="{ color: color }">Style</div>
`;
```

### Template Best Practices

✅ **DO:**

- Use `@let` for template variables
- Use `track` in `@for` loops
- Keep templates simple
- Extract complex logic to component
- Use `async` pipe for observables

❌ **DON'T:**

- Call functions in templates (use computed)
- Have complex expressions in templates
- Nest too deeply (> 3 levels)

## Styling

### CSS/SCSS

✅ **DO:**

```scss
// Use BEM naming
.df-prime-field {
  &__label {
    font-weight: 500;
  }

  &__input {
    border: 1px solid var(--border-color);

    &--error {
      border-color: var(--error-color);
    }
  }
}

// Use CSS variables for theming
:host {
  --field-spacing: 1rem;
  --label-color: #333;
}

// Scope styles
:host {
  display: block;
  padding: var(--field-spacing);
}
```

❌ **DON'T:**

```scss
// Don't use global styles
div {
  margin: 10px;
}

// Don't use !important
.class {
  color: red !important;
}

// Don't use magic numbers
.spacing {
  margin: 13.5px;
}
```

## Testing Standards

### Test Structure

✅ **DO:**

```typescript
describe('MyComponent', () => {
  // Arrange
  let fixture: ComponentFixture<MyComponent>;
  let component: MyComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MyComponent);
    component = fixture.componentInstance;
  });

  // Test names are descriptive
  it('should show error when input is invalid', () => {
    // Arrange
    fixture.componentRef.setInput('value', 'invalid');

    // Act
    fixture.detectChanges();

    // Assert
    expect(component.hasError()).toBe(true);
  });
});
```

### Test Coverage

Target coverage:

- **Statements**: > 80%
- **Branches**: > 75%
- **Functions**: > 80%
- **Lines**: > 80%

### What to Test

✅ **DO test:**

- Component rendering
- User interactions
- State changes
- Edge cases
- Error handling
- Accessibility

❌ **DON'T test:**

- Implementation details
- Framework behavior
- Third-party libraries

## File Organization

### File Structure

```
component-name/
├── component-name.component.ts    # Component
├── component-name.component.html  # Template (if external)
├── component-name.component.scss  # Styles (if external)
├── component-name.component.spec.ts # Tests
├── component-name.type.ts         # Type definitions
└── index.ts                       # Barrel export
```

### Barrel Exports

```typescript
// index.ts
export { default as MyComponent } from './my.component';
export * from './my.type';
```

### Import Organization

```typescript
// 1. Angular imports
import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

// 2. Third-party imports
import { Select } from 'primeng/select';

// 3. Internal imports (absolute)
import { DynamicTextPipe } from '@ng-forge/dynamic-forms';

// 4. Relative imports
import { MyService } from '../services/my.service';
import { MyType } from './my.type';
```

## Naming Conventions

### General Rules

- **camelCase**: Variables, functions, properties
- **PascalCase**: Classes, interfaces, types, components
- **UPPER_SNAKE_CASE**: Constants
- **kebab-case**: File names, CSS classes

### Specific Conventions

```typescript
// Components
class UserFormComponent { }              // PascalCase + Component suffix
class PrimeInputFieldComponent { }       // Library + Type + Field + Component

// Interfaces
interface User { }                       // PascalCase, no I prefix
interface FieldDef<TProps> { }          // Generic type params: T prefix

// Types
type InputField = ...;                   // PascalCase
type ExtractFormValue<T> = ...;         // PascalCase

// Functions
function createMapper() { }              // camelCase, verb + noun
function withPrimeNGFields() { }        // with + Name + Fields

// Constants
const MAX_RETRY_COUNT = 3;              // UPPER_SNAKE_CASE
const DEFAULT_TIMEOUT = 5000;

// Signals
private readonly userSignal = signal();  // suffix with Signal
readonly count = signal(0);              // or plain name if context clear

// Observables
const user$ = of(user);                  // suffix with $

// Files
user-form.component.ts                   // kebab-case
prime-input.type.ts
my-service.service.ts
```

## Documentation Standards

### TSDoc

✅ **DO:**

````typescript
/**
 * Represents a dynamic form field definition.
 *
 * @typeParam TProps - Field-specific properties interface
 *
 * @example
 * ```typescript
 * const field: FieldDef<InputProps> = {
 *   key: 'email',
 *   type: 'input',
 *   label: 'Email Address',
 *   props: { placeholder: 'Enter email' },
 * };
 * ```
 *
 * @public
 */
export interface FieldDef<TProps> {
  /**
   * Unique field identifier for form binding.
   *
   * @remarks
   * Must be unique within the form and follow object property naming conventions.
   */
  key: string;

  /**
   * Field type identifier for component selection.
   *
   * @value undefined
   */
  type: string;
}
````

### Documentation Requirements

✅ **Document:**

- All public APIs
- Complex algorithms
- Non-obvious code
- Type parameters
- Default values
- Examples

❌ **Don't document:**

- Obvious code
- Private implementation details
- Temporary code

## Performance Guidelines

### Optimization Techniques

✅ **DO:**

```typescript
// Use OnPush change detection
changeDetection: ChangeDetectionStrategy.OnPush

// Use trackBy in lists
@for (item of items(); track item.id) { }

// Use computed for derived values
readonly total = computed(() => {
  return this.items().reduce((sum, item) => sum + item.price, 0);
});

// Lazy load components
loadComponent: () => import('./my.component')

// Use memoization for expensive operations
private memoizedResult = memoize(
  (input: string) => expensiveOperation(input)
);
```

❌ **DON'T:**

```typescript
// Don't call functions in templates
{
  {
    calculateTotal();
  }
} // ❌ Use computed instead

// Don't create objects in templates
[config] = "{ value: 'test' }"; // ❌ Create in component

// Don't use large bundles
import * as _ from 'lodash'; // ❌ Use lodash-es for tree-shaking
```

## Code Review Checklist

Before submitting code for review, ensure:

- [ ] Code follows all standards in this document
- [ ] All tests pass
- [ ] No linting errors
- [ ] Code is properly formatted
- [ ] Public APIs are documented
- [ ] Changes are covered by tests
- [ ] No console.log() statements
- [ ] No commented-out code
- [ ] Type safety maintained
- [ ] Performance considered

## Tools & Automation

### ESLint

Run before committing:

```bash
pnpm lint
pnpm lint:fix
```

### Prettier

Code formatting (auto-run on save):

```bash
pnpm format
```

### Lefthook

Pre-commit hooks enforce:

- Linting
- Formatting
- Type checking
- Unit tests

### Commitlint

Commit messages must follow Angular conventional commit format:

```bash
# Format
<type>(<scope>): <subject>

# Examples
feat(dynamic-forms): add async validator support
fix(primeng): correct select option binding
docs: update contributing guidelines
```

**Allowed types:** `feat`, `fix`, `perf`, `refactor`, `docs`, `test`, `build`, `ci`, `chore`, `style`, `revert`

**Allowed scopes:** `core`, `forms`, `dynamic-forms`, `material`, `bootstrap`, `primeng`, `ionic`, `docs`, `examples`, `release`, `deps`, `config`

**Rules:**

- Subject must be lowercase
- No period at end
- Max 100 characters
- Imperative mood ("add" not "added")

Test your commit message:

```bash
echo "feat(dynamic-forms): add new feature" | pnpm commitlint
```

## Summary

Following these coding standards ensures:

- ✅ Consistent codebase
- ✅ Maintainable code
- ✅ Better collaboration
- ✅ Fewer bugs
- ✅ Better performance
- ✅ Professional quality

When in doubt, look at existing code and follow the patterns used there.
