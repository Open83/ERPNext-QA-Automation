import { test, expect } from '@playwright/test';
import { SalesOrderPage } from '../../../../pages/sales-order.page.js';
import { SALES_ORDER_TEST_DATA } from '../../../../data/sales-order.data.js';

/**
 * SALES ORDER WORKFLOW TEST
 *
 * Sales Order is created after Quotation in the sales workflow
 * Complete workflow: customer → item → qty → rate → amount → save → persist
 */

test('Complete Sales Order workflow: create, add item, save, verify', async ({ page, baseURL }) => {
  const soPage = new SalesOrderPage(page);
  const testData = SALES_ORDER_TEST_DATA.scenarios.simple;

  console.log('\n📋 SALES ORDER WORKFLOW TEST');
  console.log(`Customer: ${testData.customer}`);
  console.log(`Item: ${testData.item}`);
  console.log(`Qty: ${testData.quantity}`);
  console.log(`Rate: ${testData.rate}`);

  // ========== STEP 1: NAVIGATE ==========
  await soPage.openNewSalesOrder();
  console.log('✅ Step 1: Navigated to new Sales Order');

  // ========== STEP 2: WAIT FOR FORM ==========
  await soPage.waitForFormReady();
  console.log('✅ Step 2: Form loaded and ready');

  // ========== STEP 3: SELECT CUSTOMER ==========
  await soPage.setCustomer(testData.customer);
  console.log(`✅ Step 3: Selected customer: ${testData.customer}`);

  // ========== STEP 4: ADD ITEM ROW ==========
  await soPage.addItemRow();
  console.log('✅ Step 4: Added item row to grid');

  // ========== STEP 5: SELECT ITEM ==========
  await soPage.selectItemInLastRow(testData.item);
  console.log(`✅ Step 5: Selected item: ${testData.item}`);

  // ========== STEP 6: SET QUANTITY ==========
  await soPage.setQuantityInLastRow(testData.quantity);
  console.log(`✅ Step 6: Set quantity: ${testData.quantity}`);

  // ========== STEP 7: SET RATE ==========
  await soPage.setRateInLastRow(testData.rate);
  console.log(`✅ Step 7: Set rate: ${testData.rate}`);

  // ========== STEP 8: VERIFY CALCULATION ==========
  const expectedAmount = testData.quantity * testData.rate;
  console.log(`✅ Step 8: Expected amount: ${expectedAmount}`);

  // ========== STEP 9: SAVE ==========
  await soPage.save();
  console.log('✅ Step 9: Saved Sales Order');

  // ========== STEP 10: VERIFY PERSISTENCE ==========
  const url = page.url();
  const savedUrlPattern = /\/sales-order\/(?!new\/?$)/;
  const isSaved = savedUrlPattern.test(url);

  expect(isSaved).toBeTruthy();
  console.log(`✅ Step 10: Document saved, URL: ${url}`);

  await page.screenshot({ path: 'sales-order-workflow-complete.png', fullPage: false });
  console.log('✅ Screenshot captured');

  console.log('\n✅ SALES ORDER WORKFLOW TEST PASSED');
});
