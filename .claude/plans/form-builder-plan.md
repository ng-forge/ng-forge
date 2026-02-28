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
This means it **cannot** be swapped at the component level — only at:
- `bootstrapApplication()`
- Route-level `providers` (lazy-loaded routes)

### Solution: Route-Based Lazy Loading + Dynamic Styles + Extensible Theming

One preview app. Each integration is a **lazy-loaded route** that provides its own
`provideDynamicForm(...)` at the route level. Styles and themes load dynamically.

```
apps/
├── builder/                       # Main builder app (iframe embeds preview)
└── preview/                       # Single preview shell
    └── src/
        ├── app/
        │   ├── app.routes.ts      # Route per integration
        │   └── app.config.ts      # Minimal — no provideDynamicForm here
        ├── integrations/
        │   ├── material/
        │   │   ├── material.routes.ts   # provideDynamicForm(...withMaterialFields())
        │   │   └── material.styles.ts   # Dynamic CSS loader
        │   ├── bootstrap/
        │   │   ├── bootstrap.routes.ts
        │   │   └── bootstrap.styles.ts
        │   ├── primeng/
        │   │   ├── primeng.routes.ts
        │   │   └── primeng.styles.ts
        │   └── ionic/
        │       ├── ionic.routes.ts
        │       └── ionic.styles.ts
        ├── shared/
        │   ├── preview-shell.component.ts   # Shared preview container
        │   ├── style-loader.service.ts      # Dynamic CSS injection
        │   ├── theme-manager.service.ts     # Customer theming engine
        │   └── preview-bridge.service.ts    # postMessage communication
        └── styles/
            └── preview-reset.css            # Minimal base styles only
```

### Route-Level Providers (solves EnvironmentProviders constraint)

```typescript
// preview/src/app/app.routes.ts
export const appRoutes: Routes = [
  {
    path: 'material',
    loadChildren: () => import('./integrations/material/material.routes')
  },
  {
    path: 'bootstrap',
    loadChildren: () => import('./integrations/bootstrap/bootstrap.routes')
  },
  {
    path: 'primeng',
    loadChildren: () => import('./integrations/primeng/primeng.routes')
  },
  {
    path: 'ionic',
    loadChildren: () => import('./integrations/ionic/ionic.routes')
  },
];
```

```typescript
// preview/src/integrations/material/material.routes.ts
export default [
  {
    path: '',
    component: PreviewShellComponent,
    providers: [
      // ✅ EnvironmentProviders are valid at the route level
      provideDynamicForm(...withMaterialFields()),
    ],
  },
] as const satisfies Routes;
```

Switching integration = **navigate the iframe** to a different route (`/material` → `/bootstrap`).
This tears down the old environment injector and creates a new one with the correct providers.

### Dynamic Style Loading

Each integration needs its own CSS (Material Design styles, Bootstrap CSS, PrimeNG theme, Ionic CSS).
These are loaded/unloaded dynamically when the route activates.

```typescript
// preview/src/shared/style-loader.service.ts
@Injectable({ providedIn: 'root' })
export class StyleLoaderService {
  private activeStyles = new Map<string, HTMLLinkElement>();

  /**
   * Load a CSS file dynamically. Returns a promise that resolves when loaded.
   * Handles deduplication — same URL won't be loaded twice.
   */
  load(id: string, href: string): Promise<void> {
    if (this.activeStyles.has(id)) return Promise.resolve();

    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.id = `style-${id}`;
      link.onload = () => resolve();
      link.onerror = () => reject(new Error(`Failed to load style: ${href}`));
      document.head.appendChild(link);
      this.activeStyles.set(id, link);
    });
  }

  /** Unload a previously loaded stylesheet */
  unload(id: string): void {
    const link = this.activeStyles.get(id);
    if (link) {
      link.remove();
      this.activeStyles.delete(id);
    }
  }

  /** Unload all styles except the specified ones */
  unloadAllExcept(...keepIds: string[]): void {
    for (const [id] of this.activeStyles) {
      if (!keepIds.includes(id)) this.unload(id);
    }
  }
}
```

