import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  ChangeDetectionStrategy,
  Component,
  Type,
  ViewContainerRef,
  createComponent,
  EnvironmentInjector,
  inject,
  input,
  viewChild,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { FieldWrapperContract, WrapperConfig, WrapperTypeDefinition } from '../../models/wrapper-type';
import { Logger } from '../../providers/features/logger/logger.interface';
import { hasDefaultExport, loadWrapperComponents, renderWrapperChain, resolveDefaultExport, setInputIfDeclared } from './wrapper-chain';

/** No-op logger for tests that don't assert on log output. */
function silentLogger(): Logger {
  return { info: vi.fn(), warn: vi.fn(), error: vi.fn() };
}

@Component({
  selector: 'test-input-cmp',
  template: `<span>{{ label() ?? '' }}</span>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TestInputComponent {
  readonly label = input<string>();
}

@Component({
  selector: 'test-wrapper-a',
  template: `<div data-wrapper="a" [attr.data-title]="title()"><ng-container #fieldComponent></ng-container></div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TestWrapperA implements FieldWrapperContract {
  readonly fieldComponent = viewChild.required('fieldComponent', { read: ViewContainerRef });
  readonly title = input<string>();
}

@Component({
  selector: 'test-wrapper-b',
  template: `<div data-wrapper="b"><ng-container #fieldComponent></ng-container></div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TestWrapperB implements FieldWrapperContract {
  readonly fieldComponent = viewChild.required('fieldComponent', { read: ViewContainerRef });
}

/** Nested wrapper that injects TestWrapperB — proves the element injector chain is intact. */
@Component({
  selector: 'test-wrapper-b-nested',
  template: `<div data-wrapper="b-nested"><ng-container #fieldComponent></ng-container></div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TestWrapperBNested implements FieldWrapperContract {
  readonly fieldComponent = viewChild.required('fieldComponent', { read: ViewContainerRef });
  readonly parent = inject(TestWrapperB);
}

/** Wrapper whose #fieldComponent sits inside an @if — viewChild.required throws. */
@Component({
  selector: 'test-wrapper-broken',
  template: `
    @if (false) {
      <ng-container #fieldComponent></ng-container>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TestWrapperBroken implements FieldWrapperContract {
  readonly fieldComponent = viewChild.required('fieldComponent', { read: ViewContainerRef });
}

/** Host component providing a VCR to render into. */
@Component({
  selector: 'test-host',
  template: `<div><ng-container #slot></ng-container></div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TestHostComponent {
  readonly slot = viewChild.required('slot', { read: ViewContainerRef });
  readonly envInjector = inject(EnvironmentInjector);
}

function def(name: string, loader: () => Type<unknown>): WrapperTypeDefinition {
  return {
    wrapperName: name,
    loadComponent: () => Promise.resolve({ default: loader() }),
  };
}

describe('wrapper-chain', () => {
  describe('hasDefaultExport / resolveDefaultExport', () => {
    it('hasDefaultExport narrows an ES-module result', () => {
      const mod = { default: TestInputComponent };
      expect(hasDefaultExport(mod)).toBe(true);
      expect(hasDefaultExport(TestInputComponent)).toBe(false);
      expect(hasDefaultExport(null)).toBe(false);
      expect(hasDefaultExport(undefined)).toBe(false);
      expect(hasDefaultExport({})).toBe(false);
      expect(hasDefaultExport({ default: undefined })).toBe(false);
    });

    it('resolveDefaultExport picks the class from either shape', () => {
      expect(resolveDefaultExport({ default: TestInputComponent })).toBe(TestInputComponent);
      expect(resolveDefaultExport(TestInputComponent)).toBe(TestInputComponent);
    });
  });

  describe('setInputIfDeclared', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({});
    });

    it('sets the input when the component declares it', () => {
      const envInjector = TestBed.inject(EnvironmentInjector);
      const ref = createComponent(TestInputComponent, { environmentInjector: envInjector });
      ref.changeDetectorRef.detectChanges();

      setInputIfDeclared(ref, 'label', 'hello');
      ref.changeDetectorRef.detectChanges();

      expect(ref.location.nativeElement.textContent.trim()).toBe('hello');
      ref.destroy();
    });

    it('silently skips when the input is not declared (no NG0303)', () => {
      const envInjector = TestBed.inject(EnvironmentInjector);
      const ref = createComponent(TestInputComponent, { environmentInjector: envInjector });

      // TestInputComponent has no 'mystery' input; before this helper existed
      // the outlet would crash with NG0303 on the next line.
      expect(() => setInputIfDeclared(ref, 'mystery', 123)).not.toThrow();
      ref.destroy();
    });
  });

  describe('loadWrapperComponents', () => {
    it('emits an empty array for an empty config list', async () => {
      const registry = new Map<string, WrapperTypeDefinition>();
      const cache = new Map<string, Type<unknown>>();

      const result = await firstValueFrom(loadWrapperComponents([], registry, cache, silentLogger()));

      expect(result).toEqual([]);
    });

    it('resolves registered wrappers in order', async () => {
      const registry = new Map<string, WrapperTypeDefinition>([
        ['a', def('a', () => TestWrapperA)],
        ['b', def('b', () => TestWrapperB)],
      ]);
      const cache = new Map<string, Type<unknown>>();
      const configs: WrapperConfig[] = [{ type: 'a', title: 't' } as WrapperConfig, { type: 'b' } as WrapperConfig];

      const result = await firstValueFrom(loadWrapperComponents(configs, registry, cache, silentLogger()));

      expect(result.map((r) => r.component)).toEqual([TestWrapperA, TestWrapperB]);
      expect(result.map((r) => r.config)).toEqual(configs);
    });

    it('aborts the whole chain (emits []) when any wrapper fails to load — logs once per failure', async () => {
      const registry = new Map<string, WrapperTypeDefinition>([['a', def('a', () => TestWrapperA)]]);
      const cache = new Map<string, Type<unknown>>();
      const logger = silentLogger();

      const result = await firstValueFrom(
        loadWrapperComponents([{ type: 'a' } as WrapperConfig, { type: 'missing' } as WrapperConfig], registry, cache, logger),
      );

      // Fail-closed: even the healthy `a` wrapper is dropped so the field
      // doesn't render in a partially-wrapped, visually-misleading state.
      expect(result).toEqual([]);
      expect(logger.error).toHaveBeenCalledWith(expect.stringContaining("'missing'"));
      expect(logger.error).toHaveBeenCalledTimes(1);
    });
  });

  describe('renderWrapperChain', () => {
    let host: TestHostComponent;
    let envInjector: EnvironmentInjector;

    beforeEach(() => {
      TestBed.configureTestingModule({ imports: [TestHostComponent] });
      const fixture = TestBed.createComponent(TestHostComponent);
      fixture.detectChanges();
      host = fixture.componentInstance;
      envInjector = host.envInjector;
    });

    it('nests wrappers outermost → innermost and calls renderInnermost at the deepest slot', () => {
      const innermost = vi.fn();
      const refs = renderWrapperChain({
        outerContainer: host.slot(),
        loadedWrappers: [
          { config: { type: 'a', title: 'Outer' } as WrapperConfig, component: TestWrapperA },
          { config: { type: 'b' } as WrapperConfig, component: TestWrapperB },
        ],
        environmentInjector: envInjector,
        logger: silentLogger(),
        renderInnermost: innermost,
      });

      expect(refs).toHaveLength(2);
      expect(refs[0].componentType).toBe(TestWrapperA);
      expect(refs[1].componentType).toBe(TestWrapperB);
      // Innermost VCR is inside wrapper B's #fieldComponent slot.
      expect(innermost).toHaveBeenCalledTimes(1);
    });

    it('lets a nested wrapper inject its parent wrapper via the element injector', () => {
      // Reported by dereekb: wrappers lost access to outer wrappers once the
      // controller started passing a static parentInjector to every slot.
      // Using `slot.injector` at each step keeps the element chain intact.
      const refs = renderWrapperChain({
        outerContainer: host.slot(),
        loadedWrappers: [
          { config: { type: 'b' } as WrapperConfig, component: TestWrapperB },
          { config: { type: 'b-nested' } as WrapperConfig, component: TestWrapperBNested },
        ],
        environmentInjector: envInjector,
        logger: silentLogger(),
        renderInnermost: () => undefined,
      });

      expect(refs).toHaveLength(2);
      const nested = refs[1].instance as TestWrapperBNested;
      expect(nested.parent).toBeInstanceOf(TestWrapperB);
      expect(nested.parent).toBe(refs[0].instance);
    });

    it('pushes declared config props via setInput and ignores unknown keys', () => {
      renderWrapperChain({
        outerContainer: host.slot(),
        loadedWrappers: [{ config: { type: 'a', title: 'hi', bogus: 'ignored' } as unknown as WrapperConfig, component: TestWrapperA }],
        environmentInjector: envInjector,
        logger: silentLogger(),
        renderInnermost: () => undefined,
      });

      const wrapperEl = host.slot().element.nativeElement.parentElement?.querySelector('[data-wrapper="a"]') as HTMLElement | null;
      expect(wrapperEl?.getAttribute('data-title')).toBe('hi');
    });

    it('logs an actionable error when a wrapper forgets #fieldComponent (viewChild.required throws)', () => {
      const logger = silentLogger();
      const innermost = vi.fn();

      renderWrapperChain({
        outerContainer: host.slot(),
        loadedWrappers: [{ config: { type: 'broken' } as WrapperConfig, component: TestWrapperBroken }],
        environmentInjector: envInjector,
        logger,
        renderInnermost: innermost,
      });

      expect(logger.error).toHaveBeenCalledWith(expect.stringContaining("'broken'"));
      expect(innermost).not.toHaveBeenCalled();
    });

    it('vcr.clear() on the outer container cascades destroy through every wrapper ref', () => {
      const refs = renderWrapperChain({
        outerContainer: host.slot(),
        loadedWrappers: [
          { config: { type: 'a' } as WrapperConfig, component: TestWrapperA },
          { config: { type: 'b' } as WrapperConfig, component: TestWrapperB },
        ],
        environmentInjector: envInjector,
        logger: silentLogger(),
        renderInnermost: () => undefined,
      });

      let outerDestroyed = false;
      let innerDestroyed = false;
      refs[0].onDestroy(() => (outerDestroyed = true));
      refs[1].onDestroy(() => (innerDestroyed = true));

      host.slot().clear();

      expect(outerDestroyed).toBe(true);
      expect(innerDestroyed).toBe(true);
    });
  });
});
