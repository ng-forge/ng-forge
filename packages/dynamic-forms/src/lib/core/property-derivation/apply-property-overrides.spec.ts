import { describe, expect, it } from 'vitest';

import { DynamicFormError } from '../../errors/dynamic-form-error';
import { applyPropertyOverrides } from './apply-property-overrides';

describe('applyPropertyOverrides', () => {
  it('should return inputs unchanged when overrides is empty', () => {
    const inputs = { label: 'Name', placeholder: 'Enter name' };
    const result = applyPropertyOverrides(inputs, {});

    expect(result).toBe(inputs);
  });

  it('should apply a simple top-level property override', () => {
    const inputs: Record<string, unknown> = { label: 'Name', placeholder: 'Enter name' };
    const result = applyPropertyOverrides(inputs, { label: 'Full Name' });

    expect(result).toEqual({ label: 'Full Name', placeholder: 'Enter name' });
  });

  it('should apply multiple simple overrides', () => {
    const inputs: Record<string, unknown> = { label: 'Name', placeholder: 'Enter name', required: false };
    const result = applyPropertyOverrides(inputs, { label: 'Full Name', required: true });

    expect(result).toEqual({ label: 'Full Name', placeholder: 'Enter name', required: true });
  });

  it('should apply a nested property override (one dot)', () => {
    const inputs: Record<string, unknown> = {
      label: 'Name',
      props: { appearance: 'outline', floatLabel: 'auto' },
    };
    const result = applyPropertyOverrides(inputs, { 'props.appearance': 'fill' });

    expect(result).toEqual({
      label: 'Name',
      props: { appearance: 'fill', floatLabel: 'auto' },
    });
  });

  it('should create parent object if it does not exist for nested overrides', () => {
    const inputs: Record<string, unknown> = { label: 'Name' };
    const result = applyPropertyOverrides(inputs, { 'props.appearance': 'fill' });

    expect(result).toEqual({
      label: 'Name',
      props: { appearance: 'fill' },
    });
  });

  it('should throw DynamicFormError for paths deeper than 2 levels', () => {
    const inputs: Record<string, unknown> = { label: 'Name' };

    expect(() => applyPropertyOverrides(inputs, { 'props.nested.deep': 'value' })).toThrowError(DynamicFormError);
    expect(() => applyPropertyOverrides(inputs, { 'a.b.c': 'value' })).toThrow(
      /Property override path 'a\.b\.c' exceeds maximum depth of 2 levels/,
    );
  });

  it('should replace array-valued overrides wholesale without merging', () => {
    const inputs: Record<string, unknown> = {
      options: [
        { label: 'A', value: 'a' },
        { label: 'B', value: 'b' },
      ],
    };
    const newOptions = [{ label: 'C', value: 'c' }];
    const result = applyPropertyOverrides(inputs, { options: newOptions });

    expect(result).toEqual({ options: [{ label: 'C', value: 'c' }] });
    expect(result['options']).toBe(newOptions);
  });

  it('should not mutate the original inputs object', () => {
    const innerProps = { appearance: 'outline', floatLabel: 'auto' };
    const inputs: Record<string, unknown> = { label: 'Name', props: innerProps };

    const result = applyPropertyOverrides(inputs, { label: 'Full Name', 'props.appearance': 'fill' });

    // Original inputs must remain unchanged
    expect(inputs['label']).toBe('Name');
    expect(inputs['props']).toBe(innerProps);
    expect(innerProps).toEqual({ appearance: 'outline', floatLabel: 'auto' });

    // Result must reflect overrides
    expect(result['label']).toBe('Full Name');
    expect((result['props'] as Record<string, unknown>)['appearance']).toBe('fill');

    // Result's parent object must be a different reference
    expect(result['props']).not.toBe(innerProps);
  });
});
