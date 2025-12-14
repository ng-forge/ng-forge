import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  defaultValidationMessages: {
    required: 'This field is required',
    min: 'Value must be at least {{min}}',
    max: 'Value must be at most {{max}}',
    maxLength: 'Must be no more than {{requiredLength}} characters',
    pattern: 'Invalid format',
  },
  fields: [
    // Page 1: Cart Review
    {
      key: 'cartPage',
      type: 'page',
      fields: [
        {
          key: 'cart-page-title',
          type: 'text',
          label: 'Review Your Cart',
        },
        {
          key: 'cart-page-description',
          type: 'text',
          label: 'Review items and quantities before checkout',
        },
        {
          key: 'itemQuantity1',
          type: 'input',
          label: 'Laptop Quantity',
          props: {
            type: 'number',
          },
          min: 0,
          max: 10,
          value: 1,
          required: true,
          col: 6,
        },
        {
          key: 'itemQuantity2',
          type: 'input',
          label: 'Mouse Quantity',
          props: {
            type: 'number',
          },
          min: 0,
          max: 10,
          value: 2,
          col: 6,
        },
        {
          key: 'promoCode',
          type: 'input',
          label: 'Promo Code (Optional)',
          props: {
            placeholder: 'Enter promo code',
          },
          col: 12,
        },
        {
          key: 'giftWrap',
          type: 'checkbox',
          label: 'Add gift wrapping (+$5.00)',
          col: 12,
        },
        {
          key: 'nextToShippingPage',
          type: 'next',
          label: 'Next',
          col: 12,
        },
      ],
    },
    // Page 2: Shipping Information
    {
      key: 'shippingPage',
      type: 'page',

      fields: [
        {
          key: 'shipping-page-title',
          type: 'text',
          label: 'Shipping Information',
        },
        {
          key: 'shipping-page-description',
          type: 'text',
          label: 'Where should we send your order?',
        },
        {
          key: 'shippingFirstName',
          type: 'input',
          label: 'First Name',
          props: {
            placeholder: 'Shipping first name',
          },
          required: true,
          col: 6,
        },
        {
          key: 'shippingLastName',
          type: 'input',
          label: 'Last Name',
          props: {
            placeholder: 'Shipping last name',
          },
          required: true,
          col: 6,
        },
        {
          key: 'shippingAddress',
          type: 'textarea',
          label: 'Shipping Address',
          props: {
            placeholder: 'Enter complete shipping address',
            rows: 3,
          },
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
          value: 'standard',
          col: 12,
        },
        {
          key: 'deliveryInstructions',
          type: 'textarea',
          label: 'Delivery Instructions (Optional)',
          props: {
            placeholder: 'Special delivery instructions',
            rows: 2,
          },
          col: 12,
        },
        {
          key: 'previousToCartPage',
          type: 'previous',
          label: 'Previous',
          col: 6,
        },
        {
          key: 'nextToBillingPage',
          type: 'next',
          label: 'Next',
          col: 6,
        },
      ],
    },
    // Page 3: Billing & Payment
    {
      key: 'billingPage',
      type: 'page',

      fields: [
        {
          key: 'billing-page-title',
          type: 'text',
          label: 'Billing & Payment',
        },
        {
          key: 'billing-page-description',
          type: 'text',
          label: 'Payment information and billing address',
        },
        {
          key: 'sameAsShipping',
          type: 'checkbox',
          label: 'Billing address same as shipping',
          col: 12,
        },
        {
          key: 'billingFirstName',
          type: 'input',
          label: 'Billing First Name',
          props: {
            placeholder: 'Billing first name',
          },
          col: 6,
        },
        {
          key: 'billingLastName',
          type: 'input',
          label: 'Billing Last Name',
          props: {
            placeholder: 'Billing last name',
          },
          col: 6,
        },
        {
          key: 'paymentMethod',
          type: 'radio',
          label: 'Payment Method',
          options: [
            { value: 'credit', label: 'Credit Card' },
            { value: 'debit', label: 'Debit Card' },
            { value: 'paypal', label: 'PayPal' },
            { value: 'applepay', label: 'Apple Pay' },
          ],
          required: true,
          col: 12,
        },
        {
          key: 'cardNumber',
          type: 'input',
          label: 'Card Number',
          props: {
            placeholder: '1234 5678 9012 3456',
          },
          pattern: '^[0-9\\s]{13,19}$',
          required: true,
          col: 8,
        },
        {
          key: 'cvv',
          type: 'input',
          label: 'CVV',
          props: {
            placeholder: '123',
          },
          maxLength: 4,
          pattern: '^[0-9]{3,4}$',
          required: true,
          col: 4,
        },
        {
          key: 'savePayment',
          type: 'checkbox',
          label: 'Save payment method for future purchases',
          col: 12,
        },
        {
          key: 'previousToShippingPage',
          type: 'previous',
          label: 'Previous',
          col: 6,
        },
        {
          key: 'nextToConfirmationPage',
          type: 'next',
          label: 'Next',
          col: 6,
        },
      ],
    },
    // Page 4: Order Confirmation
    {
      key: 'confirmationPage',
      type: 'page',
      fields: [
        {
          key: 'confirmation-page-title',
          type: 'text',
          label: 'Order Confirmation',
        },
        {
          key: 'confirmation-page-description',
          type: 'text',
          label: 'Review your complete order before placing',
        },
        {
          key: 'orderNotes',
          type: 'textarea',
          label: 'Order Notes (Optional)',
          props: {
            placeholder: 'Any special notes for this order',
            rows: 3,
          },
          col: 12,
        },
        {
          key: 'emailReceipt',
          type: 'checkbox',
          label: 'Email me order confirmation and tracking info',
          value: true,
          col: 12,
        },
        {
          key: 'smsUpdates',
          type: 'checkbox',
          label: 'Send SMS updates for delivery status',
          col: 12,
        },
        {
          key: 'termsCheckout',
          type: 'checkbox',
          label: 'I agree to the Terms of Sale and Return Policy',
          required: true,
          col: 12,
        },
        {
          key: 'previousToBillingPage',
          type: 'previous',
          label: 'Previous',
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
} as const satisfies FormConfig;

export const checkoutJourneyScenario: TestScenario = {
  testId: 'checkout-journey',
  title: 'E-commerce Checkout Journey',
  description: 'Tests e-commerce checkout flow across 4 pages',
  config,
};
