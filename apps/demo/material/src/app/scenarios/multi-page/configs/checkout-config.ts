import { FormConfig, FormEvent } from '@ng-forge/dynamic-form';

export const checkoutConfig = {
  fields: [
    {
      key: 'cartPage',
      type: 'page',
      fields: [
        {
          key: 'cartTitle',
          type: 'text',
          label: 'Review Cart',
          props: {
            elementType: 'h2',
          },
          col: 12,
        },
        {
          key: 'cartDescription',
          type: 'text',
          label: 'Review your items before checkout',
          col: 12,
        },
        {
          key: 'promoCode',
          type: 'input',
          label: 'Promo Code',
          col: 8,
        },
        {
          key: 'applyPromo',
          type: 'button',
          label: 'Apply',
          event: FormEvent,
          col: 4,
        },
        {
          key: 'giftWrap',
          type: 'checkbox',
          label: 'Add gift wrapping (+$5.00)',
          col: 12,
        },
        {
          key: 'nextToShipping',
          type: 'next',
          label: 'Continue to Shipping',
          col: 12,
        },
      ],
    },
    {
      key: 'shippingPage',
      type: 'page',
      fields: [
        {
          key: 'shippingTitle',
          type: 'text',
          label: 'Shipping Information',
          props: {
            elementType: 'h2',
          },
          col: 12,
        },
        {
          key: 'shippingDescription',
          type: 'text',
          label: 'Where should we deliver your order?',
          col: 12,
        },
        {
          key: 'shippingName',
          type: 'input',
          label: 'Full Name',
          required: true,
          col: 12,
        },
        {
          key: 'shippingAddress',
          type: 'textarea',
          label: 'Address',
          required: true,
          col: 12,
        },
        {
          key: 'shippingMethod',
          type: 'radio',
          label: 'Shipping Method',
          options: [
            { value: 'standard', label: 'Standard (5-7 days) - FREE' },
            { value: 'express', label: 'Express (2-3 days) - $9.99' },
            { value: 'overnight', label: 'Overnight - $24.99' },
          ],
          required: true,
          col: 12,
        },
        {
          key: 'backToCart',
          type: 'previous',
          label: 'Back to Cart',
          col: 6,
        },
        {
          key: 'nextToPayment',
          type: 'next',
          label: 'Continue to Payment',
          col: 6,
        },
      ],
    },
    {
      key: 'paymentPage',
      type: 'page',
      fields: [
        {
          key: 'paymentTitle',
          type: 'text',
          label: 'Payment',
          props: {
            elementType: 'h2',
          },
          col: 12,
        },
        {
          key: 'paymentDescription',
          type: 'text',
          label: 'Complete your purchase',
          col: 12,
        },
        {
          key: 'paymentMethod',
          type: 'radio',
          label: 'Payment Method',
          options: [
            { value: 'credit', label: 'Credit Card' },
            { value: 'paypal', label: 'PayPal' },
            { value: 'apple', label: 'Apple Pay' },
          ],
          required: true,
          col: 12,
        },
        {
          key: 'cardNumber',
          type: 'input',
          label: 'Card Number',
          required: true,
          col: 12,
        },
        {
          key: 'billingAddress',
          type: 'checkbox',
          label: 'Same as shipping address',
          col: 12,
        },
        {
          key: 'payment-actions',
          type: 'row',
          fields: [
            {
              key: 'backToShipping',
              type: 'previous',
              label: 'Back to Shipping',
              col: 6,
            },
            {
              key: 'placeOrder',
              type: 'submit',
              label: 'Place Order',
              col: 6,
            },
          ],
        },
      ],
    },
  ],
} as const satisfies FormConfig;
