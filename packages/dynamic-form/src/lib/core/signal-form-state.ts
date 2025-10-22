import { computed, effect, Signal, signal, WritableSignal } from '@angular/core';
import { FieldDef, FieldState, FormState, ValidationError, ValidationRules } from '../models/field-config';

/**
 * Signal-based form state manager following Angular Architects patterns
 * Inspired by the example implementation but with enhanced functionality
 */
export class SignalFormState<TFields extends readonly FieldDef[]> {
  private readonly _fields: Record<string, FieldSignalState<unknown>> = {};
  private readonly _formValue: WritableSignal<Record<string, unknown>>;
  private readonly _submitted = signal(false);
  private readonly _disabled = signal(false);

  constructor(private readonly fieldDefs: TFields) {
    // Initialize form value with default values
    const initialValue = this.createInitialValue();
    this._formValue = signal(initialValue);

    // Initialize field states
    this.initializeFields();

    // Set up reactive evaluations
    this.setupReactivity();
  }

  /**
   * Get field state by key
   */
  getField(key: string): FieldState<unknown> | undefined {
    return this._fields[key];
  }

  /**
   * Get all field states
   */
  get fields(): Record<string, FieldState<unknown>> {
    return { ...this._fields };
  }

  /**
   * Form value signal - reactive to all field changes
   */
  get value(): Signal<Record<string, unknown>> {
    return this._formValue.asReadonly();
  }

  /**
   * Form valid state - computed from all field validations
   */
  readonly valid = computed(() => {
    return Object.values(this._fields).every((field) => field.valid());
  });

  /**
   * Form dirty state - true if any field is dirty
   */
  readonly dirty = computed(() => {
    return Object.values(this._fields).some((field) => field.dirty());
  });

  /**
   * Form errors - aggregated from all fields
   */
  readonly errors = computed(() => {
    const allErrors: ValidationError[] = [];
    Object.values(this._fields).forEach((field) => {
      allErrors.push(...field.errors());
    });
    return allErrors;
  });

  /**
   * Form submitted state
   */
  get submitted(): Signal<boolean> {
    return this._submitted.asReadonly();
  }

  /**
   * Form disabled state
   */
  get disabled(): Signal<boolean> {
    return this._disabled.asReadonly();
  }

  /**
   * Update field value - triggers validation and conditionals
   */
  updateField(key: string, value: unknown): void {
    const fieldState = this._fields[key];
    if (!fieldState) return;

    // Update field value
    fieldState.setValue(value);

    // Update form value
    const currentFormValue = this._formValue();
    this._formValue.set({
      ...currentFormValue,
      [key]: value,
    });

    // Validation and conditionals are handled reactively
  }

  /**
   * Mark field as touched
   */
  markFieldAsTouched(key: string): void {
    const fieldState = this._fields[key];
    if (fieldState) {
      fieldState.markAsTouched();
    }
  }

  /**
   * Set form submitted state
   */
  setSubmitted(submitted: boolean): void {
    this._submitted.set(submitted);
  }

  /**
   * Set form disabled state
   */
  setDisabled(disabled: boolean): void {
    this._disabled.set(disabled);
    Object.values(this._fields).forEach((field) => {
      field.setDisabled(disabled);
    });
  }

  /**
   * Validate entire form
   */
  validateForm(): boolean {
    this.fieldDefs.forEach((fieldDef) => {
      this.validateField(fieldDef.key);
    });

    return this.valid();
  }

  /**
   * Reset form to initial state
   */
  reset(): void {
    const initialValue = this.createInitialValue();
    this._formValue.set(initialValue);
    this._submitted.set(false);

    Object.values(this._fields).forEach((field) => {
      field.reset();
    });
  }

  /**
   * Get form state snapshot
   */
  getState(): FormState<Record<string, unknown>> {
    return {
      value: this.value,
      errors: this.errors,
      valid: this.valid,
      dirty: this.dirty,
      submitted: this.submitted,
      disabled: this.disabled,
    };
  }

  private createInitialValue(): Record<string, unknown> {
    const initialValue: Record<string, unknown> = {};

    this.fieldDefs.forEach((fieldDef) => {
      if (fieldDef.defaultValue !== undefined) {
        initialValue[fieldDef.key] = fieldDef.defaultValue;
      }
    });

    return initialValue;
  }

  private initializeFields(): void {
    this.fieldDefs.forEach((fieldDef) => {
      const initialValue = this._formValue()[fieldDef.key] ?? fieldDef.defaultValue;
      this._fields[fieldDef.key] = new FieldSignalState(initialValue);
    });
  }

  private setupReactivity(): void {
    // Set up reactive validation - runs whenever form value changes
    effect(() => {
      const formValue = this._formValue();
      this.fieldDefs.forEach((fieldDef) => {
        this.validateField(fieldDef.key);
      });
    });

    // Set up reactive conditionals - runs whenever form value changes
    effect(() => {
      const formValue = this._formValue();
      this.evaluateConditionals(formValue);
    });
  }

  private validateField(key: string): void {
    const fieldState = this._fields[key];
    const fieldDef = this.fieldDefs.find((f) => f.key === key);

    if (!fieldState || !fieldDef) return;

    const value = fieldState.value();
    const formValue = this._formValue();
    const errors = this.runFieldValidation(fieldDef, value, formValue);

    fieldState.setErrors(errors);
  }

