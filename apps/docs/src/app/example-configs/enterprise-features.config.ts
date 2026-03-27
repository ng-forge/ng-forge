import { FormConfig } from '@ng-forge/dynamic-forms';

export const enterpriseFeaturesConfig = {
  defaultValidationMessages: {
    required: 'This field is required',
  },
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
      value: undefined,
      label: 'Team Size',
      min: 1,
      validationMessages: {
        min: 'Team size must be at least 1',
      },
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
