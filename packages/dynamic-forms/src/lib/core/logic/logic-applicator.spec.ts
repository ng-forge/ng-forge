import { TestBed } from '@angular/core/testing';
import { Injector, runInInjectionContext, signal } from '@angular/core';
import { beforeEach, describe, expect, it } from 'vitest';
import { form, schema } from '@angular/forms/signals';
import { LogicConfig } from '../../models/logic';
import { RootFormRegistryService, FunctionRegistryService, FieldContextRegistryService } from '../registry';
import { FormStateManager } from '../../state/form-state-manager';
import { applyLogic, applyMultipleLogic } from './logic-applicator';

describe('logic-applicator', () => {
  let injector: Injector;
  const mockEntity = signal<Record<string, unknown>>({});
  const mockFormSignal = signal<any>(undefined);

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: RootFormRegistryService, useValue: { formValue: mockEntity, rootForm: mockFormSignal } },
        { provide: FormStateManager, useValue: { activeConfig: signal(undefined) } },
        FunctionRegistryService,
        FieldContextRegistryService,
      ],
    });

    injector = TestBed.inject(Injector);
    mockEntity.set({});
    mockFormSignal.set(undefined);
  });

  describe('applyLogic', () => {
    describe('condition type checking', () => {
      it('should handle boolean condition without throwing', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ email: 'test@example.com' });
          const config: LogicConfig = {
            type: 'hidden',
            condition: true,
          };

          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              expect(() => {
                applyLogic(config, path.email);
              }).not.toThrow();
            }),
          );
          mockFormSignal.set(formInstance);
        });
      });

      it('should handle ConditionalExpression condition without throwing', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ contactMethod: 'email', email: 'test@example.com' });
          const config: LogicConfig = {
            type: 'hidden',
            condition: {
              type: 'fieldValue',
              fieldPath: 'contactMethod',
              operator: 'equals',
              value: 'phone',
            },
          };

          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              expect(() => {
                applyLogic(config, path.email);
              }).not.toThrow();
            }),
          );
          mockFormSignal.set(formInstance);
        });
      });

      it('should handle undefined condition without throwing', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ email: 'test@example.com' });

          const config: LogicConfig = {
            type: 'hidden',

            condition: undefined as any,
          };

          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              expect(() => {
                applyLogic(config, path.email);
              }).not.toThrow();
            }),
          );
          mockFormSignal.set(formInstance);
        });
      });

      it('should handle null condition without throwing', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ email: 'test@example.com' });
          const config: LogicConfig = {
            type: 'hidden',

            condition: null as any,
          };

          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              expect(() => {
                applyLogic(config, path.email);
              }).not.toThrow();
            }),
          );
          mockFormSignal.set(formInstance);
        });
      });
    });

    describe('logic type handling', () => {
      it('should handle hidden logic without throwing', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ email: 'test@example.com' });
          const config: LogicConfig = {
            type: 'hidden',
            condition: false,
          };

          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              expect(() => {
                applyLogic(config, path.email);
              }).not.toThrow();
            }),
          );
          mockFormSignal.set(formInstance);
        });
      });

      it('should handle readonly logic without throwing', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ email: 'test@example.com' });
          const config: LogicConfig = {
            type: 'readonly',
            condition: true,
          };

          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              expect(() => {
                applyLogic(config, path.email);
              }).not.toThrow();
            }),
          );
          mockFormSignal.set(formInstance);
        });
      });

      it('should handle required logic without throwing', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ email: '' });
          const config: LogicConfig = {
            type: 'required',
            condition: true,
          };

          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              expect(() => {
                applyLogic(config, path.email);
              }).not.toThrow();
            }),
          );
          mockFormSignal.set(formInstance);
        });
      });
    });

    describe('disabled logic', () => {
      it('should apply disabled logic to field', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ email: 'test@example.com' });

          const config: LogicConfig = {
            type: 'disabled',
            condition: true,
          };

          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              applyLogic(config, path.email);
            }),
          );
          mockFormSignal.set(formInstance);

          // Verify that disabled logic is applied
          expect(formInstance.email().disabled()).toBe(true);
        });
      });
    });

    describe('unknown logic type', () => {
      it('should handle unknown logic type without throwing', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ field: 'value' });
          const config: LogicConfig = {
            type: 'customLogic' as any,
            condition: true,
          };

          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              expect(() => {
                applyLogic(config, path.field);
              }).not.toThrow();
            }),
          );
          mockFormSignal.set(formInstance);
        });
      });
    });

    describe('edge cases', () => {
      it('should handle invalid ConditionalExpression type without throwing', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ email: 'test@example.com' });
          const config: LogicConfig = {
            type: 'hidden',
            condition: {
              type: 'unknownType' as any,
              expression: 'someExpression',
            },
          };

          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              expect(() => {
                applyLogic(config, path.email);
              }).not.toThrow();
            }),
          );
          mockFormSignal.set(formInstance);
        });
      });

      it('should handle malformed ConditionalExpression without throwing', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ email: 'test@example.com' });
          const config: LogicConfig = {
            type: 'hidden',

            condition: {} as any,
          };

          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              expect(() => {
                applyLogic(config, path.email);
              }).not.toThrow();
            }),
          );
          mockFormSignal.set(formInstance);
        });
      });
    });
  });

  describe('applyMultipleLogic', () => {
    it('should apply multiple logic configurations without throwing', () => {
      runInInjectionContext(injector, () => {
        const formValue = signal({ email: 'test@example.com' });
        const configs: LogicConfig[] = [
          { type: 'hidden', condition: false },
          { type: 'readonly', condition: true },
        ];

        const formInstance = form(
          formValue,
          schema<typeof formValue>((path) => {
            expect(() => {
              applyMultipleLogic(configs, path.email);
            }).not.toThrow();
          }),
        );
        mockFormSignal.set(formInstance);
      });
    });

    it('should handle empty logic array without throwing', () => {
      runInInjectionContext(injector, () => {
        const formValue = signal({ email: 'test@example.com' });
        const configs: LogicConfig[] = [];

        const formInstance = form(
          formValue,
          schema<typeof formValue>((path) => {
            expect(() => {
              applyMultipleLogic(configs, path.email);
            }).not.toThrow();
          }),
        );
        mockFormSignal.set(formInstance);
      });
    });

    it('should continue with invalid configs without throwing', () => {
      runInInjectionContext(injector, () => {
        const formValue = signal({ email: 'test@example.com' });
        const configs: LogicConfig[] = [
          { type: 'unknown' as any, condition: true },
          { type: 'readonly', condition: true },
        ];

        const formInstance = form(
          formValue,
          schema<typeof formValue>((path) => {
            expect(() => {
              applyMultipleLogic(configs, path.email);
            }).not.toThrow();
          }),
        );
        mockFormSignal.set(formInstance);
      });
    });

    it('should handle disabled logic in sequence', () => {
      runInInjectionContext(injector, () => {
        const formValue = signal({ email: 'test@example.com' });

        const configs: LogicConfig[] = [
          { type: 'disabled', condition: true },
          { type: 'readonly', condition: true },
        ];

        const formInstance = form(
          formValue,
          schema<typeof formValue>((path) => {
            applyMultipleLogic(configs, path.email);
          }),
        );
        mockFormSignal.set(formInstance);

        // Verify that both disabled and readonly logic are applied
        expect(formInstance.email().disabled()).toBe(true);
        expect(formInstance.email().readonly()).toBe(true);
      });
    });
  });
});
