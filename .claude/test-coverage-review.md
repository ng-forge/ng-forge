# Angular 21 Upgrade: Test Coverage Review & Behavioral Validation

## Problem Statement

During the Angular 21.0.0-rc.2 upgrade (PR #29), multiple test assertions were removed with comments stating "Angular 21: Field directive handles X automatically". However, **removing test assertions doesn't verify the functionality still works** - it only removes verification of implementation details.

## Critical Issues to Address

### 1. Min/Max Date Constraints May Not Be Applied

**Files affected:**
- `packages/dynamic-form-bootstrap/src/lib/fields/datepicker/bs-datepicker.component.ts`
- `packages/dynamic-form-bootstrap/src/lib/fields/datepicker/bs-datepicker.spec.ts`
- Similar pattern in Material and PrimeNG datepicker components

**Problem:**
- The component still has `minDate` and `maxDate` inputs (lines 102-103)
- Helper signals `minAsString()` and `maxAsString()` exist (lines 116-124) but are **not used in the template**
- Template has no `[attr.min]` or `[attr.max]` bindings on the input element
- Tests that verified min/max attributes were removed (lines 43-44, 120-121, 461-462 in spec file)

**Questions to verify:**
1. Does Angular 21's Field directive automatically apply min/max constraints from the field schema?
2. If yes, are these constraints being configured in the form schema somewhere?
3. If no, the bindings need to be re-added to the template
4. Are the `minAsString()` helper signals now dead code that should be removed?

### 2. Readonly Property Handling

**File:** `packages/dynamic-form-bootstrap/src/lib/fields/input/bs-input.spec.ts:380-382`

**Removed test:**
```typescript
// OLD:
expect(input.nativeElement.readOnly).toBe(true);

// NEW:
// Angular 21: Field directive handles readonly bindings automatically
// The plaintext class provides the visual styling for readonly inputs
```

**Problem:**
- Comment claims Field directive handles it, but does it actually set the `readOnly` property?
- Or does it only rely on CSS styling via `form-control-plaintext` class?
- If users can still type in "readonly" inputs, that's a bug

### 3. MaxLength Attribute on Textarea

**File:** `packages/dynamic-form-material/src/lib/fields/textarea/mat-textarea.spec.ts:50-68, 234`

**Problem:**
- Tests renamed from "should apply maxlength attribute" to "should accept maxLength configuration"
- Comment says Field directive handles it automatically
- But does it actually enforce the maxLength constraint on the input element?

### 4. Slider Min/Max Constraints

**File:** `packages/dynamic-form-bootstrap/src/lib/fields/slider/bs-slider.spec.ts`

**Removed tests:**
```typescript
expect(sliderInput.nativeElement.getAttribute('min')).toBe('0');
expect(sliderInput.nativeElement.getAttribute('max')).toBe('100');
```

**Problem:**
- Sliders need min/max to function properly
- Need to verify these are still being applied

## Required Actions

### Task 1: Verify Angular 21 Field Directive Behavior

Research and document:
1. What attributes/properties does Angular 21's Field directive automatically manage?
2. Does it read from the form schema or from component inputs?
3. Create a test example to confirm actual behavior

### Task 2: Add Behavioral Tests (Not Implementation Tests)

Replace removed attribute checks with **behavioral validation tests**:

**Example for datepicker min/max:**
```typescript
it('should enforce min date constraint through validation', async () => {
  const config = BootstrapFormTestUtils.builder()
    .field({
      key: 'birthDate',
      type: 'datepicker',
      minDate: '2020-01-01',
      maxDate: '2025-12-31',
    })
    .build();

  const { component, fixture } = await BootstrapFormTestUtils.createTest({
    config,
    initialValue: { birthDate: null },
  });

  const field = component.form().controls.birthDate;

  // Try to set a date before min
  field.setValue('2019-12-31');
  field.markAsTouched();
  fixture.detectChanges();

  // Should be invalid due to min constraint
  expect(field.invalid()).toBe(true);
  expect(field.errors()).toContain('min');

  // Try valid date
  field.setValue('2022-06-15');
  expect(field.valid()).toBe(true);

  // Try date after max
  field.setValue('2026-01-01');
  expect(field.invalid()).toBe(true);
  expect(field.errors()).toContain('max');
});

it('should prevent user from selecting dates outside constraints via input element', async () => {
  // Test that the HTML5 date input actually has min/max attributes
  // so the browser native picker respects the constraints
  const config = BootstrapFormTestUtils.builder()
    .field({
      key: 'birthDate',
      type: 'datepicker',
      minDate: '2020-01-01',
      maxDate: '2025-12-31',
    })
    .build();

  const { fixture } = await BootstrapFormTestUtils.createTest({
    config,
    initialValue: { birthDate: null },
  });

  const input = fixture.debugElement.query(By.css('input[type="date"]'));

  // These attributes must be present for browser date pickers to work correctly
  expect(input.nativeElement.min).toBe('2020-01-01');
  expect(input.nativeElement.max).toBe('2025-12-31');
});
```

**Example for readonly:**
```typescript
it('should prevent user input when readonly is true', async () => {
  const config = BootstrapFormTestUtils.builder()
    .field({
      key: 'username',
      type: 'input',
      readonly: true,
      props: { plaintext: true }
    })
    .build();

  const { fixture } = await BootstrapFormTestUtils.createTest({
    config,
    initialValue: { username: 'john.doe' },
  });

  const input = fixture.debugElement.query(By.css('input'));

  // Verify readonly property is set (not just CSS)
  expect(input.nativeElement.readOnly).toBe(true);

  // Try to simulate user input
  input.nativeElement.value = 'hacker';
  input.nativeElement.dispatchEvent(new Event('input'));
  fixture.detectChanges();

  // Value should not change
  expect(input.nativeElement.value).toBe('john.doe');
});
```

### Task 3: Fix Template Bindings If Needed

If Field directive does NOT automatically apply these attributes:
1. Re-add `[attr.min]="minAsString()"` and `[attr.max]="maxAsString()"` to datepicker templates
2. Re-add other necessary attribute bindings
3. Update tests to verify both the attribute AND the behavior

If Field directive DOES handle it:
1. Remove dead code (e.g., `minAsString()`, `maxAsString()` helper signals)
2. Document how Field directive gets the min/max values
3. Ensure proper form schema configuration

### Task 4: Test All UI Libraries

Apply fixes consistently across:
- `packages/dynamic-form-bootstrap/`
- `packages/dynamic-form-material/`
- `packages/dynamic-form-primeng/`
- `packages/dynamic-form-ionic/`

## Success Criteria

- [ ] Documented proof that Field directive behavior matches expectations
- [ ] All min/max constraints work correctly (validated via behavioral tests)
- [ ] Readonly inputs actually prevent user typing
- [ ] MaxLength is enforced on textareas
- [ ] Slider constraints work properly
- [ ] No dead code remains (unused helper signals, etc.)
- [ ] Test coverage is equivalent or better than before the upgrade
- [ ] All tests pass: `pnpm test`

## Branch

Work on branch: `claude/upgrade-angular-21-rc2-01Hioo4gjYQRrLfjRABd7waS`

## Additional Context

This is a follow-up to PR #29 which upgraded Angular from 21.0.0-next.10 to 21.0.0-rc.2. The upgrade itself was done correctly, but test coverage was reduced without verifying the underlying functionality still works.
