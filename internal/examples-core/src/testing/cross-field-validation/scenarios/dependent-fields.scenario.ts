import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  defaultValidationMessages: {
    required: 'This field is required',
    min: 'Value must be at least {{min}}',
  },
  fields: [
    {
      key: 'category',
      type: 'select',
      label: 'Product Category',
      options: [
        { value: 'electronics', label: 'Electronics' },
        { value: 'clothing', label: 'Clothing' },
        { value: 'books', label: 'Books' },
      ],
      required: true,
      col: 6,
    },
    {
      key: 'subcategory',
      type: 'select',
      label: 'Subcategory',
      options: [
        { value: 'laptop', label: 'Laptop' },
        { value: 'phone', label: 'Phone' },
        { value: 'tablet', label: 'Tablet' },
        { value: 'shirt', label: 'Shirt' },
        { value: 'pants', label: 'Pants' },
        { value: 'shoes', label: 'Shoes' },
        { value: 'fiction', label: 'Fiction' },
        { value: 'nonfiction', label: 'Non-Fiction' },
        { value: 'textbook', label: 'Textbook' },
      ],
      col: 6,
    },
    {
      key: 'productName',
      type: 'input',
      label: 'Product Name',
      props: {
        placeholder: 'Enter product name',
      },
      required: true,
      col: 12,
    },
    {
      key: 'price',
      type: 'input',
      label: 'Price',
      props: {
        type: 'number',
        placeholder: 'Enter price',
      },
      min: 0,
      required: true,
      col: 6,
    },
    {
      key: 'currency',
      type: 'select',
      label: 'Currency',
      options: [
        { value: 'usd', label: 'USD' },
        { value: 'eur', label: 'EUR' },
        { value: 'gbp', label: 'GBP' },
        { value: 'cad', label: 'CAD' },
      ],
      value: 'usd',
      col: 6,
    },
    {
      key: 'submitDependent',
      type: 'submit',
      label: 'Add Product',
      col: 12,
    },
  ],
} as const satisfies FormConfig;

export const dependentFieldsScenario: TestScenario = {
  testId: 'dependent-fields',
  title: 'Dependent Field Testing',
  description: 'Tests dependent fields that change based on category selection',
  config,
};
