# ng-forge Form Builder - Consolidated Plan

## Context

Building an enterprise-focused form builder platform powered by ng-forge. The primary revenue stream is enterprise self-hosted licensing (€8-20k/year). A consumer SaaS tier exists as a product showcase and secondary income.

**Key Decision:** Enterprise-first architecture. This rules out Amplify/serverless in favor of portable, self-hostable containers.

---

## Architecture Decisions (Locked)

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Backend | Elysia on Node.js | Best DX, production-proven, switchable to Bun later |
| Database | PostgreSQL + JSONB | Portable, self-hostable, relational + flexible schemas |
| Auth | Custom (node-saml + openid-client) | Per-tenant SSO, no vendor lock-in |
| Real-time | Yjs (CRDT) + Valkey | Conflict-free collaboration, battle-tested |
| AI | BYOK (Vercel AI SDK) | Enterprise controls their keys/data |
| Deploy | Docker Compose | Single-file deploy, parity hosted/self-hosted |
| Frontend | Angular + ng-forge | Dogfooding the library |

---

## Repository Structure

### ng-forge (public) - Vercel
```
ng-forge/
├── packages/
│   ├── dynamic-forms/
│   ├── dynamic-forms-material/
│   ├── dynamic-forms-bootstrap/
│   ├── dynamic-forms-primeng/
│   ├── dynamic-forms-ionic/
│   └── dynamic-form-mcp/
├── apps/
│   ├── docs/                    # ng-doc + landing page
│   └── examples/
└── guides/
```

### ng-forge-builder (private)
```
ng-forge-builder/
├── apps/
│   ├── api/                     # Elysia backend
│   │   └── src/
│   │       ├── plugins/         # tenant, auth, rate-limit
│   │       └── modules/
│   │           ├── auth/
│   │           ├── forms/
│   │           ├── collaboration/
│   │           ├── ai/
│   │           └── admin/
│   ├── web/                     # Angular builder UI
│   └── preview/                 # Single preview shell (route-per-integration)
│       └── src/
│           ├── integrations/    # Lazy-loaded: material/, bootstrap/, primeng/, ionic/
│           └── shared/          # StyleLoader, ThemeManager, PreviewBridge
├── packages/
│   ├── db/                      # Drizzle schema + migrations
│   ├── types/                   # Shared types (FormSchema, etc.)
│   └── integrations/            # Integration interfaces
├── docker-compose.yml           # Enterprise self-hosted
├── docker-compose.dev.yml
└── docker-compose.prod.yml
```

---

## Database Schema

```sql
-- Multi-tenancy
tenants (id, domain, custom_domain, name, plan, created_at)
users (id, tenant_id, email, password_hash, role, created_at)
sso_configs (id, tenant_id, protocol, config JSONB, enabled)

-- Core product
forms (id, tenant_id, name, created_by, created_at)
form_versions (id, form_id, tenant_id, version_number, schema JSONB, label, created_by, created_at)

-- Enterprise
custom_components (id, tenant_id, manifest JSONB, enabled)
```

---

## Pricing Tiers

| Tier | Price | Target | Features |
|------|-------|--------|----------|
| **Free** | €0 | Anyone | Builder, all previews, import/export (JSON, OpenAPI), conditional logic, multi-step wizard |
| **Pro** | €12/month | Solo devs | Cloud saves, AI (100 req/mo + BYOK), GitHub sync, code preview |
| **Team** | €8/user/month | Small teams | Everything in Pro + collaboration + orgs, shared AI quota |
| **Enterprise SaaS** | Contact sales | Larger orgs | Team + SSO + custom domain + dedicated tenant + SLA |
| **Enterprise Self-Hosted** | €10-20k/year | Regulated/large | Source code, BYOK only, support hours included |

### AI Cost Model

| Tier | AI Access |
|------|-----------|
| Pro | 100 requests/month included, optional BYOK for unlimited |
| Team | 200 requests/org/month included, optional BYOK for unlimited |
| Enterprise SaaS | 500 requests/org/month included, optional BYOK |
| Enterprise Self-Hosted | BYOK only (they control their keys/data) |

Quota exceeded → prompt user to add their own API key for unlimited usage.

---

## Infrastructure Progression

