import { TestBed } from '@angular/core/testing';
import { Injector, runInInjectionContext, signal } from '@angular/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { form } from '@angular/forms/signals';
import { LogicConfig } from '../../models/logic';
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
      it('should handle boolean condition without throwing', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ email: 'test@example.com' });
          const formInstance = form(formValue);
          rootFormRegistry.registerRootForm(formInstance);

          const config: LogicConfig = {
            type: 'hidden',
            condition: true,
          };

          expect(() => {
            applyLogic(config, formInstance().controls.email);
          }).not.toThrow();
        });
      });

      it('should handle ConditionalExpression condition without throwing', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ contactMethod: 'email', email: 'test@example.com' });
          const formInstance = form(formValue);
          rootFormRegistry.registerRootForm(formInstance);

          const config: LogicConfig = {
            type: 'hidden',
            condition: {
              type: 'fieldValue',
              fieldPath: 'contactMethod',
              operator: 'equals',
              value: 'phone',
            },
          };

          expect(() => {
            applyLogic(config, formInstance().controls.email);
          }).not.toThrow();
        });
      });

      it('should handle undefined condition without throwing', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ email: 'test@example.com' });
          const formInstance = form(formValue);
          rootFormRegistry.registerRootForm(formInstance);

          const config: LogicConfig = {
            type: 'hidden',
            condition: undefined as any,
          };

          expect(() => {
            applyLogic(config, formInstance().controls.email);
          }).not.toThrow();
        });
      });

      it('should handle null condition without throwing', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ email: 'test@example.com' });
          const formInstance = form(formValue);
          rootFormRegistry.registerRootForm(formInstance);

          const config: LogicConfig = {
            type: 'hidden',
            condition: null as any,
          };

          expect(() => {
            applyLogic(config, formInstance().controls.email);
          }).not.toThrow();
        });
      });
    });

    describe('logic type routing', () => {
      it('should handle hidden logic without throwing', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ email: 'test@example.com' });
          const formInstance = form(formValue);
          rootFormRegistry.registerRootForm(formInstance);

          const config: LogicConfig = {
            type: 'hidden',
            condition: true,
          };

          expect(() => {
            applyLogic(config, formInstance().controls.email);
          }).not.toThrow();
        });
      });

      it('should handle readonly logic without throwing', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ email: 'test@example.com' });
          const formInstance = form(formValue);
          rootFormRegistry.registerRootForm(formInstance);

          const config: LogicConfig = {
            type: 'readonly',
            condition: true,
          };

          expect(() => {
            applyLogic(config, formInstance().controls.email);
          }).not.toThrow();
        });
      });

      it('should handle required logic without throwing', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ email: '' });
          const formInstance = form(formValue);
          rootFormRegistry.registerRootForm(formInstance);

          const config: LogicConfig = {
            type: 'required',
            condition: true,
          };

          expect(() => {
            applyLogic(config, formInstance().controls.email);
          }).not.toThrow();
        });
      });
    });

    describe('disabled logic warning', () => {
      it('should log warning for disabled logic', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ email: 'test@example.com' });
          const formInstance = form(formValue);
          rootFormRegistry.registerRootForm(formInstance);

          const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
          const config: LogicConfig = {
            type: 'disabled',
            condition: true,
          };

          applyLogic(config, formInstance().controls.email);

          expect(consoleWarnSpy).toHaveBeenCalledWith('Disabled logic must be handled at component level');
          consoleWarnSpy.mockRestore();
        });
      });
    });

    describe('unknown logic type', () => {
      it('should handle unknown logic type without throwing', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ field: 'value' });
          const formInstance = form(formValue);
          rootFormRegistry.registerRootForm(formInstance);

          const config: LogicConfig = {
            type: 'customLogic' as any,
            condition: true,
          };

          expect(() => {
            applyLogic(config, formInstance().controls.field);
          }).not.toThrow();
        });
      });
    });

    describe('invalid condition expressions', () => {
      it('should handle invalid ConditionalExpression type without throwing', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ email: 'test@example.com' });
          const formInstance = form(formValue);
          rootFormRegistry.registerRootForm(formInstance);

          const config: LogicConfig = {
            type: 'hidden',
            condition: {
              type: 'invalidType' as any,
            },
          };

          expect(() => {
            applyLogic(config, formInstance().controls.email);
          }).not.toThrow();
        });
      });

      it('should handle malformed ConditionalExpression without throwing', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ email: 'test@example.com' });
          const formInstance = form(formValue);
          rootFormRegistry.registerRootForm(formInstance);

          const config: LogicConfig = {
            type: 'hidden',
            condition: {} as any,
          };

          expect(() => {
            applyLogic(config, formInstance().controls.email);
          }).not.toThrow();
        });
      });
    });
  });

  describe('applyMultipleLogic', () => {
    it('should apply multiple logic configurations without throwing', () => {
      runInInjectionContext(injector, () => {
        const formValue = signal({ email: '' });
        const formInstance = form(formValue);
        rootFormRegistry.registerRootForm(formInstance);

        const configs: LogicConfig[] = [
          { type: 'hidden', condition: false },
          { type: 'readonly', condition: true },
        ];

        expect(() => {
          applyMultipleLogic(configs, formInstance().controls.email);
        }).not.toThrow();
      });
    });

    it('should handle empty logic array without throwing', () => {
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

    it('should continue with invalid configs without throwing', () => {
      runInInjectionContext(injector, () => {
        const formValue = signal({ email: '' });
        const formInstance = form(formValue);
        rootFormRegistry.registerRootForm(formInstance);

        const configs: LogicConfig[] = [
          { type: 'hidden', condition: true },
          { type: 'unknownType' as any, condition: true },
          { type: 'readonly', condition: true },
        ];

        expect(() => {
          applyMultipleLogic(configs, formInstance().controls.email);
        }).not.toThrow();
      });
    });

    it('should handle disabled logic in sequence', () => {
      runInInjectionContext(injector, () => {
        const formValue = signal({ email: '' });
        const formInstance = form(formValue);
        rootFormRegistry.registerRootForm(formInstance);

        const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        const configs: LogicConfig[] = [
          { type: 'hidden', condition: true },
          { type: 'disabled', condition: true },
          { type: 'readonly', condition: true },
        ];

        applyMultipleLogic(configs, formInstance().controls.email);

        expect(consoleWarnSpy).toHaveBeenCalledWith('Disabled logic must be handled at component level');
        consoleWarnSpy.mockRestore();
      });
    });
  });
});
