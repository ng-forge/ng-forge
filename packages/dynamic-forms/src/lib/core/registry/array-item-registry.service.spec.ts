import { describe, expect, it } from 'vitest';
import { ArrayItemRegistryService } from './array-item-registry.service';
import type { FieldDef } from '../../definitions/base/field-def';

const template = (key: string): FieldDef<unknown>[] => [{ key, type: 'input' } as FieldDef<unknown>];

describe('ArrayItemRegistryService', () => {
  describe('slotFor', () => {
    it('returns the same slot instance for the same path', () => {
      const registry = new ArrayItemRegistryService();
      const slot1 = registry.slotFor('members');
      const slot2 = registry.slotFor('members');
      expect(slot1).toBe(slot2);
    });

    it('returns distinct slots for distinct paths', () => {
      const registry = new ArrayItemRegistryService();
      const a = registry.slotFor('members');
      const b = registry.slotFor('team.members');
      expect(a).not.toBe(b);
    });
  });

  describe('nextId', () => {
    it('produces monotonic ids', () => {
      const slot = new ArrayItemRegistryService().slotFor('members');
      expect(slot.nextId()).toBe('item-0');
      expect(slot.nextId()).toBe('item-1');
      expect(slot.nextId()).toBe('item-2');
    });

    it('does not collide with other slots', () => {
      const reg = new ArrayItemRegistryService();
      const a = reg.slotFor('a');
      const b = reg.slotFor('b');
      expect(a.nextId()).toBe('item-0');
      expect(b.nextId()).toBe('item-0');
      expect(a.nextId()).toBe('item-1');
    });

    it('resets after clear', () => {
      const slot = new ArrayItemRegistryService().slotFor('members');
      slot.nextId();
      slot.nextId();
      slot.clear();
      expect(slot.nextId()).toBe('item-0');
    });
  });

  describe('template storage', () => {
    it('stores and retrieves templates by id', () => {
      const slot = new ArrayItemRegistryService().slotFor('members');
      const t = template('name');
      slot.setTemplate('item-0', t);
      expect(slot.getTemplate('item-0')).toBe(t);
      expect(slot.hasTemplate('item-0')).toBe(true);
    });

    it('returns undefined for unknown ids', () => {
      const slot = new ArrayItemRegistryService().slotFor('members');
      expect(slot.getTemplate('item-99')).toBeUndefined();
      expect(slot.hasTemplate('item-99')).toBe(false);
    });
  });

  describe('itemOrder tracking', () => {
    it('appends ids in order', () => {
      const slot = new ArrayItemRegistryService().slotFor('members');
      slot.setIdAt(0, 'item-0');
      slot.setIdAt(1, 'item-1');
      slot.setIdAt(2, 'item-2');
      expect(slot.itemOrder).toEqual(['item-0', 'item-1', 'item-2']);
    });

    it('removeAt deletes the id and its template', () => {
      const slot = new ArrayItemRegistryService().slotFor('members');
      slot.setIdAt(0, 'item-0');
      slot.setIdAt(1, 'item-1');
      slot.setTemplate('item-0', template('a'));
      slot.setTemplate('item-1', template('b'));

      slot.removeAt(0);

      expect(slot.itemOrder).toEqual(['item-1']);
      expect(slot.hasTemplate('item-0')).toBe(false);
      expect(slot.hasTemplate('item-1')).toBe(true);
    });

    it('moveItem reorders without losing templates', () => {
      const slot = new ArrayItemRegistryService().slotFor('members');
      slot.setIdAt(0, 'item-0');
      slot.setIdAt(1, 'item-1');
      slot.setIdAt(2, 'item-2');
      slot.setTemplate('item-0', template('a'));
      slot.setTemplate('item-1', template('b'));
      slot.setTemplate('item-2', template('c'));

      slot.moveItem(0, 2);

      expect(slot.itemOrder).toEqual(['item-1', 'item-2', 'item-0']);
      expect(slot.hasTemplate('item-0')).toBe(true);
      expect(slot.hasTemplate('item-1')).toBe(true);
      expect(slot.hasTemplate('item-2')).toBe(true);
    });

    it('truncate drops templates for removed ids', () => {
      const slot = new ArrayItemRegistryService().slotFor('members');
      slot.setIdAt(0, 'item-0');
      slot.setIdAt(1, 'item-1');
      slot.setIdAt(2, 'item-2');
      slot.setTemplate('item-0', template('a'));
      slot.setTemplate('item-1', template('b'));
      slot.setTemplate('item-2', template('c'));

      slot.truncate(1);

      expect(slot.itemOrder).toEqual(['item-0']);
      expect(slot.hasTemplate('item-0')).toBe(true);
      expect(slot.hasTemplate('item-1')).toBe(false);
      expect(slot.hasTemplate('item-2')).toBe(false);
    });
  });

  describe('primitiveFieldKey', () => {
    it('starts undefined', () => {
      const slot = new ArrayItemRegistryService().slotFor('members');
      expect(slot.primitiveFieldKey()).toBeUndefined();
    });

    it('can be written and read', () => {
      const slot = new ArrayItemRegistryService().slotFor('members');
      slot.primitiveFieldKey.set('value');
      expect(slot.primitiveFieldKey()).toBe('value');
    });

    it('resets to undefined on clear', () => {
      const slot = new ArrayItemRegistryService().slotFor('members');
      slot.primitiveFieldKey.set('value');
      slot.clear();
      expect(slot.primitiveFieldKey()).toBeUndefined();
    });
  });

  describe('clear / clearAll', () => {
    it('clear empties templates, itemOrder, and resets the counter', () => {
      const slot = new ArrayItemRegistryService().slotFor('members');
      slot.setIdAt(0, slot.nextId());
      slot.setTemplate('item-0', template('a'));
      slot.primitiveFieldKey.set('value');

      slot.clear();

      expect(slot.itemOrder).toEqual([]);
      expect(slot.hasTemplate('item-0')).toBe(false);
      expect(slot.primitiveFieldKey()).toBeUndefined();
      expect(slot.nextId()).toBe('item-0');
    });

    it('clearAll drops every slot in the registry', () => {
      const reg = new ArrayItemRegistryService();
      const a = reg.slotFor('a');
      const b = reg.slotFor('b');
      a.setTemplate('x', template('a'));
      b.setTemplate('y', template('b'));

      reg.clearAll();

      // After clearAll, slotFor returns a NEW slot instance — counter, templates, itemOrder all fresh.
      const a2 = reg.slotFor('a');
      expect(a2).not.toBe(a);
      expect(a2.hasTemplate('x')).toBe(false);
      expect(a2.nextId()).toBe('item-0');
    });
  });
});
