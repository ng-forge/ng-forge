import { describe, it, expect, beforeEach } from 'vitest';
import { Component, TemplateRef, viewChildren, type Signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DfPlaceholder, DfPlaceholderRegistry, type FieldPlaceholderContext, type PlaceholderDescriptor } from './df-placeholder.directive';

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

describe('DfPlaceholder directive', () => {
  it('classifies each projected template by descriptor kind (key beats type beats default)', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const kinds = fixture.componentInstance.placeholders().map((p) => p.descriptor());

    expect(kinds[0]).toMatchObject({ kind: 'default', value: '' });
    expect(kinds[1]).toMatchObject({ kind: 'type', value: 'textarea' });
    expect(kinds[2]).toMatchObject({ kind: 'key', value: 'username' });
    // Both inputs set → key wins.
    expect(kinds[3]).toMatchObject({ kind: 'key', value: 'special' });
  });
});

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

  it('folds descriptors into the cascade buckets', () => {
    const keyTpl = tpl('key');
    const typeTpl = tpl('type');
    const defaultTpl = tpl('default');
    const descriptors: PlaceholderDescriptor[] = [
      { kind: 'key', value: 'username', templateRef: keyTpl },
      { kind: 'type', value: 'textarea', templateRef: typeTpl },
      { kind: 'default', value: '', templateRef: defaultTpl },
    ];

    registry.set(descriptors);
    const p = registry.placeholders();

    expect(p.byKey.get('username')).toBe(keyTpl);
    expect(p.byType.get('textarea')).toBe(typeTpl);
    expect(p.default).toBe(defaultTpl);
  });

  it('last wins when two templates register under the same bucket entry', () => {
    const first = tpl('first');
    const second = tpl('second');
    registry.set([
      { kind: 'type', value: 'input', templateRef: first },
      { kind: 'type', value: 'input', templateRef: second },
    ]);

    expect(registry.placeholders().byType.get('input')).toBe(second);
  });
});
