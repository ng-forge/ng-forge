import { FormConfig } from '@ng-forge/dynamic-forms';
import { ExampleScenario } from '../shared/types';

export const enterpriseFeaturesScenario: ExampleScenario = {
  id: 'enterprise-features',
  title: 'Enterprise Feature Configuration',
  description: 'Complex configuration form demonstrating AND/OR logic for enterprise feature gating.',
  config: {
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
        props: { appearance: 'outline' },
      },
      {
        key: 'teamSize',
        type: 'input',
        value: undefined,
        label: 'Team Size',
        min: 1,
        props: {
          type: 'number',
          hint: 'Number of team members',
          appearance: 'outline',
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
        props: { color: 'primary' },
      },
      {
        key: 'notificationsEnabled',
        type: 'toggle',
        value: true,
        label: 'Enable Notifications',
        props: { color: 'primary' },
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
        props: { color: 'primary' },
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
        props: { color: 'primary' },
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
        props: { color: 'primary' },
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
        props: { color: 'primary' },
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
        props: { color: 'primary' },
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
        props: { color: 'primary' },
      },
    ],
  } as const satisfies FormConfig,
};
