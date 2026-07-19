import { EnvironmentInjector, Provider, runInInjectionContext, signal, type Type, type WritableSignal } from '@angular/core';
import { ComponentFixture, getTestBed, TestBed } from '@angular/core/testing';
import { type FieldTree, form, schema, type SchemaPath } from '@angular/forms/signals';
import { type FormEvent, type FormEventConstructor } from '@ng-forge/dynamic-forms';
import { EventBus, DynamicFormError, DynamicFormLogger, type Logger } from '@ng-forge/dynamic-forms/internal';
import { DEFAULT_VALIDATION_MESSAGES, type DynamicText, type ValidationMessages } from '@ng-forge/dynamic-forms/internal';

/** Structural copy of integration's EventArgs; importing it would cycle the entrypoints. */
type EventArgs = readonly (string | number | boolean | null | undefined)[];

/** Default logger so fixtures work without provideDynamicForm(); override via options.providers. */
const fixtureLogger: Logger = {
  debug: (message, ...args) => console.debug('[Dynamic Forms]', message, ...args),
  info: (message, ...args) => console.info('[Dynamic Forms]', message, ...args),
  warn: (message, ...args) => console.warn('[Dynamic Forms]', message, ...args),
  error: (message, ...args) => console.error('[Dynamic Forms]', message, ...args),
};

export interface CreateNgForgeFieldFixtureOptions<TValue = unknown> {
  /** Field key. Becomes the only property on the wrapping form. */
  readonly key: string;
  /** Initial value for the field. */
  readonly value?: TValue;
  /** Optional schema callback that receives the field's `SchemaPath`. Use it to attach validators (`required`, `minLength`, etc.). */
  readonly schema?: (fieldPath: SchemaPath<TValue>) => void;
  /** Mark the field as touched after creation (useful for invalid-state assertions). */
  readonly touched?: boolean;
  /** Extra inputs to set on the component before `detectChanges()`. */
  readonly inputs?: Record<string, unknown>;
  /** Extra TestBed providers. */
  readonly providers?: readonly Provider[];
}

export interface NgForgeFieldFixture<C, TValue = unknown> {
  readonly fixture: ComponentFixture<C>;
  readonly field: FieldTree<TValue>;
  readonly rootValue: WritableSignal<Record<string, TValue>>;
}

/** Guards against a second, uninitialized @angular/core/testing instance (Vitest externalization). */
function assertTestEnvironmentInitialized(): void {
  if (getTestBed().platform) return;
  throw new DynamicFormError(
    'The Angular test environment was never initialized for the @angular/core/testing instance this fixture resolved. ' +
      'Under Vitest this means your specs use a Vite-transformed copy of @angular/core/testing while the fixtures load the native one. ' +
      'Fix: either remove @angular/* from server.deps.inline so everything resolves natively, or inline the whole Angular graph:\n' +
      "test: { server: { deps: { inline: [/@angular\\//, /@ng-forge/, 'ngxtension'] } } }\n" +
      "and keep import '@angular/compiler' in your test setup so the inlined bundles JIT-link.\n" +
      'On Jest or Karma this instead means initTestEnvironment was never called; add it to your test setup file (e.g. getTestBed().initTestEnvironment(...)).',
  );
}

/**
 * Builds a `ComponentFixture` for an `NgForgeField`-composing component with
 * `field` + `key` bound BEFORE `detectChanges()` — sidesteps the NG0950 that
 * Shell's required `key` and Field's required `field` would otherwise throw.
 */
export function createNgForgeFieldFixture<C, TValue = unknown>(
  component: Type<C>,
  options: CreateNgForgeFieldFixtureOptions<TValue>,
): NgForgeFieldFixture<C, TValue> {
  assertTestEnvironmentInitialized();
  TestBed.configureTestingModule({
    imports: [component],
    providers: [{ provide: DynamicFormLogger, useValue: fixtureLogger }, ...(options.providers ?? [])],
  });

  const key = options.key;
  const rootValue = signal<Record<string, TValue>>({ [key]: options.value as TValue });

  const injector = TestBed.inject(EnvironmentInjector);
  const schemaCallback = options.schema;
  const root = runInInjectionContext(injector, () => {
    if (!schemaCallback) return form(rootValue);
    return form(
      rootValue,
      schema<Record<string, TValue>>((path) => {
        schemaCallback(path[key] as SchemaPath<TValue>);
      }),
    );
  });

  const field = (root as unknown as Record<string, FieldTree<TValue>>)[key];

  if (options.touched) field().markAsTouched();

  const fixture = TestBed.createComponent(component);
  fixture.componentRef.setInput('field', field);
  fixture.componentRef.setInput('key', key);
  if (options.inputs) {
    for (const [name, value] of Object.entries(options.inputs)) {
      fixture.componentRef.setInput(name, value);
    }
  }

  return { fixture, field, rootValue };
}

export interface CreateNgForgeActionFixtureOptions<TEvent extends FormEvent = FormEvent> {
  readonly key: string;
  readonly label: DynamicText;
  readonly event?: FormEventConstructor<TEvent>;
  readonly eventArgs?: EventArgs;
  readonly disabled?: boolean;
  readonly hidden?: boolean;
  readonly inputs?: Record<string, unknown>;
  readonly providers?: readonly Provider[];
}

export interface NgForgeActionFixture<C> {
  readonly fixture: ComponentFixture<C>;
  readonly eventBus: EventBus;
}

/**
 * Builds a `ComponentFixture` for an `NgForgeAction`-composing component with
 * `key` + `label` bound and `EventBus` provided. The caller calls
 * `detectChanges()`; the harness handles the NG0950-avoidance bindings.
 */
export function createNgForgeActionFixture<C, TEvent extends FormEvent = FormEvent>(
  component: Type<C>,
  options: CreateNgForgeActionFixtureOptions<TEvent>,
): NgForgeActionFixture<C> {
  assertTestEnvironmentInitialized();
  TestBed.configureTestingModule({
    imports: [component],
    providers: [EventBus, { provide: DynamicFormLogger, useValue: fixtureLogger }, ...(options.providers ?? [])],
  });

  const fixture = TestBed.createComponent(component);
  fixture.componentRef.setInput('key', options.key);
  fixture.componentRef.setInput('label', options.label);
  if (options.event) fixture.componentRef.setInput('event', options.event);
  if (options.eventArgs) fixture.componentRef.setInput('eventArgs', options.eventArgs);
  if (options.disabled !== undefined) fixture.componentRef.setInput('disabled', options.disabled);
  if (options.hidden !== undefined) fixture.componentRef.setInput('hidden', options.hidden);
  if (options.inputs) {
    for (const [name, value] of Object.entries(options.inputs)) {
      fixture.componentRef.setInput(name, value);
    }
  }

  return { fixture, eventBus: TestBed.inject(EventBus) };
}

/** Provider for `DEFAULT_VALIDATION_MESSAGES` in field tests — supply the default-messages map and the directive resolves it from DI. */
export function provideTestValidationMessages(messages: ValidationMessages): Provider {
  return { provide: DEFAULT_VALIDATION_MESSAGES, useValue: signal(messages) };
}