  private runFieldValidation(fieldDef: FieldDef, value: unknown, formValue: unknown): ValidationError[] {
    const errors: ValidationError[] = [];
    const validation = fieldDef.validation;

    if (!validation) return errors;

    // Run built-in validators using Angular Architects pattern
    errors.push(...this.runBuiltInValidators(validation, value));

    // Run custom validators
    if (validation.custom) {
      validation.custom.forEach((validator) => {
        const error = validator(value, formValue);
        if (error) {
          errors.push(error);
        }
      });
    }

    return errors;
  }

  private runBuiltInValidators(validation: ValidationRules, value: unknown): ValidationError[] {
    const errors: ValidationError[] = [];
    const messages = validation.messages || {};

    if (validation.required && this.isEmpty(value)) {
      errors.push({
        type: 'required',
        message: messages.required || 'This field is required',
      });
    }

    if (validation.email && !this.isEmpty(value) && !this.isValidEmail(value)) {
      errors.push({
        type: 'email',
        message: messages.email || 'Please enter a valid email address',
      });
    }

    if (validation.min !== undefined && typeof value === 'number' && value < validation.min) {
      errors.push({
        type: 'min',
        message: messages.min || `Value must be at least ${validation.min}`,
        params: { min: validation.min },
      });
    }

    if (validation.max !== undefined && typeof value === 'number' && value > validation.max) {
      errors.push({
        type: 'max',
        message: messages.max || `Value must be at most ${validation.max}`,
        params: { max: validation.max },
      });
    }

    if (validation.minLength !== undefined && typeof value === 'string' && value.length < validation.minLength) {
      errors.push({
        type: 'minLength',
        message: messages.minLength || `Minimum length is ${validation.minLength}`,
        params: { minLength: validation.minLength },
      });
    }

    if (validation.maxLength !== undefined && typeof value === 'string' && value.length > validation.maxLength) {
      errors.push({
        type: 'maxLength',
        message: messages.maxLength || `Maximum length is ${validation.maxLength}`,
        params: { maxLength: validation.maxLength },
      });
    }

    if (validation.pattern && typeof value === 'string' && !this.matchesPattern(value, validation.pattern)) {
      errors.push({
        type: 'pattern',
        message: messages.pattern || 'Value does not match required pattern',
      });
    }

    return errors;
  }

  private evaluateConditionals(formValue: Record<string, unknown>): void {
    this.fieldDefs.forEach((fieldDef) => {
      const fieldState = this._fields[fieldDef.key];
      if (!fieldState || !fieldDef.conditionals) return;

      const conditionals = fieldDef.conditionals;

      // Evaluate show/hide conditions
      if (conditionals.show) {
        const shouldShow = conditionals.show(formValue);
        fieldState.setVisible(shouldShow);
      }

      if (conditionals.hide) {
        const shouldHide = conditionals.hide(formValue);
        fieldState.setVisible(!shouldHide);
      }

      // Evaluate enable/disable conditions
      if (conditionals.enable) {
        const shouldEnable = conditionals.enable(formValue);
        fieldState.setDisabled(!shouldEnable);
      }

      if (conditionals.disable) {
        const shouldDisable = conditionals.disable(formValue);
        fieldState.setDisabled(shouldDisable);
      }
    });
  }

  private isEmpty(value: unknown): boolean {
    return (
      value === null ||
      value === undefined ||
      (typeof value === 'string' && value.trim() === '') ||
      (Array.isArray(value) && value.length === 0)
    );
  }

  private isValidEmail(value: unknown): boolean {
    if (typeof value !== 'string') return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  }

  private matchesPattern(value: string, pattern: string | RegExp): boolean {
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
    return regex.test(value);
  }
}

/**
 * Individual field state with signals following Angular Architects pattern
 */
class FieldSignalState<TValue = unknown> implements FieldState<TValue> {
  private readonly _value: WritableSignal<TValue>;
  private readonly _errors = signal<ValidationError[]>([]);
  private readonly _touched = signal(false);
  private readonly _dirty = signal(false);
  private readonly _disabled = signal(false);
  private readonly _visible = signal(true);
  private readonly initialValue: TValue;

  constructor(initialValue: TValue) {
    this.initialValue = initialValue;
    this._value = signal(initialValue);
  }

  get value(): Signal<TValue> {
    return this._value.asReadonly();
  }

  get errors(): Signal<ValidationError[]> {
    return this._errors.asReadonly();
  }

  get touched(): Signal<boolean> {
    return this._touched.asReadonly();
  }

  get dirty(): Signal<boolean> {
    return this._dirty.asReadonly();
  }

  readonly valid = computed(() => this._errors().length === 0);

  get disabled(): Signal<boolean> {
    return this._disabled.asReadonly();
  }

  get visible(): Signal<boolean> {
    return this._visible.asReadonly();
  }

  setValue(value: TValue): void {
    this._value.set(value);
    this._dirty.set(value !== this.initialValue);
  }

  setErrors(errors: ValidationError[]): void {
    this._errors.set(errors);
  }

  markAsTouched(): void {
    this._touched.set(true);
  }

  setDisabled(disabled: boolean): void {
    this._disabled.set(disabled);
  }

  setVisible(visible: boolean): void {
    this._visible.set(visible);
  }

  reset(): void {
    this._value.set(this.initialValue);
    this._errors.set([]);
    this._touched.set(false);
    this._dirty.set(false);
    this._disabled.set(false);
    this._visible.set(true);
  }
}
