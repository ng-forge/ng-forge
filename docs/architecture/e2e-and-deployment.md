# E2E Testing & GitHub Pages Deployment Strategy

## E2E Testing Architecture

### Current Setup (Material Demo)

The `apps/demo/material` app already has **12 comprehensive e2e test files**:

- conditional-fields-test.spec.ts
- age-based-logic-test.spec.ts
- essential-tests.spec.ts
- scenario-list.spec.ts
- demo-scenarios-test.spec.ts
- error-handling.spec.ts
- form-orchestration.spec.ts
- navigation-edge-cases.spec.ts
- comprehensive-field-tests.spec.ts
- cross-page-validation.spec.ts
- cross-field-validation.spec.ts
- user-journey-flows.spec.ts
- multi-page-navigation.spec.ts

**Key insight:** E2E tests already run against the demo app directly, NOT the docs app.

### Proposed E2E Structure

```
apps/
├── demo/
│   ├── material/
│   │   ├── src/              # Material demo app
│   │   └── e2e/              # ✅ Material-specific e2e tests (already exist)
│   │       ├── playwright.config.ts
│   │       └── src/          # 12 comprehensive test files
│   │
│   ├── primeng/
│   │   ├── src/              # PrimeNG demo app
│   │   └── e2e/              # 🆕 PrimeNG-specific e2e tests
│   │       ├── playwright.config.ts
│   │       └── src/          # Tests for PrimeNG components
│   │
│   └── ionic/
│       ├── src/              # Ionic demo app
│       └── e2e/              # 🆕 Ionic-specific e2e tests
│           ├── playwright.config.ts
│           └── src/          # Tests for Ionic components
```

### Benefits of Scoped E2E Tests

1. **Complete Isolation**: Each demo app tests only its UI library

   - Material tests run against Material components
   - PrimeNG tests run against PrimeNG components
   - Ionic tests run against Ionic components
   - No cross-contamination or flaky tests from other libraries

2. **Independent Execution**:

   ```bash
   # Run only Material tests
   nx e2e material

   # Run only PrimeNG tests
   nx e2e primeng

   # Run only Ionic tests
   nx e2e ionic

   # Run all demo e2e tests
   nx run-many -t e2e --projects=material,primeng,ionic
   ```

3. **Faster CI**: Can run tests in parallel across different jobs

   ```yaml
   # .github/workflows/ci.yml
   strategy:
     matrix:
       demo: [material, primeng, ionic]
   steps:
     - run: nx e2e ${{ matrix.demo }}
   ```

4. **Clearer Test Ownership**: Each library's tests are self-contained
   - Material team maintains Material e2e tests
   - PrimeNG tests focus on PrimeNG-specific behavior
   - No need to worry about other UI libraries breaking tests

### E2E Test Configuration

Each demo app's Playwright config targets its own port:

```typescript
// apps/demo/material/e2e/playwright.config.ts
export default defineConfig({
  use: {
    baseURL: process.env['BASE_URL'] || 'http://localhost:4201',
  },
  webServer: {
    command: 'pnpm exec nx run material:serve --port 4201',
    url: 'http://localhost:4201',
    reuseExistingServer: true,
  },
});

// apps/demo/primeng/e2e/playwright.config.ts
export default defineConfig({
  use: {
    baseURL: process.env['BASE_URL'] || 'http://localhost:4202',
  },
  webServer: {
    command: 'pnpm exec nx run primeng:serve --port 4202',
    url: 'http://localhost:4202',
    reuseExistingServer: true,
  },
});

// apps/demo/ionic/e2e/playwright.config.ts
export default defineConfig({
  use: {
    baseURL: process.env['BASE_URL'] || 'http://localhost:4203',
  },
  webServer: {
    command: 'pnpm exec nx run ionic:serve --port 4203',
    url: 'http://localhost:4203',
    reuseExistingServer: true,
  },
});
```

---

## GitHub Pages Deployment Strategy

### Challenge

GitHub Pages deploys from a single directory, but we need to serve:

- Main docs at `/ng-forge/`
- Material demos at `/ng-forge/demos/material/`
- PrimeNG demos at `/ng-forge/demos/primeng/`
- Ionic demos at `/ng-forge/demos/ionic/`

### Solution: Combined Build Directory

Create a unified deployment structure by copying all built apps into a single directory:

```
dist/
├── apps/
│   ├── docs/browser/           # Built docs app
│   └── demo/
│       ├── material/browser/   # Built Material demo
│       ├── primeng/browser/    # Built PrimeNG demo
│       └── ionic/browser/      # Built Ionic demo
│
└── deploy/                     # 🆕 Combined deployment directory
    ├── index.html              # From docs/browser
    ├── assets/                 # From docs/browser
    ├── ...                     # All docs files
    └── demos/                  # 🆕 Subdirectory for demo apps
        ├── material/           # Copied from demo/material/browser
        │   ├── index.html
        │   └── ...
        ├── primeng/            # Copied from demo/primeng/browser
        │   ├── index.html
        │   └── ...
        └── ionic/              # Copied from demo/ionic/browser
            ├── index.html
            └── ...
```

