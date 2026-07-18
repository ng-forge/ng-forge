import { ChangeDetectionStrategy, Component } from '@angular/core';
import { getTestBed, TestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import { required } from '@angular/forms/signals';
import { FormEvent } from '@ng-forge/dynamic-forms';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NgForgeActionHost, NgForgeFieldHost } from '../directives/host-directive-presets';
import { injectNgForgeField } from '../directives/ng-forge-field.directive';
import { injectNgForgeAction } from '../directives/ng-forge-action.directive';
import { createNgForgeActionFixture, createNgForgeFieldFixture, provideTestValidationMessages } from './create-field-fixture';
import { ZonelessTestModule } from '../../../src/test-setup';

@Component({
  selector: 'test-harness-field',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [NgForgeFieldHost],
})
class TestHarnessFieldComponent {
  protected readonly ngf = injectNgForgeField<string>();
}

@Component({
  selector: 'test-harness-action',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [NgForgeActionHost],
})
class TestHarnessActionComponent {
  protected readonly action = injectNgForgeAction();
}

class TestSubmitEvent implements FormEvent {
  readonly type = 'test/submit';
}

describe('createNgForgeFieldFixture', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({}).compileComponents();
  });

  it('binds field + key before first detectChanges (no NG0950)', () => {
    const { fixture, field } = createNgForgeFieldFixture(TestHarnessFieldComponent, { key: 'username', value: 'alice' });
    expect(() => fixture.detectChanges()).not.toThrow();
    expect(field().value()).toBe('alice');
    expect((fixture.nativeElement as HTMLElement).getAttribute('id')).toBe('username');
  });

  it('applies the schema callback to the field path', () => {
    const { fixture, field } = createNgForgeFieldFixture(TestHarnessFieldComponent, {
      key: 'username',
      value: '',
      schema: (path) => required(path),
    });
    fixture.detectChanges();
    expect(field().invalid()).toBe(true);
    expect(field().required?.()).toBe(true);
  });

  it('marks the field as touched when touched: true', () => {
    const { fixture, field } = createNgForgeFieldFixture(TestHarnessFieldComponent, {
      key: 'username',
      value: '',
      schema: (path) => required(path),
      touched: true,
    });
    fixture.detectChanges();
    expect(field().touched()).toBe(true);
  });

  it('forwards extra component inputs via options.inputs', () => {
    const { fixture } = createNgForgeFieldFixture(TestHarnessFieldComponent, {
      key: 'username',
      value: '',
      inputs: { className: 'custom-class' },
    });
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).classList.contains('custom-class')).toBe(true);
  });

  it('threads provideTestValidationMessages through to the directive', () => {
    const { fixture } = createNgForgeFieldFixture(TestHarnessFieldComponent, {
      key: 'username',
      value: '',
      schema: (path) => required(path),
      touched: true,
      providers: [provideTestValidationMessages({ required: 'Pick a name' })],
    });
    fixture.detectChanges();
    const ngf = (fixture.componentInstance as { ['ngf']?: ReturnType<typeof injectNgForgeField> })['ngf'];
    expect(ngf?.errors()[0]?.message).toBe('Pick a name');
  });
});

describe('createNgForgeActionFixture', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({}).compileComponents();
  });

  it('binds key + label before first detectChanges (no NG0950)', () => {
    const { fixture } = createNgForgeActionFixture(TestHarnessActionComponent, { key: 'submit', label: 'Save' });
    expect(() => fixture.detectChanges()).not.toThrow();
    expect((fixture.nativeElement as HTMLElement).getAttribute('id')).toBe('submit');
  });

  it('provides EventBus and dispatches via action.dispatch()', () => {
    const { fixture, eventBus } = createNgForgeActionFixture(TestHarnessActionComponent, {
      key: 'submit',
      label: 'Save',
      event: TestSubmitEvent,
    });
    const dispatchSpy = vi.spyOn(eventBus, 'dispatch');
    fixture.detectChanges();
    const action = (fixture.componentInstance as { ['action']?: ReturnType<typeof injectNgForgeAction> })['action'];
    action?.dispatch();
    expect(dispatchSpy).toHaveBeenCalledWith(TestSubmitEvent);
  });

  it('reflects disabled via the host aria-disabled binding', () => {
    const { fixture } = createNgForgeActionFixture(TestHarnessActionComponent, {
      key: 'submit',
      label: 'Save',
      disabled: true,
    });
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).getAttribute('aria-disabled')).toBe('true');
  });
});

describe('uninitialized test environment guard', () => {
  it('throws an actionable error from both fixtures when the test environment is not initialized', () => {
    getTestBed().resetTestEnvironment();
    try {
      expect(() => createNgForgeFieldFixture(TestHarnessFieldComponent, { key: 'username', value: '' })).toThrowError(
        /server\.deps\.inline/,
      );
      expect(() => createNgForgeActionFixture(TestHarnessActionComponent, { key: 'submit', label: 'Save' })).toThrowError(
        /server\.deps\.inline/,
      );
    } finally {
      // Restore the exact environment from src/test-setup.ts so later tests are unaffected
      getTestBed().initTestEnvironment([BrowserTestingModule, ZonelessTestModule], platformBrowserTesting());
    }
  });
});
