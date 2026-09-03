/**
 * SALES ORDER TEST DATA
 *
 * Sales Order follows Quotation in the sales workflow
 * Uses same customers and items from existing demo data
 */

export const SALES_ORDER_TEST_DATA = {
  customers: {
    demo: 'Asif QA Demo Customer',
  },

  items: {
    sku004: 'SKU004',
    sku001: 'SKU001',
  },

  quantities: {
    standard: 10,
    large: 50,
  },

  rates: {
    standard: 1000,
    discount: 950,
  },

  scenarios: {
    simple: {
      description: 'Create sales order with customer and item',
      customer: 'Asif QA Demo Customer',
      item: 'SKU004',
      quantity: 10,
      rate: 1000,
    },

    multi_item: {
      description: 'Sales order with multiple items',
      customer: 'Asif QA Demo Customer',
      items: [
        { code: 'SKU004', qty: 10, rate: 1000 },
        { code: 'SKU001', qty: 5, rate: 1200 },
      ],
    },
  },

  company: 'Asif QA Demo Company (Demo)',
};
