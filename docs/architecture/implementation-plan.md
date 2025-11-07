# Implementation Plan: Demo Apps Isolation

## Phase 1: Prepare Existing Material Demo App

### 1.1 Verify Material Demo Structure

- [x] Material demo already exists at `apps/demo/material`
- [ ] Check if it has proper routing for examples
- [ ] Ensure it can run standalone without docs app

### 1.2 Add Example Routes (if not exist)

```typescript
// apps/demo/material/src/app/app.routes.ts
export const appRoutes: Route[] = [
  {
    path: 'examples',
    children: [
      // Add individual example routes
      { path: 'button', loadComponent: ... },
      { path: 'input', loadComponent: ... },
    ]
  }
];
```

## Phase 2: Create PrimeNG Demo App

### 2.1 Generate PrimeNG App

```bash
nx g @nx/angular:application primeng \
  --directory=apps/demo/primeng \
  --style=scss \
  --routing=true \
  --prefix=demo \
  --e2eTestRunner=playwright \
  --tags=demo,e2e
```

### 2.2 Configure PrimeNG App

- Add `dynamic-form` and `dynamic-form-primeng` dependencies
- Configure `providePrimeNG()` in app.config.ts
- Add PrimeNG styles to styles.scss
- Set up routing for examples

### 2.3 Port PrimeNG Examples

- Move/copy PrimeNG examples from docs to demo app
- Set up example routes
- Test examples work in isolation

## Phase 3: Create Ionic Demo App

### 3.1 Generate Ionic App

```bash
nx g @nx/angular:application ionic \
  --directory=apps/demo/ionic \
  --style=scss \
  --routing=true \
  --prefix=demo \
  --e2eTestRunner=playwright \
  --tags=demo,e2e
```

### 3.2 Configure Ionic App

- Add `dynamic-form` and `dynamic-form-ionic` dependencies
- Configure `provideIonicAngular()` in app.config.ts
- Add Ionic styles to styles.scss
- Set up routing for examples

### 3.3 Port Ionic Examples

- Move/copy Ionic examples from docs to demo app
- Set up example routes
- Test examples work in isolation

## Phase 4: Clean Up Docs App

### 4.1 Remove Conflicting Providers

```typescript
// apps/docs/src/app/app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(appRoutes, withInMemoryScrolling(...)),
    provideHttpClient(),
    provideAnimationsAsync(), // Keep only if docs UI needs it
    provideNgDocContext(),
    provideNgDocApp({ ... }),
    provideSearchEngine(NgDocDefaultSearchEngine),
    providePageSkeleton(NG_DOC_DEFAULT_PAGE_SKELETON),
    provideMainPageProcessor(NG_DOC_DEFAULT_PAGE_PROCESSORS),
    // ❌ REMOVE providePrimeNG()
    // ❌ REMOVE provideIonicAngular()
  ],
};
```

### 4.2 Remove Conflicting Styles

```scss
// apps/docs/src/styles.scss
@use '@ng-doc/app/styles/global';
@use '@ng-doc/app/styles/themes/dark.css';

// Keep Material only if docs UI needs it
@import '@angular/material/prebuilt-themes/indigo-pink.css';

// ❌ REMOVE PrimeNG imports
// ❌ REMOVE Ionic imports
```

### 4.3 Update Dependencies

Remove from `apps/docs/project.json`:

- Implicit dependency on `dynamic-form-primeng`
- Implicit dependency on `dynamic-form-ionic`

Keep only:

- `dynamic-form` (for documentation)
- `dynamic-form-material` (if docs UI uses it)

## Phase 5: Create Demo Integration Components

### 5.1 Create Environment Token

```typescript
// apps/docs/src/app/config/environment.ts
export interface Environment {
  production: boolean;
  demoBaseUrls: {
    material: string;
    primeng: string;
    ionic: string;
  };
}

export const ENVIRONMENT = new InjectionToken<Environment>('ENVIRONMENT');

export const environment: Environment = {
  production: false,
  demoBaseUrls: {
    material: 'http://localhost:4201',
    primeng: 'http://localhost:4202',
    ionic: 'http://localhost:4203',
  },
};

export const environmentProd: Environment = {
  production: true,
  demoBaseUrls: {
    material: 'https://ng-forge.github.io/ng-forge/demos/material',
    primeng: 'https://ng-forge.github.io/ng-forge/demos/primeng',
    ionic: 'https://ng-forge.github.io/ng-forge/demos/ionic',
  },
};
```

### 5.2 Create Demo IFrame Component

```typescript
// apps/docs/src/app/components/demo-iframe/demo-iframe.component.ts
import { Component, computed, inject, input, ChangeDetectionStrategy } from '@angular/core';
import { ENVIRONMENT } from '../../config/environment';

@Component({
  selector: 'demo-iframe',
  template: `
    <div class="demo-container">
      @if (loading()) {
      <div class="demo-loading">Loading demo...</div>
      }
      <iframe [src]="iframeSrc()" [style.height]="height()" [style.width]="width()" (load)="onLoad()" frameborder="0"> </iframe>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        margin: 1rem 0;
      }
      .demo-container {
        position: relative;
        border: 1px solid var(--ng-doc-border-color);
        border-radius: 4px;
        overflow: hidden;
      }
      iframe {
        display: block;
        width: 100%;
        border: none;
      }
      .demo-loading {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: var(--ng-doc-text-muted);
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DemoIframeComponent {
  library = input.required<'material' | 'primeng' | 'ionic'>();
  example = input.required<string>();
  height = input<string>('400px');
  width = input<string>('100%');

  private env = inject(ENVIRONMENT);
  loading = signal(true);

  iframeSrc = computed(() => {
    const baseUrl = this.env.demoBaseUrls[this.library()];
    return `${baseUrl}/examples/${this.example()}`;
  });

  onLoad(): void {
    this.loading.set(false);
  }
}
```

### 5.3 Provide Environment in Docs App

```typescript
// apps/docs/src/app/app.config.ts
import { environment } from './config/environment';
import { ENVIRONMENT } from './config/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: ENVIRONMENT, useValue: environment },
    // ... other providers
  ],
};
```

## Phase 6: Update Documentation Pages

### 6.1 Update ng-doc Pages to Use IFrames

Example for Material button docs:

```html
<!-- apps/docs/src/docs/material/button/ng-doc.page.md -->
# Button ## Basic Usage

