# ng-forge Form Builder - Implementation Plan

## Overview

A visual Form Builder SaaS that generates ng-forge dynamic form configurations. Users can design forms visually and export configurations for use with the ng-forge library.

---

## Repository Structure

### Public: `ng-forge` (existing)

```
ng-forge/
├── packages/
│   ├── dynamic-forms/              # Core library
│   ├── dynamic-forms-material/     # Material UI integration
│   ├── dynamic-forms-bootstrap/    # Bootstrap integration
│   ├── dynamic-forms-primeng/      # PrimeNG integration
│   └── dynamic-forms-ionic/        # Ionic integration
├── apps/
│   ├── docs/                       # SSR (Analog) - landing + documentation
│   └── examples/                   # Example applications
└── guides/
```

### Private: `ng-forge-builder` (new repo)

```
ng-forge-builder/
├── apps/
│   ├── builder/                    # Main Angular SPA
│   ├── preview-material/           # Material preview app
│   ├── preview-bootstrap/          # Bootstrap preview app
│   ├── preview-primeng/            # PrimeNG preview app
│   └── preview-ionic/              # Ionic preview app
│
├── libs/
│   ├── core/                       # Shared utilities
│   │   ├── utils/
│   │   ├── types/
│   │   └── index.ts
│   │
│   ├── api/                        # APIs with services, mocks, models
│   │   ├── forms/
│   │   │   ├── forms.service.ts
│   │   │   ├── forms.mocks.ts
│   │   │   ├── forms.model.ts
│   │   │   └── index.ts
│   │   ├── orgs/
│   │   │   ├── orgs.service.ts
│   │   │   ├── orgs.mocks.ts
│   │   │   ├── orgs.model.ts
│   │   │   └── index.ts
│   │   ├── auth/
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.mocks.ts
│   │   │   ├── auth.model.ts
│   │   │   └── index.ts
│   │   ├── ai/
│   │   │   ├── ai.service.ts
│   │   │   ├── ai.mocks.ts
│   │   │   ├── ai.model.ts
│   │   │   └── index.ts
│   │   ├── mocks/
│   │   │   ├── browser.ts          # MSW browser setup
│   │   │   ├── handlers.ts         # Combined handlers
│   │   │   ├── factories/          # Data factories
│   │   │   └── scenarios/          # Test scenarios
│   │   └── index.ts
│   │
│   └── features/
│       ├── builder/                # Form builder UI
│       ├── dashboard/              # User dashboard
│       ├── org-management/         # Organization features
│       ├── ai-chat/                # AI assistant (internal)
│       ├── auth/                   # Auth flows
│       ├── preview/                # Preview components
│       └── bridge/                 # postMessage communication
│
├── amplify/
│   ├── auth/
│   │   └── resource.ts             # Cognito config
│   ├── data/
│   │   └── resource.ts             # DynamoDB schema
│   ├── functions/
│   │   └── api/                    # Lambda functions
│   ├── ai/
│   │   └── resource.ts             # Bedrock config
│   └── backend.ts                  # Main backend config
│
├── amplify.yml                     # CI/CD config
└── package.json
```

---

## Tech Stack

### ng-forge (public) - Vercel

| Layer | Technology |
|-------|------------|
| **Docs** | ng-doc (static) |
| **Landing** | Angular (static/SSR) |
| **Hosting** | Vercel |
| **Analytics** | Existing setup |
| **CI/CD** | Vercel (automatic) |

### ng-forge-builder (private) - AWS Amplify

| Layer | Technology |
|-------|------------|
| **Frontend** | Angular 21 (SPA) |
| **UI Libraries** | Material, Bootstrap, PrimeNG, Ionic (preview apps) |
| **Hosting** | AWS Amplify Hosting |
| **Auth** | Amplify Auth (Cognito + Hosted UI) |
| **Database** | DynamoDB (via Amplify Data) |
| **API** | AppSync GraphQL |
| **AI** | Amplify AI (Bedrock → Claude) |
| **Payments** | Stripe |
| **Analytics** | PostHog |
| **Monitoring** | CloudWatch (included with Amplify) |
| **Mocking** | MSW (Mock Service Worker) |
| **CI/CD** | Amplify Hosting (automatic) |

---

## Feature Tiers

### Free (Unauthenticated)
- Visual form builder
- Live preview (all UI libraries)
- Download JSON configuration
- Import existing JSON

### Free (Authenticated)
- All free features
- Save forms to cloud
- Form versioning
- Basic templates

### Pro ($15/month)
- All free features
- Organizations & team collaboration
- AI chat assistant
- Public API access
- Priority support

---

## Architecture

### Builder Application (SPA)

```
┌─────────────────────────────────────────────────────────────┐
│                     Builder App (SPA)                        │
├──────────────┬──────────────────────────┬───────────────────┤
│ Field        │     Canvas               │  Property         │
│ Palette      │     (Form Preview)       │  Panel            │
│ (toggleable) │                          │  (toggleable)     │
├──────────────┴──────────────────────────┴───────────────────┤
│                    Toolbar / Actions                         │
└─────────────────────────────────────────────────────────────┘
```

### Preview Architecture

Each UI library has its own preview app for complete style isolation:

```
Builder App                         Preview Apps (iframes)
┌───────────────┐                  ┌─────────────────────┐
│               │   postMessage    │ preview-material    │
│   Builder     │ ◄──────────────► │ (Material styles)   │
│               │                  └─────────────────────┘
│               │                  ┌─────────────────────┐
│               │ ◄──────────────► │ preview-bootstrap   │
│               │                  │ (Bootstrap styles)  │
│               │                  └─────────────────────┘
│               │                  ┌─────────────────────┐
│               │ ◄──────────────► │ preview-primeng     │
│               │                  │ (PrimeNG styles)    │
│               │                  └─────────────────────┘
│               │                  ┌─────────────────────┐
│               │ ◄──────────────► │ preview-ionic       │
└───────────────┘                  │ (Ionic styles)      │
                                   └─────────────────────┘
```