### Updated Build Configuration

#### 1. Configure Base HREFs

```json
// apps/docs/project.json
{
  "targets": {
    "build": {
      "configurations": {
        "production": {
          "baseHref": "/ng-forge/",
          "outputPath": "dist/apps/docs"
        }
      }
    }
  }
}

// apps/demo/material/project.json
{
  "targets": {
    "build": {
      "configurations": {
        "production": {
          "baseHref": "/ng-forge/demos/material/",
          "outputPath": "dist/apps/demo/material"
        }
      }
    }
  }
}

// apps/demo/primeng/project.json
{
  "targets": {
    "build": {
      "configurations": {
        "production": {
          "baseHref": "/ng-forge/demos/primeng/",
          "outputPath": "dist/apps/demo/primeng"
        }
      }
    }
  }
}

// apps/demo/ionic/project.json
{
  "targets": {
    "build": {
      "configurations": {
        "production": {
          "baseHref": "/ng-forge/demos/ionic/",
          "outputPath": "dist/apps/demo/ionic"
        }
      }
    }
  }
}
```

#### 2. Create Deployment Preparation Script

```json
// package.json
{
  "scripts": {
    "build:docs:prod": "nx run-many -t build --projects=docs,material,primeng,ionic --configuration=production",
    "prepare:deploy": "node scripts/prepare-deploy.js"
  }
}
```

```javascript
// scripts/prepare-deploy.js
import { cpSync, mkdirSync, rmSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

const deployDir = join(rootDir, 'dist', 'deploy');

console.log('🧹 Cleaning deploy directory...');
rmSync(deployDir, { recursive: true, force: true });

console.log('📁 Creating deploy directory structure...');
mkdirSync(deployDir, { recursive: true });

console.log('📄 Copying docs app...');
cpSync(join(rootDir, 'dist', 'apps', 'docs', 'browser'), deployDir, { recursive: true });

console.log('📦 Creating demos directory...');
const demosDir = join(deployDir, 'demos');
mkdirSync(demosDir, { recursive: true });

console.log('📦 Copying Material demo...');
cpSync(join(rootDir, 'dist', 'apps', 'demo', 'material', 'browser'), join(demosDir, 'material'), { recursive: true });

console.log('📦 Copying PrimeNG demo...');
cpSync(join(rootDir, 'dist', 'apps', 'demo', 'primeng', 'browser'), join(demosDir, 'primeng'), { recursive: true });

console.log('📦 Copying Ionic demo...');
cpSync(join(rootDir, 'dist', 'apps', 'demo', 'ionic', 'browser'), join(demosDir, 'ionic'), { recursive: true });

console.log('✅ Deployment directory prepared at dist/deploy');
console.log('\nDeployment structure:');
console.log('  /ng-forge/                    -> Main docs');
console.log('  /ng-forge/demos/material/     -> Material demos');
console.log('  /ng-forge/demos/primeng/      -> PrimeNG demos');
console.log('  /ng-forge/demos/ionic/        -> Ionic demos');
```

#### 3. Update GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  workflow_dispatch:
    inputs:
      version:
        description: 'Release version (e.g., 1.0.0, patch, minor, major)'
        required: false
        default: ''
        type: string

permissions:
  contents: write
  pages: write
  id-token: write

concurrency:
  group: 'pages'
  cancel-in-progress: false