<demo-iframe library="material" example="button-basic" height="300px" />

## Variants

<demo-iframe library="material" example="button-variants" height="400px" />
```

### 6.2 Create Example Components in Demo Apps

```typescript
// apps/demo/material/src/app/examples/button-basic/button-basic.component.ts
@Component({
  selector: 'demo-button-basic',
  template: `
    <div style="padding: 2rem;">
      <h2>Basic Button Example</h2>
      <dynamic-form [config]="formConfig" />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DynamicFormComponent],
})
export class ButtonBasicComponent {
  formConfig = computed(() => ({
    fields: [
      matButton({ text: 'Click me' }),
      // ... more fields
    ],
  }));
}
```

## Phase 7: Update Build & Deployment

**See [e2e-and-deployment.md](./e2e-and-deployment.md) for complete details.**

### 7.1 Create Deployment Preparation Script

```bash
# Create scripts/prepare-deploy.js
# This script copies all built apps into dist/deploy with correct structure
```

### 7.2 Update Build Scripts

```json
// package.json
{
  "scripts": {
    "build:docs:prod": "nx run-many -t build --projects=docs,material,primeng,ionic --configuration=production",
    "prepare:deploy": "node scripts/prepare-deploy.js",
    "serve:all:dev": "nx run-many -t serve --projects=docs,material,primeng,ionic --parallel=4"
  }
}
```

### 7.3 Update Base HREFs

Configure base hrefs in each project.json for production builds.

### 7.4 Update GitHub Actions Workflow

Update `.github/workflows/deploy.yml` to:

1. Build all libraries
2. Build all apps
3. Run prepare:deploy script
4. Deploy dist/deploy to GitHub Pages

## Phase 8: Testing & Verification

**See [e2e-and-deployment.md](./e2e-and-deployment.md) for E2E testing strategy.**

### 8.1 Manual Testing Checklist

- [ ] Docs app runs without errors (no provider conflicts)
- [ ] Each demo app runs independently
- [ ] IFrames load correctly in docs
- [ ] No CSS conflicts in docs
- [ ] No scrolling issues in docs
- [ ] Examples work correctly in demo apps

### 8.2 E2E Tests (Scoped Per Demo App)

Each demo app has its own isolated e2e tests:

```bash
# Run Material e2e tests (12 existing test files)
nx e2e material

# Run PrimeNG e2e tests (create based on Material structure)
nx e2e primeng

# Run Ionic e2e tests (create based on Material structure)
nx e2e ionic

# Run all demo e2e tests in parallel
nx run-many -t e2e --projects=material,primeng,ionic
```

Benefits:

- ✅ Complete isolation - no cross-library interference
- ✅ Faster execution - can run in parallel
- ✅ Clearer ownership - each library's tests are self-contained
- ✅ Better CI matrix - can distribute across jobs

### 8.3 Production Build Test

```bash
# Build everything
pnpm build:docs:prod

# Verify output structure
ls -R dist/apps/docs/browser
ls -R dist/apps/demo/material/browser
ls -R dist/apps/demo/primeng/browser
ls -R dist/apps/demo/ionic/browser

# Test locally with serve-static
nx serve-static docs
nx serve-static material --port 4201
nx serve-static primeng --port 4202
nx serve-static ionic --port 4203
```

## Rollout Strategy

### Option A: Big Bang (All at once)

1. Create all demo apps
2. Clean docs app
3. Update all documentation
4. Deploy together

**Pros:** Clean cut, no intermediate state
**Cons:** Higher risk, harder to debug

### Option B: Incremental (Recommended)

1. **Phase 1:** Fix immediate scrolling issue (temp fix)
2. **Phase 2:** Create PrimeNG demo, remove PrimeNG from docs
3. **Phase 3:** Create Ionic demo, remove Ionic from docs
4. **Phase 4:** Refactor Material demo if needed
5. **Phase 5:** Update all documentation pages

**Pros:** Lower risk, easier to test, can deploy incrementally
**Cons:** Intermediate state with mixed approaches

## Estimated Effort

- Phase 1: 1 hour (verify existing structure)
- Phase 2: 4-6 hours (create PrimeNG demo)
- Phase 3: 4-6 hours (create Ionic demo)
- Phase 4: 2-3 hours (clean up docs app)
- Phase 5: 3-4 hours (create integration components)
- Phase 6: 4-6 hours (update documentation pages)
- Phase 7: 2-3 hours (build & deployment)
- Phase 8: 3-4 hours (testing)

**Total:** ~25-35 hours

## Quick Fix (Immediate)

To fix scrolling NOW while planning the full solution:

```scss
// apps/docs/src/styles.scss - Add at the end
/* Temporary fix: Override Ionic's aggressive resets */
body {
  overflow: auto !important;
  position: static !important;
  height: auto !important;
}

html {
  overflow: auto !important;
}

.ng-doc-root,
.ng-doc-content {
  overflow: visible !important;
  height: auto !important;
}
```

This gives you breathing room to implement the proper solution.