### postMessage Protocol

```typescript
// Builder → Preview
interface BuilderMessage {
  type: 'CONFIG_UPDATE' | 'THEME_CHANGE' | 'RESET';
  payload: FormConfig | ThemeConfig | null;
}

// Preview → Builder
interface PreviewMessage {
  type: 'FIELD_SELECTED' | 'VALIDATION_ERROR' | 'READY';
  payload: FieldSelection | ValidationError | null;
}
```

---

## Environments

| Environment | Trigger | MSW | Purpose |
|-------------|---------|-----|---------|
| **PR Preview** | Pull Request | Enabled | Review changes, no backend needed |
| **Test** | Push to `main` | Disabled | Integration testing |
| **Staging** | Manual | Disabled | Pre-production validation |
| **Production** | Manual | Disabled | Live environment |

### Environment Files

```
apps/builder/src/environments/
├── environment.ts              # Default (local dev)
├── environment.preview.ts      # PR previews (MSW enabled)
├── environment.test.ts         # Test
├── environment.staging.ts      # Staging
└── environment.prod.ts         # Production
```

### Amplify Branch Configuration

```yaml
# amplify.yml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - |
          if [ "$AWS_BRANCH" = "main" ]; then
            nx build builder --configuration=test
          elif [[ "$AWS_BRANCH" == pr-* ]]; then
            nx build builder --configuration=preview
          elif [ "$AWS_BRANCH" = "staging" ]; then
            nx build builder --configuration=staging
          elif [ "$AWS_BRANCH" = "production" ]; then
            nx build builder --configuration=prod
          fi
  artifacts:
    baseDirectory: dist/apps/builder
    files:
      - '**/*'
```

---

## Data Model

```typescript
// Forms
interface Form {
  id: string;
  userId: string;
  orgId?: string;
  name: string;
  description?: string;
  config: FormConfig;        // ng-forge config
  version: number;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

// Organizations
interface Organization {
  id: string;
  name: string;
  ownerId: string;
  members: OrgMember[];
  plan: 'free' | 'pro';
  stripeCustomerId?: string;
  createdAt: string;
}

interface OrgMember {
  userId: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: string;
}

// Users
interface User {
  id: string;               // Cognito sub
  email: string;
  name?: string;
  plan: 'free' | 'pro';
  stripeCustomerId?: string;
  createdAt: string;
}
```

---

## Monitoring & Analytics

| Concern | Tool | Notes |
|---------|------|-------|
| Product Analytics | PostHog | User behavior, funnels, recordings |
| Session Recordings | PostHog | Included |
| Feature Flags | PostHog | Included |
| Error Tracking | CloudWatch | Included with Amplify |
| Logs | CloudWatch | Included with Amplify |
| Performance | CloudWatch | Included with Amplify |

### PostHog Integration

```typescript
// apps/builder/src/app/app.config.ts
import posthog from 'posthog-js';

if (environment.posthog.enabled) {
  posthog.init(environment.posthog.apiKey, {
    api_host: environment.posthog.host,
    capture_pageview: true,
    capture_pageleave: true,
    autocapture: true,
  });
}
```

---

## API Design

### Public API (Pro tier)

```
GET    /api/forms              # List user's forms
GET    /api/forms/:id          # Get form by ID
POST   /api/forms              # Create form
PUT    /api/forms/:id          # Update form
DELETE /api/forms/:id          # Delete form

GET    /api/orgs               # List user's organizations
GET    /api/orgs/:id           # Get organization
POST   /api/orgs               # Create organization
PUT    /api/orgs/:id           # Update organization
DELETE /api/orgs/:id           # Delete organization

POST   /api/orgs/:id/members   # Add member
DELETE /api/orgs/:id/members/:userId  # Remove member
```

### Internal Only (not exposed)
- AI chat endpoints (Amplify AI handles this internally)

---

## Security Considerations

- All API endpoints require authentication (except public form preview)
- Organization access controlled via DynamoDB access patterns
- Stripe webhooks verified with signature
- AI chat rate limited per user
- Form configs sanitized on import

---

## Implementation Phases

### Phase 1: Foundation
- [ ] Set up ng-forge-builder repo with Nx
- [ ] Configure Amplify backend (Auth, Data)
- [ ] Create builder app shell
- [ ] Set up MSW for local development
- [ ] Create preview apps (Material first)

### Phase 2: Core Builder
- [ ] Implement field palette
- [ ] Implement canvas with drag-and-drop
- [ ] Implement property panel
- [ ] Set up postMessage bridge
- [ ] JSON import/export

### Phase 3: Cloud Features
- [ ] User authentication flow
- [ ] Save/load forms from cloud
- [ ] Form versioning
- [ ] Dashboard UI

### Phase 4: Pro Features
- [ ] Stripe integration
- [ ] Organization management
- [ ] Team collaboration
- [ ] AI chat assistant
- [ ] Public API

### Phase 5: Polish
- [ ] All preview apps (Bootstrap, PrimeNG, Ionic)
- [ ] Templates gallery
- [ ] Documentation
- [ ] Marketing site updates

---

## Related Documents

- [MCP Server Plan](./MCP_SERVER_PLAN.md) - Separate task
- [Contributing Guide](../CONTRIBUTING.md)
