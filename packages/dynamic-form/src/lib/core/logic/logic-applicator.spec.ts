import { TestBed } from '@angular/core/testing';
import { Injector, runInInjectionContext, signal } from '@angular/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as angularSignals from '@angular/forms/signals';
import { form } from '@angular/forms/signals';
import { LogicConfig } from '../../models/logic';
import { ConditionalExpression } from '../../models';
import { RootFormRegistryService } from '../registry';
import { applyLogic, applyMultipleLogic } from './logic-applicator';

describe('logic-applicator', () => {
  let injector: Injector;
  let rootFormRegistry: RootFormRegistryService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RootFormRegistryService],
    });

    injector = TestBed.inject(Injector);
    rootFormRegistry = TestBed.inject(RootFormRegistryService);
  });

  describe('applyLogic', () => {
    describe('condition type checking', () => {
      it('should handle boolean condition', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ email: 'test@example.com' });
          const formInstance = form(formValue);
          rootFormRegistry.registerRootForm(formInstance);

          const hiddenSpy = vi.spyOn(angularSignals, 'hidden');
          const config: LogicConfig = {
            type: 'hidden',
            condition: true,
          };

          applyLogic(config, formInstance().controls.email);

          expect(hiddenSpy).toHaveBeenCalledTimes(1);
          const callArgs = hiddenSpy.mock.calls[0];
          expect(typeof callArgs[1]).toBe('function');
          // Verify the function returns the boolean value
          const logicFn = callArgs[1] as () => boolean;
          expect(logicFn()).toBe(true);
          hiddenSpy.mockRestore();
        });
      });

      it('should handle ConditionalExpression condition', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ contactMethod: 'email', email: 'test@example.com' });
          const formInstance = form(formValue);
          rootFormRegistry.registerRootForm(formInstance);

          const hiddenSpy = vi.spyOn(angularSignals, 'hidden');
          const config: LogicConfig = {
            type: 'hidden',
            condition: {
              type: 'fieldValue',
              fieldPath: 'contactMethod',
              operator: 'equals',
              value: 'phone',
            },
          };

          applyLogic(config, formInstance().controls.email);

          expect(hiddenSpy).toHaveBeenCalledTimes(1);
          const callArgs = hiddenSpy.mock.calls[0];
          expect(typeof callArgs[1]).toBe('function');
          hiddenSpy.mockRestore();
        });
      });

      it('should handle undefined condition gracefully', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ email: 'test@example.com' });
          const formInstance = form(formValue);
          rootFormRegistry.registerRootForm(formInstance);

          const config: LogicConfig = {
            type: 'hidden',
            condition: undefined as any,
          };

          // Should not throw - createLogicFunction will handle the invalid expression
          expect(() => {
            applyLogic(config, formInstance().controls.email);
          }).not.toThrow();
        });
      });

      it('should treat non-boolean primitive as boolean condition', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ email: 'test@example.com' });
          const formInstance = form(formValue);
          rootFormRegistry.registerRootForm(formInstance);

          const hiddenSpy = vi.spyOn(angularSignals, 'hidden');
          const config: LogicConfig = {
            type: 'hidden',
            condition: 'true' as any, // String, not boolean
          };

          applyLogic(config, formInstance().controls.email);

          expect(hiddenSpy).toHaveBeenCalledTimes(1);
          // typeof check in logic-applicator will treat this as ConditionalExpression
          hiddenSpy.mockRestore();
        });
      });

      it('should handle null condition', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ email: 'test@example.com' });
          const formInstance = form(formValue);
          rootFormRegistry.registerRootForm(formInstance);

          const config: LogicConfig = {
            type: 'hidden',
            condition: null as any,
          };

          // Should not throw
          expect(() => {
            applyLogic(config, formInstance().controls.email);
          }).not.toThrow();
        });
      });
    });

    describe('logic type routing', () => {
      it('should apply hidden logic', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ email: 'test@example.com' });
          const formInstance = form(formValue);
          rootFormRegistry.registerRootForm(formInstance);

          const hiddenSpy = vi.spyOn(angularSignals, 'hidden');
          const config: LogicConfig = {
            type: 'hidden',
            condition: true,
          };

          applyLogic(config, formInstance().controls.email);

          expect(hiddenSpy).toHaveBeenCalledTimes(1);
          hiddenSpy.mockRestore();
        });
      });

      it('should apply readonly logic', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ email: 'test@example.com' });
          const formInstance = form(formValue);
          rootFormRegistry.registerRootForm(formInstance);

          const readonlySpy = vi.spyOn(angularSignals, 'readonly');
          const config: LogicConfig = {
            type: 'readonly',
            condition: true,
          };

          applyLogic(config, formInstance().controls.email);

          expect(readonlySpy).toHaveBeenCalledTimes(1);
          readonlySpy.mockRestore();
        });
      });

      it('should apply required logic', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ email: '' });
          const formInstance = form(formValue);
          rootFormRegistry.registerRootForm(formInstance);

          const requiredSpy = vi.spyOn(angularSignals, 'required');
          const config: LogicConfig = {
            type: 'required',
            condition: true,
          };

          applyLogic(config, formInstance().controls.email);

          expect(requiredSpy).toHaveBeenCalledTimes(1);
          const callArgs = requiredSpy.mock.calls[0];
          expect(callArgs[1]).toEqual({ when: expect.any(Function) });
          requiredSpy.mockRestore();
        });
      });
    });

    describe('disabled logic warning', () => {
      it('should log warning for disabled logic', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ email: 'test@example.com' });
          const formInstance = form(formValue);
          rootFormRegistry.registerRootForm(formInstance);

          const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
          const config: LogicConfig = {
            type: 'disabled',
            condition: true,
          };

          applyLogic(config, formInstance().controls.email);

          expect(consoleWarnSpy).toHaveBeenCalledWith('Disabled logic must be handled at component level');
          consoleWarnSpy.mockRestore();
        });
      });

      it('should not call Angular API for disabled logic', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ email: 'test@example.com' });
          const formInstance = form(formValue);
          rootFormRegistry.registerRootForm(formInstance);

          const hiddenSpy = vi.spyOn(angularSignals, 'hidden');
          const readonlySpy = vi.spyOn(angularSignals, 'readonly');
          const requiredSpy = vi.spyOn(angularSignals, 'required');

          const config: LogicConfig = {
            type: 'disabled',
            condition: true,
          };

          applyLogic(config, formInstance().controls.email);

          expect(hiddenSpy).not.toHaveBeenCalled();
          expect(readonlySpy).not.toHaveBeenCalled();
          expect(requiredSpy).not.toHaveBeenCalled();

          hiddenSpy.mockRestore();
          readonlySpy.mockRestore();
          requiredSpy.mockRestore();
        });
      });
    });

    describe('unknown logic type', () => {
      it('should not call any Angular API for unknown logic type', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ field: 'value' });
          const formInstance = form(formValue);
          rootFormRegistry.registerRootForm(formInstance);

          const hiddenSpy = vi.spyOn(angularSignals, 'hidden');
          const readonlySpy = vi.spyOn(angularSignals, 'readonly');
          const requiredSpy = vi.spyOn(angularSignals, 'required');

          const config: LogicConfig = {
            type: 'customLogic' as any,
            condition: true,
          };

          applyLogic(config, formInstance().controls.field);

          expect(hiddenSpy).not.toHaveBeenCalled();
          expect(readonlySpy).not.toHaveBeenCalled();
          expect(requiredSpy).not.toHaveBeenCalled();

          hiddenSpy.mockRestore();
          readonlySpy.mockRestore();
          requiredSpy.mockRestore();
        });
      });

      it('should handle unknown type silently without throwing', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ field: 'value' });
          const formInstance = form(formValue);
          rootFormRegistry.registerRootForm(formInstance);

          const config: LogicConfig = {
            type: 'unknownType' as any,
            condition: true,
          };

          expect(() => {
            applyLogic(config, formInstance().controls.field);
          }).not.toThrow();
        });
      });
    });

    describe('invalid condition expressions', () => {
      it('should handle invalid ConditionalExpression type', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ email: 'test@example.com' });
          const formInstance = form(formValue);
          rootFormRegistry.registerRootForm(formInstance);

          const config: LogicConfig = {
            type: 'hidden',
            condition: {
              type: 'invalidType' as any,
            } as ConditionalExpression,
          };

          // Should not throw during applyLogic - createLogicFunction handles it
          expect(() => {
            applyLogic(config, formInstance().controls.email);
          }).not.toThrow();
        });
      });

      it('should handle malformed ConditionalExpression', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ email: 'test@example.com' });
          const formInstance = form(formValue);
          rootFormRegistry.registerRootForm(formInstance);

          const config: LogicConfig = {
            type: 'hidden',
            condition: {} as ConditionalExpression, // Missing required properties
          };

          expect(() => {
            applyLogic(config, formInstance().controls.email);
          }).not.toThrow();
        });
      });
    });
  });

  describe('applyMultipleLogic', () => {
    it('should apply multiple logic configurations in sequence', () => {
      runInInjectionContext(injector, () => {
        const formValue = signal({ email: '' });
        const formInstance = form(formValue);
        rootFormRegistry.registerRootForm(formInstance);

        const hiddenSpy = vi.spyOn(angularSignals, 'hidden');
        const readonlySpy = vi.spyOn(angularSignals, 'readonly');

        const configs: LogicConfig[] = [
          { type: 'hidden', condition: false },
          { type: 'readonly', condition: true },
        ];

        applyMultipleLogic(configs, formInstance().controls.email);

        expect(hiddenSpy).toHaveBeenCalledTimes(1);
        expect(readonlySpy).toHaveBeenCalledTimes(1);

        hiddenSpy.mockRestore();
        readonlySpy.mockRestore();
      });
    });

    it('should handle empty logic array', () => {
      runInInjectionContext(injector, () => {
        const formValue = signal({ email: '' });
        const formInstance = form(formValue);
        rootFormRegistry.registerRootForm(formInstance);

        const configs: LogicConfig[] = [];

        expect(() => {
          applyMultipleLogic(configs, formInstance().controls.email);
        }).not.toThrow();
      });
    });

    it('should continue applying logic even if one config is invalid', () => {
      runInInjectionContext(injector, () => {
        const formValue = signal({ email: '' });
        const formInstance = form(formValue);
        rootFormRegistry.registerRootForm(formInstance);

        const hiddenSpy = vi.spyOn(angularSignals, 'hidden');
        const readonlySpy = vi.spyOn(angularSignals, 'readonly');

        const configs: LogicConfig[] = [
          { type: 'hidden', condition: true },
          { type: 'unknownType' as any, condition: true }, // Invalid
          { type: 'readonly', condition: true },
        ];

        applyMultipleLogic(configs, formInstance().controls.email);

        expect(hiddenSpy).toHaveBeenCalledTimes(1);
        expect(readonlySpy).toHaveBeenCalledTimes(1);

        hiddenSpy.mockRestore();
        readonlySpy.mockRestore();
      });
    });

    it('should handle disabled logic in sequence without stopping', () => {
      runInInjectionContext(injector, () => {
        const formValue = signal({ email: '' });
        const formInstance = form(formValue);
        rootFormRegistry.registerRootForm(formInstance);

        const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const hiddenSpy = vi.spyOn(angularSignals, 'hidden');
        const readonlySpy = vi.spyOn(angularSignals, 'readonly');

        const configs: LogicConfig[] = [
          { type: 'hidden', condition: true },
          { type: 'disabled', condition: true }, // Should log warning
          { type: 'readonly', condition: true },
        ];

        applyMultipleLogic(configs, formInstance().controls.email);

        expect(consoleWarnSpy).toHaveBeenCalledWith('Disabled logic must be handled at component level');
        expect(hiddenSpy).toHaveBeenCalledTimes(1);
        expect(readonlySpy).toHaveBeenCalledTimes(1);

        consoleWarnSpy.mockRestore();
        hiddenSpy.mockRestore();
        readonlySpy.mockRestore();
      });
    });
  });
});
