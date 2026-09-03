import { test, expect } from '@playwright/test';
import { QuotationPage } from '../../../../pages/quotation.page.js';
import { QUOTATION_TEST_DATA } from '../../../../data/quotation.data.js';

/**
 * VALIDATION TEST 1: Save Quotation Without Customer
 *
 * Business requirement:
 * - Customer is a required field
 * - Application should prevent saving quotation without customer
 * - User should see a clear validation error
 *
 * This test validates negative path - the application should refuse invalid operations
 */

test('Quotation cannot be saved without customer (validation)', async ({ page }) => {
  const quotationPage = new QuotationPage(page);

  console.log(`\n📋 VALIDATION TEST: Missing Required Field (Customer)`);

  // Step 1: Navigate to new Quotation
  await quotationPage.openNewQuotation();
  console.log('✅ Navigated to new Quotation form');

  // Step 2: Wait for form to be ready
  await quotationPage.waitForFormReady();
  console.log('✅ Form is ready');

  // Step 3: Attempt to save without customer
  console.log('🔄 Attempting to save without customer...');

  // Click Save button
  const saveButton = page.locator('button[data-label="Save"], .primary-action:has-text("Save")').first();
  await saveButton.click();

  // Wait for error message to appear
  // Frappe typically shows validation errors in a toast/alert
  const errorMessage = page.locator('.msgprint.alert, [role="alert"], .alert-danger, .frappe-control .validate-error').first();

  let hasError = false;
  let errorText = '';

  try {
    await errorMessage.waitFor({ state: 'visible', timeout: 5000 });
    errorText = await errorMessage.textContent();
    hasError = true;
    console.log(`✅ Validation error appeared: ${errorText?.substring(0, 100)}`);
  } catch {
    // Check if form still shows "Not Saved" which indicates save failed
    const notSavedBadge = page.locator('text=Not Saved');
    const stillNotSaved = await notSavedBadge.isVisible().catch(() => false);

    if (stillNotSaved) {
      hasError = true;
      console.log('✅ Save failed - form still shows "Not Saved"');
    } else {
      console.log('⚠️ No visible error found');
    }
  }

  // Step 4: Verify save was blocked
  expect(hasError).toBeTruthy();
  console.log('✅ Verification: Save was blocked (validation working)');

  // Step 5: Capture screenshot showing error
  await quotationPage.takeScreenshot('quotation-validation-error-no-customer');
  console.log('📸 Screenshot of validation error captured');

  console.log(`\n✅ VALIDATION TEST PASSED: Customer field validation is working`);
});