| Phase | Infra | Monthly Cost |
|-------|-------|--------------|
| Phase 1-3 | Railway or cheap VPS | ~€20-30 |
| Phase 4+ | EC2 + RDS + ElastiCache | ~€70-100 |
| Scale | ECS Fargate + RDS | ~€150-300 |

Same Docker Compose file works everywhere - only the underlying infra scales.

---

## Phased Delivery

### Phase 1: Foundation (Weeks 1-3)
- [ ] Monorepo setup with Nx
- [ ] Drizzle schema + migrations
- [ ] Elysia API skeleton with tenant middleware
- [ ] Basic auth (email/password)
- [ ] Multi-tenancy resolution from host header
- [ ] Angular builder app shell
- [ ] Docker Compose for local dev

### Phase 2: Core Builder (Weeks 4-7)
- [ ] Form builder UI (field palette, canvas, property panel)
- [ ] Form save/load API
- [ ] Version history (append-only form_versions)
- [ ] JSON import/export
- [ ] OpenAPI import
- [ ] Preview apps (Material first, then others)
- [ ] postMessage bridge for preview communication

### Phase 3: Pro Features (Weeks 8-11)
- [ ] Real-time collaboration (Yjs + Valkey)
- [ ] AI chat (BYOK via Vercel AI SDK)
- [ ] Plan gating middleware
- [ ] Stripe integration
- [ ] GitHub sync

### Phase 4: Enterprise (Weeks 12-16)
- [ ] SSO (SAML + OIDC) per tenant
- [ ] Custom component registration
- [ ] License key validation
- [ ] Audit trail
- [ ] Enterprise Docker packaging
- [ ] Admin panel for tenant management

### Phase 5: Scale (Ongoing)
- [ ] ECS migration
- [ ] AWS Marketplace listing
- [ ] Helm chart for K8s customers
- [ ] Read replicas

---

## Key Contracts

### FormSchema (immutable contract)
```typescript
interface FormSchema {
  version: string              // schema format version
  fields: FieldSchema[]
  layout?: LayoutConfig
  integrations?: IntegrationConfig[]
  meta?: Record<string, unknown>
}
```

### Multi-tenancy middleware
```typescript
app.derive(({ request }) => {
  const host = request.headers.get('host')
  const tenant = resolveTenant(host)
  return { tenant }
})
```

### Plan gating
```typescript
const requirePlan = (plan: 'pro' | 'team' | 'enterprise') =>
  ({ tenant, error }) => {
    if (!meetsPlan(tenant.plan, plan))
      return error(403, 'Upgrade required')
  }
```

---

## Enterprise Delivery Models

| Model | What they get | Support |
|-------|---------------|---------|
| **Enterprise SaaS** | Dedicated tenant on your infra, SSO config, custom domain | Email + SLA |
| **Enterprise Self-Hosted** | Source code + Docker Compose + docs | Support hours (e.g., 20hrs/year) |

Self-hosted is the primary enterprise focus. Source code delivery = simpler for you, full control for them.

---

## Complete Feature List

### Builder Core
- [ ] Field palette (drag-and-drop field types)
- [ ] Canvas (visual form layout)
- [ ] Property panel (field configuration)
- [ ] Conditional logic builder (visual expression editor)
- [ ] Multi-step wizard builder (page flow editor)
- [ ] Field validation configuration
- [ ] Field dependencies visualization
- [ ] Undo/redo
- [ ] Keyboard shortcuts
- [ ] Responsive preview (mobile/tablet/desktop)

### Import/Export
- [ ] JSON export (ng-forge config)
- [ ] JSON import
- [ ] OpenAPI import (generate form from spec)
- [ ] TypeScript export (typed config)
- [ ] Code preview panel (live code view)

### Preview System
- [ ] Live preview (real-time updates)
- [ ] Material integration
- [ ] Bootstrap integration
- [ ] PrimeNG integration
- [ ] Ionic integration
- [ ] Integration switcher (single shell, see architecture below)
- [ ] postMessage bridge (builder ↔ preview communication)

### Cloud Features (Pro+)
- [ ] User authentication
- [ ] Form save/load
- [ ] Form listing/dashboard
- [ ] Version history
- [ ] Form duplication
- [ ] Form sharing (view-only link)
- [ ] GitHub sync (push/pull configs)