```typescript
// preview/src/integrations/material/material.styles.ts
// Called from a route guard or component init
export function loadMaterialStyles(styleLoader: StyleLoaderService) {
  styleLoader.unloadAllExcept('base');
  return Promise.all([
    styleLoader.load('material-theme', '/assets/styles/material-theme.css'),
    // Angular Material prebuilt theme or custom-built theme
  ]);
}
```

### Customer Theming (Extensible)

Customer theming uses **CSS custom properties** as the extension point. This works across
ALL integrations because every modern UI framework supports CSS variable overrides.

```typescript
// preview/src/shared/theme-manager.service.ts
@Injectable({ providedIn: 'root' })
export class ThemeManagerService {
  private themeStyleEl: HTMLStyleElement | null = null;

  /**
   * Apply a customer theme. Accepts a map of CSS custom property overrides.
   * Works with any integration since CSS vars cascade through all children.
   */
  applyTheme(theme: CustomerTheme): void {
    this.removeTheme();

    const vars = Object.entries(theme.variables)
      .map(([key, value]) => `${key}: ${value};`)
      .join('\n  ');

    const style = document.createElement('style');
    style.id = 'customer-theme';
    style.textContent = `:root {\n  ${vars}\n}`;

    // Optional: additional raw CSS for advanced customization
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
  /** CSS custom property overrides: { '--primary-color': '#1976d2' } */
  variables: Record<string, string>;
  /** Optional raw CSS for advanced customization (enterprise only) */
  customCss?: string;
}
```

**How the builder sends theme to preview:**

```typescript
// Builder → Preview postMessage
preview.postMessage({
  type: 'APPLY_THEME',
  theme: {
    variables: {
      '--primary-color': '#1976d2',
      '--border-radius': '8px',
      '--font-family': '"Inter", sans-serif',
    },
    customCss: '.mat-mdc-card { box-shadow: none; }',  // enterprise only
  }
});
```

**Enterprise self-hosted customers** can:
1. Override CSS variables for branding (colors, fonts, spacing)
2. Inject raw CSS for deeper customization
3. Provide a full theme CSS file URL that gets loaded via `StyleLoaderService`
4. Register custom theme presets that appear in the builder UI

### Builder ↔ Preview Communication (postMessage Bridge)

```typescript
// preview/src/shared/preview-bridge.service.ts
type BuilderMessage =
  | { type: 'CONFIG_UPDATE'; config: FormSchema }
  | { type: 'SWITCH_INTEGRATION'; integration: IntegrationId }
  | { type: 'APPLY_THEME'; theme: CustomerTheme }
  | { type: 'SELECT_FIELD'; fieldKey: string }
  | { type: 'RESPONSIVE_MODE'; width: number; height: number };

type PreviewMessage =
  | { type: 'FIELD_CLICKED'; fieldKey: string }
  | { type: 'FORM_VALUE_CHANGE'; value: Record<string, unknown> }
  | { type: 'PREVIEW_READY' }
  | { type: 'VALIDATION_ERRORS'; errors: Record<string, string[]> };
```

When `SWITCH_INTEGRATION` is received, the preview **navigates** to the new route
(e.g., `/material` → `/bootstrap`). This:
1. Destroys the old route's environment injector (old `provideDynamicForm`)
2. Creates a new environment injector (new `provideDynamicForm`)
3. Unloads old integration styles, loads new ones
4. Re-applies customer theme (CSS vars work across all integrations)
5. Sends `PREVIEW_READY` back to builder

### Why This Works

| Concern | Solution |
|---------|----------|
| `EnvironmentProviders` can't be component-level | Route-level providers via `loadChildren` |
| Integration styles conflict | Dynamic load/unload via `StyleLoaderService` |
| Customer branding | CSS custom properties (universal across integrations) |
| Deep enterprise customization | Raw CSS injection + custom theme file URLs |
| Code splitting | Each integration is a lazy-loaded route chunk |
| Integration switching | Navigate iframe to different route, full teardown/rebuild |
| Single deploy | One app, one Docker image, one URL |

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
