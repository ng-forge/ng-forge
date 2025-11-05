import { FormConfig } from '@ng-forge/dynamic-form';

/**
 * E-commerce Checkout - Multi-page checkout flow
 */
export const ecommerceCheckoutConfig = {
  fields: [
    // Page 1: Cart Review
    {
      key: 'cartPage',
      type: 'page',
      fields: [
        {
          key: 'cartSummary',
          type: 'group',
          label: 'Order Summary',
          fields: [
            {
              key: 'subtotal',
              type: 'input',
              label: 'Subtotal',
              defaultValue: '$129.97',
              props: { readonly: true },
              col: 6,
            },
            {
              key: 'tax',
              type: 'input',
              label: 'Tax',
              defaultValue: '$10.40',
              props: { readonly: true },
              col: 6,
            },
            {
              key: 'shipping',
              type: 'input',
              label: 'Shipping',
              defaultValue: '$4.99',
              props: { readonly: true },
              col: 6,
            },
            {
              key: 'total',
              type: 'input',
              label: 'Total',
              defaultValue: '$145.36',
              props: { readonly: true },
              col: 6,
            },
          ],
        },
        {
          key: 'promoCode',
          type: 'input',
          label: 'Promo Code',
          defaultValue: '',
          props: { placeholder: 'Enter promo code' },
          col: 8,
        },
        {
          key: 'applyPromo',
          type: 'button',
          label: 'Apply',
          props: {
            color: 'accent',
          },
          col: 4,
        },
        {
          key: 'giftMessage',
          type: 'checkbox',
          label: 'Include gift message',
          defaultValue: false,
        },
      ],
    },

    // Page 2: Shipping Information
    {
      key: 'shippingPage',
      type: 'page',
      fields: [
        {
          key: 'shippingAddress',
          type: 'group',
          label: 'Shipping Address',
          fields: [
            {
              key: 'fullName',
              type: 'input',
              label: 'Full Name',
              required: true,
              defaultValue: 'John Customer',
              validators: [{ type: 'required' }],
            },
            {
              key: 'company',
              type: 'input',
              label: 'Company (Optional)',
              defaultValue: '',
            },
            {
              key: 'address1',
              type: 'input',
              label: 'Address Line 1',
              required: true,
              defaultValue: '123 Shopping Lane',
              validators: [{ type: 'required' }],
            },
            {
              key: 'address2',
              type: 'input',
              label: 'Address Line 2 (Optional)',
              defaultValue: 'Apt 4B',
            },
            {
              key: 'city',
              type: 'input',
              label: 'City',
              required: true,
              defaultValue: 'Commerce City',
              validators: [{ type: 'required' }],
              col: 6,
            },
            {
              key: 'zipCode',
              type: 'input',
              label: 'ZIP Code',
              required: true,
              defaultValue: '90210',
              validators: [
                { type: 'required' },
                { type: 'pattern', value: '^\\d{5}(-\\d{4})?$', errorMessage: 'Please enter a valid ZIP code' },
              ],
              col: 6,
            },
            {
              key: 'state',
              type: 'select',
              label: 'State',
              required: true,
              defaultValue: 'CA',
              options: [
                { value: 'CA', label: 'California' },
                { value: 'NY', label: 'New York' },
                { value: 'TX', label: 'Texas' },
                { value: 'FL', label: 'Florida' },
              ],
              col: 6,
            },
            {
              key: 'country',
              type: 'select',
              label: 'Country',
              required: true,
              defaultValue: 'US',
              options: [
                { value: 'US', label: 'United States' },
                { value: 'CA', label: 'Canada' },
              ],
              col: 6,
            },
          ],
        },
        {
          key: 'shippingMethod',
          type: 'radio',
          label: 'Shipping Method',
          required: true,
          defaultValue: 'standard',
          options: [
            { value: 'standard', label: 'Standard Shipping (5-7 days) - FREE' },
            { value: 'express', label: 'Express Shipping (2-3 days) - $9.99' },
            { value: 'overnight', label: 'Overnight Shipping - $24.99' },
          ],
          validators: [{ type: 'required' }],
        },
      ],
    },

    // Page 3: Payment Information
    {
      key: 'paymentPage',
      type: 'page',
      fields: [
        {
          key: 'paymentMethod',
          type: 'radio',
          label: 'Payment Method',
          required: true,
          defaultValue: 'credit',
          options: [
            { value: 'credit', label: 'Credit/Debit Card' },
            { value: 'paypal', label: 'PayPal' },
            { value: 'apple', label: 'Apple Pay' },
            { value: 'google', label: 'Google Pay' },
          ],
          validators: [{ type: 'required' }],
        },
        {
          key: 'cardInfo',
          type: 'group',
          label: 'Card Information',
          fields: [
            {
              key: 'cardNumber',
              type: 'input',
              label: 'Card Number',
              required: true,
              defaultValue: '4111 1111 1111 1111',
              props: { placeholder: '1234 5678 9012 3456' },
              validators: [
                { type: 'required' },
                { type: 'pattern', value: '^[0-9\\s]{13,19}$', errorMessage: 'Please enter a valid card number' },
              ],
            },
            {
              key: 'expiryDate',
              type: 'input',
              label: 'Expiry Date',
              required: true,
              defaultValue: '12/25',
              props: { placeholder: 'MM/YY' },
              validators: [
                { type: 'required' },
                { type: 'pattern', value: '^(0[1-9]|1[0-2])\\/\\d{2}$', errorMessage: 'Please enter a valid expiry date' },
              ],
              col: 6,
            },
            {
              key: 'cvv',
              type: 'input',
              label: 'CVV',
              required: true,
              defaultValue: '123',
              props: { placeholder: '123' },
              validators: [{ type: 'required' }, { type: 'pattern', value: '^\\d{3,4}$', errorMessage: 'Please enter a valid CVV' }],
              col: 6,
            },
          ],
        },
        {
          key: 'billingAddress',
          type: 'checkbox',
          label: 'Billing address is the same as shipping address',
          defaultValue: true,
        },
        {
          key: 'savePayment',
          type: 'checkbox',
          label: 'Save this payment method for future purchases',
          defaultValue: false,
        },
        {
          key: 'placeOrder',
          type: 'submit',
          label: 'Place Order',
          props: {
            color: 'primary',
          },
        },
      ],
    },
  ],
} as const satisfies FormConfig;
