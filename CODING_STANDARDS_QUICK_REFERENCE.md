# Coding Standards - Quick Reference

> **Quick reference guide for ng-forge coding standards. For complete details, see [CODING_STANDARDS.md](./CODING_STANDARDS.md)**

## Top 20 Rules

### Angular Components (Modern Patterns Only!)

```typescript
✅ DO:
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  template: `
    @let user = userSignal();
    @if (user) { <div>{{ user.name }}</div> }
    @for (item of items(); track item.id) { <div>{{ item.name }}</div> }
  `
})
export class MyComponent {
  readonly userSignal = signal<User | null>(null);
  readonly field = input.required<FieldTree<string>>();
  readonly submitted = output<User>();
  private service = inject(MyService);
}

❌ DON'T:
- Use NgModules
- Use @Input() or @Output() decorators
- Use *ngIf, *ngFor, *ngSwitch (use @if, @for, @switch)
- Use constructor injection
```

### TypeScript Type Safety

```typescript
✅ DO:
const user: User = { id: 1, name: 'John' };
function parse(input: unknown): User { /* ... */ }
const config = { fields: [...] } as const satisfies FormConfig;

❌ DON'T:
- Use `any` (use `unknown` for uncertain types)
- Use `@ts-ignore` or `@ts-expect-error`
- Disable strict checks
```

### State Management

```typescript
✅ DO:
private count = signal(0);
readonly doubled = computed(() => this.count() * 2);
this.count.set(5);         // or
this.count.update(c => c + 1);

❌ DON'T:
this.items.mutate(items => items.push(newItem)); // Don't use mutate
```

### Templates

```typescript
✅ DO:
template: `
  @let isAdmin = user()?.role === 'admin';
  @if (isAdmin) { ... }
  @for (item of items(); track item.id) { ... }
`

❌ DON'T:
template: `{{ calculateTotal() }}`  // Don't call functions - use computed()
[config]="{ value: 'test' }"        // Don't create objects - create in component
```

### Component Structure (Order Matters!)

```typescript
@Component({
  /* ... */
})
export class MyComponent {
  // 1. Inputs (required first, then optional)
  readonly field = input.required<FieldTree<string>>();
  readonly label = input<DynamicText>();

  // 2. Outputs
  readonly clicked = output<void>();

  // 3. Signals (state)
  private count = signal(0);

  // 4. Computed
  readonly displayCount = computed(() => this.count() * 2);

  // 5. Dependency injection
  private service = inject(MyService);

  // 6. Lifecycle hooks / constructor
  constructor() {
    /* ... */
  }

  // 7. Public methods
  increment(): void {
    /* ... */
  }

  // 8. Private methods
  private helper(): void {
    /* ... */
  }
}
```

### Testing

```typescript
✅ DO:
describe('MyComponent', () => {
  it('should show error when input is invalid', () => {
    // Arrange
    const config = TestUtils.builder().field({ key: 'test', type: 'input' }).build();

    // Act
    const { fixture } = await TestUtils.createTest({ config });

    // Assert
    expect(component.hasError()).toBe(true);
  });
});

- Aim for >80% coverage
- Test from user perspective
- Test edge cases
```

### File Naming & Organization

```
✅ DO:
user-form.component.ts       // kebab-case for files
PascalCase                    // for classes, interfaces, types
camelCase                     // for variables, functions
UPPER_SNAKE_CASE              // for constants

component-name/
├── component-name.component.ts
├── component-name.component.spec.ts
├── component-name.type.ts
└── index.ts
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
```

### Performance

```typescript
✅ DO:
changeDetection: ChangeDetectionStrategy.OnPush
@for (item of items(); track item.id) { }
readonly total = computed(() => this.items().reduce(...));

❌ DON'T:
{{ calculateTotal() }}              // Don't call functions in templates
import * as _ from 'lodash';        // Use lodash-es for tree-shaking
```

### Documentation (TSDoc)

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
 * };
 * ```
 *
 * @public
 */
export interface FieldDef<TProps> {
  /** Unique field identifier */
  key: string;
  /** Field type identifier */
  type: string;
}
````

## Pre-Commit Checklist

Before committing code, ensure:

- [ ] Code follows all standards above
- [ ] All tests pass: `pnpm test`
- [ ] No linting errors: `pnpm lint`
- [ ] Code is formatted: `pnpm lint:fix`
- [ ] Public APIs are documented with TSDoc
- [ ] No `console.log()` statements
- [ ] No commented-out code
- [ ] Type safety maintained (no `any`)

## Common Mistakes to Avoid

### ❌ Old Angular Patterns

```typescript
// Don't use these anymore!
*ngIf / *ngFor / *ngSwitch
@Input() / @Output()
@HostBinding() / @HostListener()
constructor(private service: Service)
NgModules
```

### ❌ Template Anti-Patterns

```typescript
{{ getLabel() }}                    // Use computed() instead
*ngIf="condition"                   // Use @if
<div [ngClass]="{ ... }">          // Use [class.foo]
```

### ❌ Type Safety Issues

```typescript
function process(data: any); // Use unknown
// @ts-ignore                       // Fix the type error
const value: object[]; // Use specific type
```

## Quick Tools Reference

```bash
# Linting
pnpm lint              # Check for errors
pnpm lint:fix          # Auto-fix errors

# Testing
pnpm test              # Run all tests
pnpm test:watch        # Watch mode

# Building
pnpm build:libs        # Build libraries
pnpm build:all:prod    # Production build

# Formatting
pnpm format            # Format code (runs automatically)
```

## When in Doubt

1. **Look at existing code** - Follow patterns used in the codebase
2. **Check the full guide** - See [CODING_STANDARDS.md](./CODING_STANDARDS.md)
3. **Ask in PR** - Request clarification from maintainers

---

**For complete coding standards, examples, and advanced patterns, see [CODING_STANDARDS.md](./CODING_STANDARDS.md)**
