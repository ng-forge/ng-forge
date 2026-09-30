import { ngNative } from '@ng-native/testing/vitest';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  // ng-forge and ngxtension ship partial-compiled, so they go through the Angular linker too.
  plugins: [ngNative({ inline: [/@ng-forge\//, /ngxtension/] })],
  test: { include: ['src/**/*.test.ts'] },
});
