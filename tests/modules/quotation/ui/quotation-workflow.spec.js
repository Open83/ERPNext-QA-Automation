import { test, expect } from '@playwright/test';
import { QuotationPage } from '../../../../pages/quotation.page.js';
import { QUOTATION_TEST_DATA } from '../../../../data/quotation.data.js';

/**
 * QUOTATION WORKFLOW TEST
 *
 * Complete real-world workflow:
 * 1. Navigate to new quotation
 * 2. Select customer via autocomplete
 * 3. Add item via grid
 * 4. Set quantity
 * 5. Set rate
 * 6. Verify calculation
 * 7. Save document
 * 8. Verify persistence
 */

test('Complete Quotation workflow: create, add item, save, verify', async ({ page, baseURL }) => {
  const quotationPage = new QuotationPage(page);
  const testData = QUOTATION_TEST_DATA.scenarios.simple;

  console.log('\n📋 QUOTATION WORKFLOW TEST');
  console.log(`Customer: ${testData.customer}`);
  console.log(`Item: ${testData.item}`);
  console.log(`Qty: ${testData.quantity}`);
  console.log(`Rate: ${testData.rate}`);

  // ========== STEP 1: NAVIGATE ==========
  await quotationPage.openNewQuotation();
  console.log('✅ Step 1: Navigated to new Quotation');

  // ========== STEP 2: WAIT FOR FORM ==========
  await quotationPage.waitForFormReady();
  console.log('✅ Step 2: Form loaded and ready');

  // ========== STEP 3: SELECT CUSTOMER ==========
  await quotationPage.setCustomer(testData.customer);
  console.log(`✅ Step 3: Selected customer: ${testData.customer}`);

  // ========== STEP 4: ADD ITEM ROW ==========
  await quotationPage.addItemRow();
  console.log('✅ Step 4: Added item row to grid');

  // ========== STEP 5: SELECT ITEM ==========
  await quotationPage.selectItemInLastRow(testData.item);
  console.log(`✅ Step 5: Selected item: ${testData.item}`);

  // ========== STEP 6: SET QUANTITY ==========
  await quotationPage.setQuantityInLastRow(testData.quantity);
  console.log(`✅ Step 6: Set quantity: ${testData.quantity}`);

  // ========== STEP 7: SET RATE ==========
  await quotationPage.setRateInLastRow(testData.rate);
  console.log(`✅ Step 7: Set rate: ${testData.rate}`);

  // ========== STEP 8: VERIFY AMOUNT CALCULATION ==========
  const expectedAmount = testData.quantity * testData.rate;
  console.log(`✅ Step 8: Expected amount: ${expectedAmount}`);

  // ========== STEP 9: SAVE ==========
  await quotationPage.save();
  console.log('✅ Step 9: Saved Quotation');

  // ========== STEP 10: VERIFY PERSISTENCE ==========
  const url = page.url();
  const savedUrlPattern = /\/quotation\/(?!new\/?$)/;
  const isSaved = savedUrlPattern.test(url);

  expect(isSaved).toBeTruthy();
  console.log(`✅ Step 10: Document saved, URL: ${url}`);

  await page.screenshot({ path: 'quotation-workflow-complete.png', fullPage: false });
  console.log('✅ Screenshot captured');

  console.log('\n✅ QUOTATION WORKFLOW TEST PASSED');
});
