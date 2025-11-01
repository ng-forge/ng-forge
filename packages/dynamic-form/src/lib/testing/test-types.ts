import { ComponentFixture } from '@angular/core/testing';
import { FormConfig } from '../models';
import { FieldDef } from '../definitions';
import { injectFieldRegistry } from '../utils/inject-field-registry/inject-field-registry';

/**
 * Simple form configuration interface for testing
 */
export interface TestFormConfig {
  fields: FieldDef<Record<string, unknown>>[];
}

/**
 * Unified configuration for creating dynamic form tests
 * Replaces DynamicFormTestConfig and SimpleTestConfig
 */
export interface TestConfig<T = Record<string, unknown>> {
  config: FormConfig | TestFormConfig;
  initialValue?: T;
  registerTestFields?: boolean;
}

/**
 * Unified result interface for dynamic form tests
 * Replaces DynamicFormTestResult and SimpleTestResult
 */
export interface TestResult<T = unknown> {
  component: T;
  fixture: ComponentFixture<T>;
  fieldRegistry?: ReturnType<typeof injectFieldRegistry>;
}

/**
 * Configuration for setting up individual field component tests
 */
export interface ComponentTestConfig<T = unknown> {
  field: FieldDef<Record<string, unknown>>;
  value?: T;
}

/**
 * Result of setting up individual field component tests
 */
export interface ComponentTestResult<T = unknown> {
  component: T;
  fixture: ComponentFixture<T>;
}