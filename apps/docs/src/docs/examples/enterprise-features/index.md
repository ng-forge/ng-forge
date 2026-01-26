[← Back to Quick Start](/examples)

Complex configuration form demonstrating AND/OR logic for enterprise feature gating.

## Live Demo

<iframe src="http://localhost:4201/#/examples/enterprise-features" class="example-frame" title="Enterprise Features Demo"></iframe>

## Overview

This example shows how to use combined AND/OR conditions to control access to premium features based on account type and team size. Enterprise features are only shown when specific criteria are met.

**Key patterns demonstrated:**

- AND/OR logic for complex conditions
- Multiple fields affecting each other
- Enterprise feature gating

## Implementation

```typescript
import { Component, signal } from '@angular/core';
import { DynamicForm, type FormConfig } from '@ng-forge/dynamic-forms';

@Component({
  selector: 'app-enterprise-features-form',
  imports: [DynamicForm],
  template: `<form [dynamic-form]="config" [(value)]="formValue"></form>`,
})
export class EnterpriseFeaturesFormComponent {
  formValue = signal({});

  config = {
    fields: [
      {
        key: 'accountType',
        type: 'select',
        value: '',
        label: 'Account Type',
        required: true,
        options: [
          { value: 'free', label: 'Free' },
          { value: 'pro', label: 'Pro' },
          { value: 'enterprise', label: 'Enterprise' },
        ],
      },
      {
        key: 'teamSize',
        type: 'input',
        value: null,
        label: 'Team Size',
        min: 1,
        props: {
          type: 'number',
          hint: 'Number of team members',
        },
        logic: [
          {
            type: 'hidden',
            condition: {
              type: 'fieldValue',
              fieldPath: 'accountType',
              operator: 'equals',
              value: 'free',
            },
          },
        ],
      },
      {
        key: 'basicFeaturesTitle',
        type: 'text',
        label: 'Basic Features',
        props: { elementType: 'h4' },
      },
      {
        key: 'analyticsEnabled',
        type: 'toggle',
        value: true,
        label: 'Enable Analytics',
      },
      {
        key: 'notificationsEnabled',
        type: 'toggle',
        value: true,
        label: 'Enable Notifications',
      },
      {
        key: 'proFeaturesTitle',
        type: 'text',
        label: 'Pro Features',
        props: { elementType: 'h4' },
        logic: [
          {
            type: 'hidden',
            condition: {
              type: 'fieldValue',
              fieldPath: 'accountType',
              operator: 'equals',
              value: 'free',
            },
          },
        ],
      },
      {
        key: 'apiAccess',
        type: 'toggle',
        value: false,
        label: 'Enable API Access',
        logic: [
          {
            type: 'hidden',
            condition: {
              type: 'fieldValue',
              fieldPath: 'accountType',
              operator: 'equals',
              value: 'free',
            },
          },
        ],
      },
      {
        key: 'advancedReports',
        type: 'toggle',
        value: false,
        label: 'Enable Advanced Reports',
        logic: [
          {
            type: 'hidden',
            condition: {
              type: 'fieldValue',
              fieldPath: 'accountType',
              operator: 'equals',
              value: 'free',
            },
          },
        ],
      },
      {
        key: 'enterpriseFeaturesTitle',
        type: 'text',
        label: 'Enterprise Features',
        props: { elementType: 'h4' },
        logic: [
          {
            type: 'hidden',
            condition: {
              type: 'or',
              conditions: [
                {
                  type: 'fieldValue',
                  fieldPath: 'accountType',
                  operator: 'notEquals',
                  value: 'enterprise',
                },
                {
                  type: 'fieldValue',
                  fieldPath: 'teamSize',
                  operator: 'less',
                  value: 10,
                },
              ],
            },
          },
        ],
      },
      {
        key: 'ssoEnabled',
        type: 'toggle',
        value: false,
        label: 'Enable SSO (Single Sign-On)',
        logic: [
          {
            type: 'hidden',
            condition: {
              type: 'or',
              conditions: [
                {
                  type: 'fieldValue',
                  fieldPath: 'accountType',
                  operator: 'notEquals',
                  value: 'enterprise',
                },
                {
                  type: 'fieldValue',
                  fieldPath: 'teamSize',
                  operator: 'less',
                  value: 10,
                },
              ],
            },
          },
        ],
      },
      {
        key: 'customBranding',
        type: 'toggle',
        value: false,
        label: 'Enable Custom Branding',
        logic: [
          {
            type: 'hidden',
            condition: {
              type: 'or',
              conditions: [
                {
                  type: 'fieldValue',
                  fieldPath: 'accountType',
                  operator: 'equals',
                  value: 'free',
                },
                {
                  type: 'fieldValue',
                  fieldPath: 'accountType',
                  operator: 'equals',
                  value: 'pro',
                },
              ],
            },
          },
        ],
      },
      {
        key: 'dedicatedSupport',
        type: 'toggle',
        value: false,
        label: 'Enable Dedicated Support',
        logic: [
          {
            type: 'hidden',
            condition: {
              type: 'or',
              conditions: [
                {
                  type: 'fieldValue',
                  fieldPath: 'accountType',
                  operator: 'notEquals',
                  value: 'enterprise',
                },
                {
                  type: 'fieldValue',
                  fieldPath: 'teamSize',
                  operator: 'less',
                  value: 10,
                },
              ],
            },
          },
        ],
      },
      {
        type: 'submit',
        key: 'submit',
        label: 'Save Configuration',
      },
    ],
  } as const satisfies FormConfig;
}
```

