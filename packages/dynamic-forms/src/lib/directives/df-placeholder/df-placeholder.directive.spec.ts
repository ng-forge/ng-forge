import { describe, it, expect, beforeEach } from 'vitest';
import { Component, TemplateRef, signal, viewChildren, type Signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DfPlaceholder, DfPlaceholderRegistry, type FieldPlaceholderContext } from './df-placeholder.directive';

@Component({
  imports: [DfPlaceholder],
  template: `
    <ng-template dfPlaceholder let-field>default</ng-template>
    <ng-template dfPlaceholder="textarea">type</ng-template>
    <ng-template dfPlaceholderKey="username">key</ng-template>
    <ng-template dfPlaceholder="input" dfPlaceholderKey="special">both</ng-template>
  `,
})
class HostComponent {
  readonly placeholders: Signal<readonly DfPlaceholder[]> = viewChildren(DfPlaceholder);
}

const tpl = (name: string) => ({ __name: name }) as unknown as TemplateRef<FieldPlaceholderContext>;

// Minimal stand-in for a projected directive: only the inputs and templateRef the registry reads.
const fake = (templateRef: TemplateRef<FieldPlaceholderContext>, type = '', key = '') =>
  ({ dfPlaceholder: () => type, dfPlaceholderKey: () => key, templateRef }) as unknown as DfPlaceholder;

describe('DfPlaceholderRegistry', () => {
  let registry: DfPlaceholderRegistry;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [DfPlaceholderRegistry] });
    registry = TestBed.inject(DfPlaceholderRegistry);
  });

  it('defaults to empty buckets and no default template', () => {
    const p = registry.placeholders();
    expect(p.byKey.size).toBe(0);
    expect(p.byType.size).toBe(0);
    expect(p.default).toBeUndefined();
  });

  it('classifies projected templates by cascade bucket (key beats type beats default)', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const [defaultDir, typeDir, keyDir, bothDir] = fixture.componentInstance.placeholders();

    registry.bind(fixture.componentInstance.placeholders);
    const p = registry.placeholders();

    expect(p.default).toBe(defaultDir.templateRef);
    expect(p.byType.get('textarea')).toBe(typeDir.templateRef);
    expect(p.byKey.get('username')).toBe(keyDir.templateRef);
    // Both inputs set → key wins.
    expect(p.byKey.get('special')).toBe(bothDir.templateRef);
    expect(p.byType.has('input')).toBe(false);
  });

  it('last wins when two templates register under the same bucket entry', () => {
    const first = tpl('first');
    const second = tpl('second');
    registry.bind(signal([fake(first, 'input'), fake(second, 'input')]));

    expect(registry.placeholders().byType.get('input')).toBe(second);
  });

  it('recomputes when the projected list changes', () => {
    const list = signal<readonly DfPlaceholder[]>([]);
    registry.bind(list);
    expect(registry.placeholders().default).toBeUndefined();

    const defaultTpl = tpl('default');
    list.set([fake(defaultTpl)]);

    expect(registry.placeholders().default).toBe(defaultTpl);
  });
});
