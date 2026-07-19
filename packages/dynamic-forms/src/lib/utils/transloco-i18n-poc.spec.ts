import { TestBed } from '@angular/core/testing';
import { Injector, runInInjectionContext, signal } from '@angular/core';
import type { FieldTree, SchemaPath, ValidationError } from '@angular/forms/signals';
import { form, schema } from '@angular/forms/signals';
import { TranslocoService, TranslocoTestingModule } from '@jsverse/transloco';
import { createResolvedErrorsSignal } from '@ng-forge/dynamic-forms/integration';
import { ValidationMessages } from '@ng-forge/dynamic-forms/internal';
import { applyValidator } from '@ng-forge/dynamic-forms/internal';
import { FieldContextRegistryService } from '@ng-forge/dynamic-forms/internal';
import { FunctionRegistryService } from '@ng-forge/dynamic-forms/internal';
import { RootFormRegistryService } from '@ng-forge/dynamic-forms/internal';
import { FormStateManager } from '../state/form-state-manager';
import { DynamicFormLogger } from '@ng-forge/dynamic-forms/internal';
import { ConsoleLogger } from '../providers/features/logger/console-logger';

/**
 * POC for issue #513: defaultValidationMessages + Transloco with {{param}} interpolation.
 *
 * Verifies that error-aware message functions (added in #528) let Transloco receive
 * validation error params (e.g. maxLength) natively, so its own {{...}} interpolation
 * produces the final message and no placeholder is stripped.
 */
describe('Transloco i18n POC (issue #513)', () => {
  const mockEntity = signal<Record<string, unknown>>({});
  const mockFormSignal = signal<unknown>(undefined);

  let injector: Injector;
  let transloco: TranslocoService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslocoTestingModule.forRoot({
          langs: {
            en: {
              validation: {
                maxLength: 'Must be at most {{requiredLength}} characters',
                // Translation with a param Transloco receives no value for (the original bug report setup)
                maxLengthNoParams: 'Maximum length exceeded - {{requiredLength}}',
              },
            },
            de: {
              validation: {
                maxLength: 'Darf höchstens {{requiredLength}} Zeichen lang sein',
              },
            },
          },
          translocoConfig: {
            availableLangs: ['en', 'de'],
            defaultLang: 'en',
            reRenderOnLangChange: true,
          },
          preloadLangs: true,
        }),
      ],
      providers: [
        FunctionRegistryService,
        FieldContextRegistryService,
        { provide: RootFormRegistryService, useValue: { formValue: mockEntity, rootForm: mockFormSignal } },
        { provide: FormStateManager, useValue: { activeConfig: signal(undefined) } },
        { provide: DynamicFormLogger, useValue: new ConsoleLogger() },
      ],
    });
    injector = TestBed.inject(Injector);
    transloco = TestBed.inject(TranslocoService);
  });

  /** Form with a single maxLength(5)-violating field, returning its FieldTree signal */
  function createMaxLengthField() {
    const initialValue = signal({ username: 'exceeds five' });
    const testForm = form(
      initialValue,
      schema<{ username: string }>((path) => {
        // Cast is safe: the schema generic declares `username: string`, so the field path is SchemaPath<string>
        applyValidator({ type: 'maxLength', value: 5 }, path.username as SchemaPath<string>);
      }),
    );
    return signal((testForm as unknown as Record<string, FieldTree<string>>)['username']);
  }

  function errorParams(error: ValidationError): Record<string, unknown> {
    // Cast is safe: maxLength validation errors carry the numeric constraint as a param
    const e = error as ValidationError & { maxLength?: number; requiredLength?: number };
    return { requiredLength: e.requiredLength ?? e.maxLength };
  }

  it('resolves a Transloco translation with error params via a message function', () => {
    runInInjectionContext(injector, () => {
      const usernameField = createMaxLengthField();

      const defaultMessages = signal<ValidationMessages>({
        maxLength: (error) => transloco.selectTranslate('validation.maxLength', errorParams(error)),
      });

      const resolvedErrors = createResolvedErrorsSignal(usernameField, signal<ValidationMessages>({}), defaultMessages);

      TestBed.flushEffects();

      expect(resolvedErrors()).toEqual([{ kind: 'maxLength', message: 'Must be at most 5 characters' }]);
    });
  });

  it('updates the resolved message reactively on language change', () => {
    runInInjectionContext(injector, () => {
      const usernameField = createMaxLengthField();

      const defaultMessages = signal<ValidationMessages>({
        maxLength: (error) => transloco.selectTranslate('validation.maxLength', errorParams(error)),
      });

      const resolvedErrors = createResolvedErrorsSignal(usernameField, signal<ValidationMessages>({}), defaultMessages);

      TestBed.flushEffects();
      expect(resolvedErrors()).toEqual([{ kind: 'maxLength', message: 'Must be at most 5 characters' }]);

      transloco.setActiveLang('de');
      TestBed.flushEffects();

      expect(resolvedErrors()).toEqual([{ kind: 'maxLength', message: 'Darf höchstens 5 Zeichen lang sein' }]);
    });
  });

  it('demonstrates the original bug: a plain Observable message never sees the error value', () => {
    runInInjectionContext(injector, () => {
      const usernameField = createMaxLengthField();

      // The pre-fix wiring from the issue: selectTranslate without params, resolved before the error exists
      const defaultMessages = signal<ValidationMessages>({
        maxLength: transloco.selectTranslate('validation.maxLengthNoParams'),
      });

      const resolvedErrors = createResolvedErrorsSignal(usernameField, signal<ValidationMessages>({}), defaultMessages);

      TestBed.flushEffects();

      const [error] = resolvedErrors();
      expect(error.kind).toBe('maxLength');
      // Transloco's default transpiler already consumed {{requiredLength}}, so the actual
      // constraint (5) cannot appear in the message. This is why message functions exist.
      expect(error.message).not.toContain('5');
    });
  });

  it('supports field-level validationMessages functions with Transloco as well', () => {
    runInInjectionContext(injector, () => {
      const usernameField = createMaxLengthField();

      const fieldMessages = signal<ValidationMessages>({
        maxLength: (error) => transloco.selectTranslate('validation.maxLength', errorParams(error)),
      });
      const defaultMessages = signal<ValidationMessages>({
        maxLength: 'Default-level should not win',
      });

      const resolvedErrors = createResolvedErrorsSignal(usernameField, fieldMessages, defaultMessages);

      TestBed.flushEffects();

      expect(resolvedErrors()).toEqual([{ kind: 'maxLength', message: 'Must be at most 5 characters' }]);
    });
  });
});
