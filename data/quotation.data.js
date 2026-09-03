/**
 * QUOTATION TEST DATA
 *
 * Centralized data for Quotation tests
 * Uses known entities from ERPNext environment (Demo Company)
 */

export const QUOTATION_TEST_DATA = {
  // Customer selection for Quotation
  // These should be verified to exist in the ERPNext instance
  customers: {
    // Known demo customer (from Material Request environment)
    demo: 'Asif QA Demo Customer',
    // Fallback: try standard demo customer
    standard: 'John Doe',
  },

  // Items used in quotations
  // Should match items used in Material Request tests (SKU004 is confirmed to exist)
  items: {
    // Confirmed to exist (used in Material Request tests)
    sku004: 'SKU004',
    sku004_display: 'SKU004Smartphone', // How it displays in autocomplete

    // Alternative items (may exist)
    sku001: 'SKU001',
    sku002: 'SKU002',
    sku003: 'SKU003',
  },

  // Quantity scenarios
  quantities: {
    small: 5,
    standard: 10,
    large: 50,
    bulk: 100,
  },

  // Rate/pricing scenarios
  rates: {
    low: 100,
    medium: 500,
    standard: 1000,
    high: 5000,
  },

  // Workflow scenarios
  scenarios: {
    simple: {
      description: 'Create quotation with one item',
      customer: 'Asif QA Demo Customer',
      item: 'SKU004',
      quantity: 10,
      rate: 500,
    },

    multi_item: {
      description: 'Create quotation with multiple items',
      customer: 'Asif QA Demo Customer',
      items: [
        { code: 'SKU004', qty: 10, rate: 500 },
        { code: 'SKU001', qty: 5, rate: 1000 },
      ],
    },

    bulk_order: {
      description: 'Quotation with bulk quantity',
      customer: 'Asif QA Demo Customer',
      item: 'SKU004',
      quantity: 100,
      rate: 450, // Bulk discount
    },

    validation_no_customer: {
      description: 'Validation: save without customer',
      item: 'SKU004',
      quantity: 10,
      rate: 500,
      shouldFail: true,
      expectedError: 'Customer', // Error should mention customer
    },

    validation_no_item: {
      description: 'Validation: quotation with item row but no item selected',
      customer: 'Asif QA Demo Customer',
      shouldFail: true,
      expectedError: 'Item', // Error should mention item
    },
  },

  // Company (required field)
  company: 'Asif QA Demo Company (Demo)',

  // Expected calculation results
  calculations: {
    // Verify: Amount = Quantity × Rate
    simple_expected_amount: 10 * 500, // 5000
    multi_expected_total: (10 * 500) + (5 * 1000), // 10000
    bulk_expected_amount: 100 * 450, // 45000
  },
};
