import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { NgForgeFieldShell, NG_FORGE_FIELD_SHELL_INPUTS } from './ng-forge-field-shell.directive';

@Component({
  selector: 'test-shell-host',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [{ directive: NgForgeFieldShell, inputs: [...NG_FORGE_FIELD_SHELL_INPUTS] }],
})
class TestShellHostComponent {}

describe('NgForgeFieldShell', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({}).compileComponents();
  });

  describe('host bindings', () => {
    it('binds [id] from key()', () => {
      TestBed.configureTestingModule({ imports: [TestShellHostComponent] });
      const fixture = TestBed.createComponent(TestShellHostComponent);
      fixture.componentRef.setInput('key', 'username');
      fixture.detectChanges();

      expect((fixture.nativeElement as HTMLElement).getAttribute('id')).toBe('username');
    });

    it('binds [attr.data-testid] from key()', () => {
      TestBed.configureTestingModule({ imports: [TestShellHostComponent] });
      const fixture = TestBed.createComponent(TestShellHostComponent);
      fixture.componentRef.setInput('key', 'email');
      fixture.detectChanges();

      expect((fixture.nativeElement as HTMLElement).getAttribute('data-testid')).toBe('email');
    });

    it('binds [class] from className()', () => {
      TestBed.configureTestingModule({ imports: [TestShellHostComponent] });
      const fixture = TestBed.createComponent(TestShellHostComponent);
      fixture.componentRef.setInput('key', 'username');
      fixture.componentRef.setInput('className', 'custom-class extra');
      fixture.detectChanges();

      const host = fixture.nativeElement as HTMLElement;
      expect(host.classList.contains('custom-class')).toBe(true);
      expect(host.classList.contains('extra')).toBe(true);
    });

    it('defaults className to empty string', () => {
      TestBed.configureTestingModule({ imports: [TestShellHostComponent] });
      const fixture = TestBed.createComponent(TestShellHostComponent);
      fixture.componentRef.setInput('key', 'username');
      fixture.detectChanges();

      const host = fixture.nativeElement as HTMLElement;
      expect(host.className).toBe('');
    });
  });

  describe('required key', () => {
    it('throws NG0950 when detectChanges runs before key is bound', () => {
      TestBed.configureTestingModule({ imports: [TestShellHostComponent] });
      const fixture = TestBed.createComponent(TestShellHostComponent);
      expect(() => fixture.detectChanges()).toThrow(/NG0950|required/i);
    });
  });

  describe('reactivity', () => {
    it('updates [id] and [data-testid] when key changes', () => {
      TestBed.configureTestingModule({ imports: [TestShellHostComponent] });
      const fixture = TestBed.createComponent(TestShellHostComponent);
      fixture.componentRef.setInput('key', 'first');
      fixture.detectChanges();

      const host = fixture.nativeElement as HTMLElement;
      expect(host.getAttribute('id')).toBe('first');
      expect(host.getAttribute('data-testid')).toBe('first');

      fixture.componentRef.setInput('key', 'second');
      fixture.detectChanges();

      expect(host.getAttribute('id')).toBe('second');
      expect(host.getAttribute('data-testid')).toBe('second');
    });
  });
});
