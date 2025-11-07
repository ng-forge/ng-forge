# Next Steps - Demo Apps Isolation

## Current Status

I've implemented the architecture for isolated demo apps to resolve the CSS and provider conflicts. Here's what's complete and what needs attention:

## ✅ Completed

1. **Architecture & Infrastructure**

   - Created `docs-examples/primeng` and `docs-examples/ionic` apps
   - Created `ExampleIframeComponent` for embedding examples
   - Created environment configuration for dev/prod URLs
   - Removed PrimeNG and Ionic providers/styles from docs app
   - Created `prepare-deploy.js` script for GitHub Pages deployment
   - Updated package.json scripts for building and serving
   - Updated GitHub Actions workflow

2. **Documentation**
   - Comprehensive architecture docs in `docs/architecture/`
   - Implementation plan with step-by-step guide
   - E2E testing and deployment strategy

## ⚠️ Build Issues (Blocking)

The example apps won't build due to module resolution issues with `@angular/forms/signals`:

### The Problem

- The library code (dynamic-form, dynamic-form-primeng, dynamic-form-ionic) imports from `@angular/forms/signals`
- These libraries build successfully with `ng-packagr`
- But when example apps try to compile them via @angular/build:application (esbuild), it can't resolve the subpath export
- This is a known limitation with how @angular/build handles package.json "exports" differently than ng-packagr

### Attempted Solutions

1. ✅ Fixed animation provider imports → Still had other issues
2. ✅ Reset Nx cache → Revealed the real issue
3. ⚠️ Changed tsconfig paths to point to dist/ → Hit missing subpath exports
4. ⏭️ Need to either:
   - Wait for @angular/build to properly support subpath exports
   - Modify libraries to not use `@angular/forms/signals` directly
   - Use a different bundler for example apps
   - Build libraries with all exports properly configured

## 🔧 Recommended Fix Options

### Option 1: Use Material Demo as Template (Easiest)

Since `apps/demo/material` builds successfully:

1. Keep Material as the primary demo/example app
2. Add PrimeNG and Ionic examples to separate pages within Material demo
3. Use the iframe approach only for Material demo
4. This works because Material demo doesn't have the same import issues

**Pros**: Works immediately, no build issues
**Cons**: All UI libraries in one app again (but isolated by iframes)

### Option 2: Fix Library Exports (Most Correct)

Update the library build configuration to properly export all subpaths:

```jsonc
// packages/dynamic-form-primeng/ng-package.json
{
  "lib": {
    "entryFile": "src/index.ts"
  },
  "allowedNonPeerDependencies": ["..."],
  // Add secondary entry points
  "entryPoints": {
    "no-augmentation": "src/no-augmentation/index.ts"
  }
}
```

**Pros**: Proper solution, works long-term
**Cons**: Requires library changes and rebuild

### Option 3: Simpler Example Components (Quick Win)

Create simpler example components that don't rely on the problematic imports:

```typescript
// Simple example that just shows the output
@Component({
  template: `
    <div class="example-wrapper">
      <h3>{{ title }}</h3>
      <div [innerHTML]="renderedExample"></div>
    </div>
  `
})
```

**Pros**: Works around the build issues
**Cons**: Less interactive, not using actual components

## 📋 Immediate Actions

### If You Want to Proceed Despite Build Issues:

1. **Use What Works**:

   ```bash
   # Docs app works (removed conflicting providers)
   pnpm serve:docs

   # Material demo works
   pnpm serve:material
   ```

2. **Test the iframe mechanism** with Material:

   - Export `ExampleIframeComponent` in docs app
   - Try embedding Material demo in an iframe
   - Verify dev and prod URLs work

3. **Fix one library at a time**:
   - Start with getting PrimeNG examples building
   - Then move to Ionic

### If You Want Me to Try Different Approaches:

1. **I can modify the libraries** to properly export subpaths
2. **I can create simplified example components** that avoid the imports
3. **I can set up a webpack-based builder** instead of esbuild
4. **I can help debug** the specific @angular/forms/signals issue

## 🎯 What Would You Like Me to Do?

Please let me know which direction you'd like to take:

A. Fix the library exports and secondary entry points
B. Create simplified example components as a workaround
C. Focus on getting Material iframe integration working first
D. Something else?

The infrastructure is solid - we just need to resolve the build tooling compatibility issues.
