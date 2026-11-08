import { describe, expect, it } from 'vitest';
import { IonicDatepickerPropsSchema } from './index';

describe('IonicDatepickerPropsSchema locale', () => {
  it.each(['en-US', 'de-DE', 'ro'])('accepts %s', (locale) => {
    expect(IonicDatepickerPropsSchema.safeParse({ locale }).success).toBe(true);
  });

  it.each(['en_US', ''])('rejects %j', (locale) => {
    expect(IonicDatepickerPropsSchema.safeParse({ locale }).success).toBe(false);
  });
});
