# Demo Apps Isolation Architecture

## Problem Statement

The documentation app (`apps/docs`) currently imports and initializes all UI libraries (Material, PrimeNG, Ionic) simultaneously. This causes:

1. **Provider Conflicts**: Environment providers (`provideIonicAngular`, `providePrimeNG`, `provideAnimationsAsync`) must be registered at app bootstrap and cannot be scoped to components
2. **CSS Conflicts**: Global styles from all three frameworks conflict (e.g., Ionic's normalize.css breaks scrolling)
3. **Runtime Conflicts**: All three frameworks actively manipulate the DOM, handle events, etc.
4. **Bundle Bloat**: All UI libraries loaded even when viewing docs for a single library

## Proposed Solution: Isolated Demo Apps

### Architecture Overview

```
ng-forge/
├── apps/
│   ├── docs/                    # Pure documentation (ng-doc)
│   │   ├── src/
│   │   │   ├── docs/           # Markdown documentation
│   │   │   └── app/            # Minimal app, NO UI library providers
│   │   └── project.json
│   │
│   └── demo/                    # Demo applications (one per UI library)
│       ├── material/           # ✅ Already exists
│       │   ├── src/
│       │   ├── project.json
│       │   └── e2e/
│       │
│       ├── primeng/            # 🆕 To create
│       │   ├── src/
│       │   ├── project.json
│       │   └── e2e/
│       │
│       └── ionic/              # 🆕 To create
│           ├── src/
│           ├── project.json
│           └── e2e/
```

### Benefits

1. ✅ **Complete Isolation**: Each demo app has ONLY its UI library providers
2. ✅ **No CSS Conflicts**: Styles never mix
3. ✅ **No Runtime Conflicts**: Frameworks don't compete
4. ✅ **Smaller Bundles**: Docs app is lightweight, demo apps loaded on-demand
5. ✅ **Independent Testing**: Each demo has its own e2e tests
6. ✅ **No Builder Changes**: Works with ng-doc's custom builder
7. ✅ **Better DX**: Develop/test each UI library independently

### Documentation Integration

#### Approach 1: IFrame Embedding (Recommended)

**In ng-doc markdown:**

```html
<!-- apps/docs/src/docs/material/button/ng-doc.page.ts -->
<iframe
  src="http://localhost:4201/examples/button"
  width="100%"
  height="400px"
  frameborder="0"
  style="border: 1px solid #ccc; border-radius: 4px;"
>
</iframe>
```

**Pros:**

- Complete isolation
- Works in dev and production
- Simple to implement

**Cons:**

- Requires iframe (some prefer native embedding)
- Need to manage URLs (dev vs prod)

#### Approach 2: ng-doc Demo Component with IFrame Wrapper

Create a reusable component for the docs app:

```typescript
// apps/docs/src/app/components/demo-iframe.component.ts
@Component({
  selector: 'demo-iframe',
  template: ` <iframe [src]="iframeSrc()" [style.height]="height()" [style.width]="width()"> </iframe> `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DemoIframeComponent {
  library = input.required<'material' | 'primeng' | 'ionic'>();
  example = input.required<string>();
  height = input<string>('400px');
  width = input<string>('100%');

  private env = inject(ENVIRONMENT);

  iframeSrc = computed(() => {
    const baseUrl = this.env.production
      ? `https://ng-forge.github.io/demos/${this.library()}`
      : `http://localhost:${this.getPort(this.library())}`;
    return `${baseUrl}/examples/${this.example()}`;
  });

  private getPort(lib: string): number {
    return { material: 4201, primeng: 4202, ionic: 4203 }[lib];
  }
}
```

**Usage in ng-doc:**

```html
<demo-iframe library="material" example="button" height="500px" />
```

### Demo App Structure

Each demo app follows this pattern:

```typescript
// apps/demo/{library}/src/app/app.routes.ts
export const appRoutes: Route[] = [
  {
    path: 'examples',
    children: [
      {
        path: 'button',
        loadComponent: () => import('./examples/button/button.example'),
      },
      {
        path: 'input',
        loadComponent: () => import('./examples/input/input.example'),
      },
      // ... more examples
    ],
  },
  {
    path: '',
    redirectTo: 'examples',
    pathMatch: 'full',
  },
];
```

```typescript
// apps/demo/{library}/src/app/app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(appRoutes),
    provideHttpClient(),
    // ONLY this library's providers
    provideAnimationsAsync(), // for Material only
    // OR
    providePrimeNG({ ... }),  // for PrimeNG only
    // OR
    provideIonicAngular({ ... }), // for Ionic only
  ],
};
```

### Development Workflow

```bash
# Terminal 1: Run docs
nx serve docs

# Terminal 2: Run material demo
nx serve material --port 4201

# Terminal 3: Run primeng demo (when created)
nx serve primeng --port 4202

# Terminal 4: Run ionic demo (when created)
nx serve ionic --port 4203
```

### Production Build

```bash
# Build all apps
nx run-many -t build --projects=docs,material,primeng,ionic

# Deploy structure:
dist/
├── apps/docs/browser/          # Main docs site
└── apps/demo/
    ├── material/browser/       # Material demos
    ├── primeng/browser/        # PrimeNG demos
    └── ionic/browser/          # Ionic demos
```

**GitHub Pages deployment:**

```
https://ng-forge.github.io/ng-forge/         # Docs
https://ng-forge.github.io/ng-forge/demos/material/  # Material demos
https://ng-forge.github.io/ng-forge/demos/primeng/   # PrimeNG demos
https://ng-forge.github.io/ng-forge/demos/ionic/     # Ionic demos
```

### Implementation Steps

1. ✅ Material demo app already exists
2. 🆕 Create PrimeNG demo app (mirror material structure)
3. 🆕 Create Ionic demo app (mirror material structure)
4. 🔧 Clean up docs app:
   - Remove `providePrimeNG()` from app.config.ts
   - Remove `provideIonicAngular()` from app.config.ts
   - Remove Ionic CSS imports from styles.scss
   - Keep only ng-doc and minimal Material for docs UI (if needed)
5. 🔧 Create demo iframe component for docs app
6. 📝 Update ng-doc pages to use iframe embedding
7. 🧪 Update e2e tests for each demo app
8. 📦 Update build/deploy scripts

### Alternative Considered: Module Federation

**Why not Module Federation?**

- Requires custom webpack config
- ng-doc uses `@ng-doc/builder` which wraps Angular's builder
- Can't easily inject custom webpack config
- Much more complex setup
- Over-engineering for this use case

### Alternative Considered: Monolithic with CSS Layers

**Why not CSS Layers?**

- Doesn't solve provider conflicts
- All frameworks still initialize globally
- Runtime conflicts still occur
- Larger bundle size

## Conclusion

Separate demo apps with iframe embedding is the most pragmatic solution that:

- Solves provider conflicts completely
- Requires no builder changes
- Keeps the codebase maintainable
- Aligns with existing project structure
- Provides excellent DX for development and testing
