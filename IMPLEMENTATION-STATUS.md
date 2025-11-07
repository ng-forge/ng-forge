# Implementation Status: Demo Apps Isolation

## Overview

This document tracks the implementation progress of isolating demo apps to resolve CSS and provider conflicts between Material, PrimeNG, and Ionic.

## Completed ✅

### 1. Project Structure

- ✅ Created `docs-examples/primeng` app with complete Angular setup
- ✅ Created `docs-examples/ionic` app with complete Angular setup
- ✅ Set up project.json configuration for both apps
- ✅ Configured TypeScript, ESLint, and Playwright for both apps
- ✅ Set up routing with hash-based navigation
- ✅ Copied existing PrimeNG examples to primeng app
- ✅ Created basic Ionic example (input demo)

### 2. Documentation Infrastructure

- ✅ Created `ExampleIframeComponent` for embedding examples
- ✅ Created environment configuration for dev/prod URLs
- ✅ Removed PrimeNG and Ionic providers from docs app
- ✅ Removed PrimeNG and Ionic styles from docs app
- ✅ Updated docs app.config.ts to use environment config

### 3. Build & Deployment

- ✅ Created `scripts/prepare-deploy.js` for GitHub Pages deployment
- ✅ Updated package.json with new scripts:
  - `build:examples` - Build all example apps
  - `build:all:prod` - Build everything for production
  - `prepare:deploy` - Prepare unified deployment directory
  - `deploy:prep` - Full build and deployment preparation
  - `serve:all` - Run all apps in parallel
  - Individual serve commands for each app
- ✅ Updated GitHub Actions workflow for deployment
- ✅ Configured base HREFs for production builds

### 4. Architecture Documentation

- ✅ Created comprehensive architecture documentation
- ✅ Created implementation plan
- ✅ Created E2E testing and deployment strategy

## Pending / Issues ⚠️

### 1. Build Dependencies

**Status**: Blocked by library issues

The example apps have build errors related to:

- Missing `@angular/platform-browser/animations` (using `@angular/platform-browser/animations/async` which may not exist in Angular 21)
- Missing `@angular/forms/signals` imports in dynamic-form-primeng library
- PrimeUI theme imports

**Resolution**: Need to:

1. Check Angular 21 API for correct animation provider imports
2. Fix dynamic-form-primeng library imports
3. Verify all peer dependencies are installed

### 2. Example Component Migration

**Status**: Partially complete

- ✅ PrimeNG examples copied to docs-examples/primeng
- ⚠️ Need to update example components to work standalone
- ⚠️ Need to remove `provideDynamicForm` from individual components (already provided in app.config.ts)
- ⏭️ Need to create more Ionic examples

### 3. IFrame Integration

**Status**: Infrastructure ready, needs integration

- ✅ ExampleIframeComponent created
- ⏭️ Need to update ng-doc pages to use `<example-iframe>` component
- ⏭️ Need to export ExampleIframeComponent or make it available in docs

**Example usage**:

```html
<!-- In ng-doc markdown/components -->
<example-iframe library="primeng" example="input" height="400px" />
```

### 4. E2E Tests

**Status**: Not started

- ⏭️ Need to move/create PrimeNG-specific e2e tests
- ⏭️ Need to move/create Ionic-specific e2e tests
- ✅ Material e2e tests already exist and are scoped

## Next Steps (Priority Order)

### Immediate (Required to unblock)

1. **Fix library build dependencies**

   ```bash
   # Check what's available in Angular 21
   # Fix dynamic-form-primeng imports
   # Update example app configs
   ```

2. **Test example apps build**

   ```bash
   pnpm nx build primeng-examples --configuration=development
   pnpm nx build ionic-examples --configuration=development
   ```

3. **Fix example components**
   - Remove duplicate `provideDynamicForm` calls
   - Ensure components work in standalone mode
   - Test each example route

### Short-term

4. **Integrate iframes in documentation**

   - Export ExampleIframeComponent
   - Update PrimeNG documentation pages
   - Update Ionic documentation pages
   - Test iframe loading in dev mode

5. **Create additional Ionic examples**
   - Create examples for all Ionic components
   - Set up routes for each example
   - Test each component

### Medium-term

6. **E2E Testing**

   - Create PrimeNG e2e test suite
   - Create Ionic e2e test suite
   - Set up CI matrix for parallel testing

7. **Complete documentation**
   - Document iframe usage for contributors
   - Document example app structure
   - Create guidelines for adding new examples

## Testing Strategy

### Local Development Testing

```bash
# Terminal 1: Docs app
pnpm serve:docs

# Terminal 2: Material demo (already exists)
pnpm serve:material

# Terminal 3: PrimeNG examples
pnpm serve:primeng

# Terminal 4: Ionic examples
pnpm serve:ionic

# Or run all at once:
pnpm serve:all
```

### Production Build Testing

```bash
# Build everything
pnpm run build:all:prod

# Prepare deployment
pnpm run prepare:deploy

# Serve locally to test
npx http-server dist/deploy -p 8080

# Test URLs:
# - http://localhost:8080/ng-forge/
# - http://localhost:8080/ng-forge/examples/material/
# - http://localhost:8080/ng-forge/examples/primeng/
# - http://localhost:8080/ng-forge/examples/ionic/
```

## Key Files

### Configuration

- `docs-examples/primeng/project.json` - PrimeNG example app config
- `docs-examples/ionic/project.json` - Ionic example app config
- `apps/docs/src/app/config/environment.ts` - Environment URLs config
- `scripts/prepare-deploy.js` - Deployment preparation script
- `.github/workflows/deploy.yml` - GitHub Actions deployment

### Components

- `apps/docs/src/app/components/example-iframe/example-iframe.component.ts` - IFrame wrapper
- `docs-examples/primeng/src/app/examples/` - PrimeNG examples
- `docs-examples/ionic/src/app/examples/` - Ionic examples

### Routing

- `docs-examples/primeng/src/app/app.routes.ts` - PrimeNG routes
- `docs-examples/ionic/src/app/app.routes.ts` - Ionic routes

## Deployment URLs (Production)

```
Main docs:      https://ng-forge.github.io/ng-forge/
Material:       https://ng-forge.github.io/ng-forge/examples/material/
PrimeNG:        https://ng-forge.github.io/ng-forge/examples/primeng/
Ionic:          https://ng-forge.github.io/ng-forge/examples/ionic/
```

## Known Issues

1. **Build Errors**: Example apps don't build due to dependency issues
2. **Example Components**: May need updates to work without duplicate providers
3. **Ionic Examples**: Only one example created so far, need more
4. **IFrame Integration**: Not yet integrated into actual documentation pages
5. **E2E Tests**: Not yet moved to example apps

## Questions for User

1. Should we keep Material examples in `apps/demo/material` or move to `docs-examples/material`?
2. Are there specific Ionic examples you want prioritized?
3. Should we fix the build issues before proceeding with iframe integration?
4. Any specific styling requirements for the iframe component?