## How It Works

### OR Conditions

Enterprise features require enterprise account AND team size >= 10. They're hidden if EITHER condition fails:

```typescript
{
  key: 'ssoEnabled',
  type: 'toggle',
  logic: [{
    type: 'hidden',
    condition: {
      type: 'or',
      conditions: [
        {
          type: 'fieldValue',
          fieldPath: 'accountType',
          operator: 'notEquals',
          value: 'enterprise',
        },
        {
          type: 'fieldValue',
          fieldPath: 'teamSize',
          operator: 'less',
          value: 10,
        },
      ],
    },
  }],
}
```

This reads as: "Hide SSO if account is NOT enterprise OR team size < 10"

### Tiered Feature Access

Different tiers have different feature access:

| Feature           | Free | Pro | Enterprise (10+) |
| ----------------- | ---- | --- | ---------------- |
| Analytics         | ✓    | ✓   | ✓                |
| Notifications     | ✓    | ✓   | ✓                |
| API Access        | ✗    | ✓   | ✓                |
| Advanced Reports  | ✗    | ✓   | ✓                |
| SSO               | ✗    | ✗   | ✓                |
| Custom Branding   | ✗    | ✗   | ✓                |
| Dedicated Support | ✗    | ✗   | ✓                |

## Using AND Conditions

For features that require ALL conditions to be met, use `type: 'and'`:

```typescript
{
  type: 'hidden',
  condition: {
    type: 'and',
    conditions: [
      { type: 'fieldValue', fieldPath: 'accountType', operator: 'equals', value: 'enterprise' },
      { type: 'fieldValue', fieldPath: 'teamSize', operator: 'greaterOrEqual', value: 10 },
      { type: 'fieldValue', fieldPath: 'verified', operator: 'equals', value: true },
    ],
  },
}
```

## Use Cases

- SaaS feature configuration
- Admin settings panels
- Permission management
- Subscription tier management

## Related Documentation

- **[Conditional Logic](../../dynamic-behavior/conditional-logic/overview/)** - Full conditional logic guide
- **[Combining Conditions](../../dynamic-behavior/conditional-logic/overview/#combining-conditions)** - AND/OR logic
- **[Form Groups](../../prebuilt/form-groups/)** - Organizing fields