jobs:
  check-ci:
    name: Check CI Status
    runs-on: ubuntu-latest
    outputs:
      ci-success: ${{ steps.check.outputs.success }}
    steps:
      - name: Check latest CI run
        id: check
        uses: actions/github-script@v7
        with:
          script: |
            const { data: runs } = await github.rest.actions.listWorkflowRuns({
              owner: context.repo.owner,
              repo: context.repo.repo,
              workflow_id: 'ci.yml',
              branch: 'main',
              status: 'completed',
              per_page: 1
            });

            if (runs.total_count === 0) {
              core.setFailed('No CI runs found');
              return;
            }

            const latestRun = runs.workflow_runs[0];
            console.log(`Latest CI run: ${latestRun.conclusion} (${latestRun.html_url})`);

            if (latestRun.conclusion === 'success') {
              core.setOutput('success', 'true');
            } else {
              core.setFailed(`Latest CI run failed: ${latestRun.html_url}`);
            }

  build-and-deploy:
    name: Build and Deploy
    runs-on: ubuntu-latest
    needs: check-ci
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}

    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Install pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 8.15.1

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Version bump (if specified)
        if: ${{ github.event.inputs.version != '' }}
        run: |
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          pnpm run release:version ${{ github.event.inputs.version }}
          git push --follow-tags
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      - name: Build libraries
        run: pnpm nx run-many -t build -p dynamic-form,dynamic-form-material,dynamic-form-primeng,dynamic-form-ionic

      - name: Build all apps
        run: pnpm run build:docs:prod

      - name: Prepare deployment directory
        run: pnpm run prepare:deploy

      - name: Verify deployment structure
        run: |
          echo "📂 Deployment directory structure:"
          ls -la dist/deploy/
          echo ""
          echo "📂 Demos directory:"
          ls -la dist/deploy/demos/
          echo ""
          echo "📂 Material demo:"
          ls -la dist/deploy/demos/material/ | head -n 10
          echo ""
          echo "📂 PrimeNG demo:"
          ls -la dist/deploy/demos/primeng/ | head -n 10
          echo ""
          echo "📂 Ionic demo:"
          ls -la dist/deploy/demos/ionic/ | head -n 10

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: dist/deploy

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### Environment Configuration for IFrame URLs

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

// apps/docs/src/app/config/environment.development.ts
export const environment: Environment = {
  production: false,
  demoBaseUrls: {
    material: 'http://localhost:4201',
    primeng: 'http://localhost:4202',
    ionic: 'http://localhost:4203',
  },
};

// apps/docs/src/app/config/environment.production.ts
export const environment: Environment = {
  production: true,
  demoBaseUrls: {
    // Same domain, different paths - no CORS issues!
    material: '/ng-forge/demos/material',
    primeng: '/ng-forge/demos/primeng',
    ionic: '/ng-forge/demos/ionic',
  },
};
```

```typescript
// apps/docs/src/app/app.config.ts
import { environment } from './config/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    {
      provide: ENVIRONMENT,
      useFactory: () => {
        // Use production config if building for production
        if (typeof window !== 'undefined' && window.location.hostname === 'ng-forge.github.io') {
          return import('./config/environment.production').then((m) => m.environment);
        }
        return environment;
      },
    },
    // ... other providers
  ],
};
```

### Testing Deployment Locally

```bash
# Build everything for production
pnpm run build:docs:prod

# Prepare deployment directory
pnpm run prepare:deploy

# Serve locally to test
npx http-server dist/deploy -p 8080 --proxy http://localhost:8080?

# Open browser to:
# http://localhost:8080/ng-forge/
# http://localhost:8080/ng-forge/demos/material/
# http://localhost:8080/ng-forge/demos/primeng/
# http://localhost:8080/ng-forge/demos/ionic/
```

### Benefits of This Approach

1. ✅ **Single Deployment**: One GitHub Pages deployment contains everything
2. ✅ **No CORS Issues**: Everything served from same domain
3. ✅ **Correct Routing**: Base hrefs ensure assets load properly
4. ✅ **Simple CI/CD**: One workflow builds and deploys all apps
5. ✅ **Easy to Test**: Can test entire deployment structure locally

### Potential Issues & Solutions

#### Issue 1: Routing in Demo Apps

**Problem**: Angular apps with routing might not work correctly in subdirectories

**Solution**: Use hash-based routing for demo apps

```typescript
// apps/demo/*/src/app/app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(appRoutes, withHashLocation()),
    // ...
  ],
};
```

This makes demo URLs work like:

- `/ng-forge/demos/material/#/examples/button`
- `/ng-forge/demos/primeng/#/examples/input`

#### Issue 2: Large Bundle Size

**Problem**: Deploying all demo apps increases overall size

**Solution**:

1. Demo apps are only loaded when accessed (not in main docs bundle)
2. Consider lazy-loading strategies within demo apps
3. Use code splitting in demo apps
4. Not a real issue - users only download what they view

#### Issue 3: Build Time

**Problem**: Building 4 apps takes longer

**Solution**:

1. Use Nx caching (already configured)
2. Only rebuild changed apps in CI
3. Parallel builds: `nx run-many -t build --parallel=4`

---

## Summary

### E2E Testing

- ✅ Demo apps remain dedicated e2e test targets
- ✅ Each demo has isolated, scoped tests
- ✅ Tests run independently without interference
- ✅ Can run in parallel for faster CI

### GitHub Pages Deployment

- ✅ All apps deployed under single domain
- ✅ No CORS issues with iframes
- ✅ Proper base hrefs and routing
- ✅ Simple build and deploy process
- ✅ Can test locally before deploying

### Next Steps

1. Create PrimeNG and Ionic demo apps
2. Add prepare-deploy script
3. Update GitHub Actions workflow
4. Test deployment locally
5. Deploy to production