### AI Features (Pro+)
- [ ] Generate form from natural language
- [ ] Field suggestions based on context
- [ ] Validation suggestions
- [ ] Chat-based editing ("add email field")
- [ ] Form review/improvements
- [ ] BYOK API key management
- [ ] Usage quota tracking

### Collaboration (Team+)
- [ ] Real-time co-editing (Yjs CRDT)
- [ ] Presence indicators (who's editing)
- [ ] Cursor positions
- [ ] Comments/annotations
- [ ] Change notifications

### Organizations (Team+)
- [ ] Create/manage organizations
- [ ] Invite members
- [ ] Role-based access (owner/admin/member)
- [ ] Org-level form library
- [ ] Transfer form ownership

### Enterprise SaaS
- [ ] SSO (SAML)
- [ ] SSO (OIDC)
- [ ] Custom subdomain (team.formbuilder.io)
- [ ] Custom domain (forms.acme.com)
- [ ] Dedicated tenant isolation
- [ ] Audit trail
- [ ] Admin panel

### Enterprise Self-Hosted
- [ ] Docker Compose packaging
- [ ] License key validation
- [ ] Offline grace period (7 days)
- [ ] Custom component registration
- [ ] Air-gap deployment support
- [ ] Helm chart (future)

### Admin/Operations
- [ ] Tenant management
- [ ] User management
- [ ] Usage analytics
- [ ] Billing/Stripe integration
- [ ] Plan management

---

## Single Preview Shell Architecture

### The Constraint

`provideDynamicForm()` returns `EnvironmentProviders` (via `makeEnvironmentProviders()`).
These providers are resolved at **bootstrap time** and cached in the root environment injector.
Even route-level providers won't help — components that already injected `FIELD_REGISTRY`
keep their reference to the old registry.

**The only way to swap integrations is to re-bootstrap the entire application.**

### Solution: Single App, Query-Param Bootstrap

One preview app. The **integration is selected at bootstrap time** via query parameter.
Switching integrations = **full iframe reload** with a different query param.

```
apps/
├── builder/                       # Main builder app (iframe embeds preview)
└── preview/                       # Single preview shell
    └── src/
        ├── main.ts                # Reads ?integration= and bootstraps accordingly
        ├── app/
        │   ├── app.component.ts   # Preview shell
        │   └── app.config.ts      # Base config (router, animations, etc.)
        ├── integrations/
        │   ├── material.providers.ts   # () => provideDynamicForm(...withMaterialFields())
        │   ├── bootstrap.providers.ts
        │   ├── primeng.providers.ts
        │   └── ionic.providers.ts
        ├── shared/
        │   ├── style-loader.service.ts      # Dynamic CSS injection
        │   ├── theme-manager.service.ts     # Customer theming engine
        │   └── preview-bridge.service.ts    # postMessage communication
        └── styles/
            └── preview-reset.css            # Minimal base styles only
```

### Bootstrap-Time Integration Selection

```typescript
// preview/src/main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

const integrationProviders = {
  material: () => import('./integrations/material.providers').then(m => m.materialProviders()),
  bootstrap: () => import('./integrations/bootstrap.providers').then(m => m.bootstrapProviders()),
  primeng: () => import('./integrations/primeng.providers').then(m => m.primengProviders()),
  ionic: () => import('./integrations/ionic.providers').then(m => m.ionicProviders()),
} as const;

type IntegrationId = keyof typeof integrationProviders;

async function bootstrap() {
  const params = new URLSearchParams(location.search);
  const integration = (params.get('integration') as IntegrationId) || 'material';

  // Dynamically import only the selected integration (code splitting)
  const integrationProvider = await integrationProviders[integration]();

  // Also load integration-specific styles
  await loadIntegrationStyles(integration);

  await bootstrapApplication(AppComponent, {
    providers: [
      ...appConfig.providers,
      integrationProvider,
    ],
  });
}

bootstrap();
```

```typescript
// preview/src/integrations/material.providers.ts
import { provideDynamicForm, withMaterialFields } from '@ng-forge/dynamic-forms-material';

export function materialProviders() {
  return provideDynamicForm(...withMaterialFields());
}
```

### Switching Integrations

When the builder wants to switch integrations, it **reloads the iframe** with a different URL:

```typescript
// builder/src/preview-manager.service.ts
switchIntegration(integration: IntegrationId) {
  const currentUrl = new URL(this.iframe.src);
  currentUrl.searchParams.set('integration', integration);

  // Full reload — triggers re-bootstrap with new providers
  this.iframe.src = currentUrl.toString();
}
```

**Trade-off:** Switching integrations is not instant (full page load). But:
- This is an infrequent operation (users don't constantly switch integrations)
- It's the only correct way given the `EnvironmentProviders` constraint
- Each integration bundle is code-split, so initial load is fast

### Alternative: Pre-loaded Hidden Iframes

For instant switching at the cost of memory, keep 4 iframes:

```typescript
// builder/src/preview-manager.service.ts
@Injectable({ providedIn: 'root' })
export class PreviewManagerService {
  private iframes = new Map<IntegrationId, HTMLIFrameElement>();
  private activeIntegration = signal<IntegrationId>('material');

  constructor() {
    // Pre-load all integrations
    for (const id of ['material', 'bootstrap', 'primeng', 'ionic'] as const) {
      const iframe = document.createElement('iframe');
      iframe.src = `/preview/?integration=${id}`;
      iframe.style.display = 'none';
      this.iframes.set(id, iframe);
    }
  }

  switchIntegration(integration: IntegrationId) {
    // Hide current, show new — instant switch
    this.iframes.get(this.activeIntegration())!.style.display = 'none';
    this.iframes.get(integration)!.style.display = 'block';
    this.activeIntegration.set(integration);
  }
}
```

**Recommendation:** Start with the reload approach (simpler). Add pre-loading as an optimization later if users complain about switch latency.

### Dynamic Style Loading

Same as before — load integration-specific CSS at bootstrap time:

```typescript
// preview/src/main.ts
async function loadIntegrationStyles(integration: IntegrationId) {
  const styleUrls: Record<IntegrationId, string[]> = {
    material: ['/assets/styles/material-indigo-pink.css'],
    bootstrap: ['https://cdn.jsdelivr.net/npm/bootstrap@5/dist/css/bootstrap.min.css'],
    primeng: ['/assets/styles/primeng-lara-light.css'],
    ionic: ['/assets/styles/ionic.bundle.css'],
  };

  await Promise.all(
    styleUrls[integration].map(url => loadStylesheet(url))
  );
}

function loadStylesheet(href: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.onload = () => resolve();
    link.onerror = () => reject(new Error(`Failed to load: ${href}`));
    document.head.appendChild(link);
  });
}
```

### Customer Theming (Extensible)

Same approach — CSS custom properties work regardless of when they're applied:

```typescript
// preview/src/shared/theme-manager.service.ts
@Injectable({ providedIn: 'root' })
export class ThemeManagerService {
  private themeStyleEl: HTMLStyleElement | null = null;

  applyTheme(theme: CustomerTheme): void {
    this.removeTheme();

    const vars = Object.entries(theme.variables)
      .map(([key, value]) => `${key}: ${value};`)
      .join('\n  ');

    const style = document.createElement('style');
    style.id = 'customer-theme';
    style.textContent = `:root {\n  ${vars}\n}`;

    if (theme.customCss) {
      style.textContent += `\n${theme.customCss}`;
    }

    document.head.appendChild(style);
    this.themeStyleEl = style;
  }

  removeTheme(): void {
    this.themeStyleEl?.remove();
    this.themeStyleEl = null;
  }
}

interface CustomerTheme {
  variables: Record<string, string>;
  customCss?: string;
}
```

### Builder ↔ Preview Communication (postMessage Bridge)

```typescript
// preview/src/shared/preview-bridge.service.ts
type BuilderMessage =
  | { type: 'CONFIG_UPDATE'; config: FormSchema }
  | { type: 'APPLY_THEME'; theme: CustomerTheme }
  | { type: 'SELECT_FIELD'; fieldKey: string }
  | { type: 'RESPONSIVE_MODE'; width: number; height: number };

// Note: SWITCH_INTEGRATION is NOT a postMessage — it's a full iframe reload

type PreviewMessage =
  | { type: 'FIELD_CLICKED'; fieldKey: string }
  | { type: 'FORM_VALUE_CHANGE'; value: Record<string, unknown> }
  | { type: 'PREVIEW_READY'; integration: IntegrationId }
  | { type: 'VALIDATION_ERRORS'; errors: Record<string, string[]> };
```

### Why This Works

| Concern | Solution |
|---------|----------|
| `EnvironmentProviders` need root bootstrap | Query param selects integration at bootstrap time |
| Integration switching | Full iframe reload (or pre-loaded hidden iframes) |
| Code splitting | Dynamic import per integration in `main.ts` |
| Integration styles | Loaded at bootstrap time before app renders |
| Customer branding | CSS custom properties (applied any time) |
| Single codebase | One app, one build, query param determines behavior |

---

## Alternative: Iframe-less Preview with `createApplication()`

Angular's [`createApplication()`](https://angular.dev/api/platform-browser/createApplication) creates an
Angular application **without bootstrapping any components**. This enables embedding multiple isolated
Angular apps in the same page, each with its own environment injector.

### How It Works

```typescript
// builder/src/preview-manager.service.ts
import { createApplication, ApplicationRef } from '@angular/platform-browser';
import { provideZonelessChangeDetection } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class PreviewManagerService {
  private activeApp: ApplicationRef | null = null;
  private previewContainer: HTMLElement;

  async switchIntegration(integration: IntegrationId) {
    // Destroy previous app if exists
    this.activeApp?.destroy();

    // Dynamically import integration providers
    const integrationProvider = await this.loadIntegrationProvider(integration);

    // Create new Angular app with its own injector
    this.activeApp = await createApplication({
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        integrationProvider,  // provideDynamicForm(...) for this integration
      ],
    });

    // Bootstrap preview component into the container
    const previewComponent = await import('./preview.component').then(m => m.PreviewComponent);
    this.activeApp.bootstrap(previewComponent, this.previewContainer);
  }

  private async loadIntegrationProvider(integration: IntegrationId) {
    const loaders = {
      material: () => import('@ng-forge/dynamic-forms-material').then(m =>
        provideDynamicForm(...m.withMaterialFields())),
      bootstrap: () => import('@ng-forge/dynamic-forms-bootstrap').then(m =>
        provideDynamicForm(...m.withBootstrapFields())),
      // ...
    };
    return loaders[integration]();
  }
}
```

### Pros vs Iframe Approach

| Aspect | `createApplication()` | Iframe + Query Param |
|--------|----------------------|----------------------|
| **Integration switching** | Instant (destroy + create) | Page reload (~500ms) |
| **Style isolation** | Needs Shadow DOM or scoping | Natural (iframe) |
| **Bundle size** | Single bundle, code-split | Same |
| **Complexity** | Higher (manage lifecycle) | Lower (just reload) |
| **DevTools** | Single context | Separate context per iframe |
| **postMessage** | Not needed (same window) | Required |

### When to Use Which

- **Use iframe + reload** (recommended starting point):
  - Simpler implementation
  - Perfect style isolation
  - Familiar mental model (iframe = isolated browser context)

- **Use `createApplication()`** when:
  - Instant integration switching is critical UX
  - You need deep integration between builder and preview (shared services, direct method calls)
  - You're building a single-page experience without iframes

### Style Isolation with `createApplication()`

Since both apps share the same DOM, you need explicit style isolation:

```typescript
// Option 1: Shadow DOM
@Component({
  selector: 'preview-root',
  encapsulation: ViewEncapsulation.ShadowDom,  // Isolates styles
  template: `<ng-forge-form [config]="config()" />`
})
export class PreviewComponent {}

// Option 2: CSS scoping via container
// Load integration styles scoped to .preview-container
.preview-container.material { /* material styles */ }
.preview-container.bootstrap { /* bootstrap styles */ }
```

### Recommendation

**Start with the iframe approach** — it's simpler and handles style isolation naturally.
Consider `createApplication()` as a future optimization if users need instant switching.

---

## Open Questions

None - architecture decisions are locked. Implementation can begin.

---

## Verification

- [ ] Docker Compose starts all services locally
- [ ] Tenant isolation verified (can't access other tenant's forms)
- [ ] Form save/load roundtrip works
- [ ] Preview apps render forms correctly
- [ ] Collaboration syncs between two browser tabs
- [ ] AI chat responds with form context
- [ ] Enterprise deploy works with single docker-compose.yml
