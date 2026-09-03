/**
 * QUOTATION PAGE OBJECT
 *
 * Encapsulates business interactions with Quotation form
 * Reuses proven patterns from MaterialRequestPage for grid handling
 * Adds Customer selection pattern (new)
 */

export class QuotationPage {
  constructor(page) {
    this.page = page;
    this.baseURL = process.env.BASE_URL || 'https://asif-erpnext-qa.m.frappe.cloud';
  }

  // ==================== NAVIGATION ====================

  async openNewQuotation() {
    await this.page.goto(`${this.baseURL}/app/quotation/new`, { waitUntil: 'domcontentloaded', timeout: 15000 });
  }

  async openQuotationList() {
    await this.page.goto(`${this.baseURL}/app/quotation`, { waitUntil: 'domcontentloaded', timeout: 15000 });
  }

  // ==================== FORM READINESS ====================

  async closeModal() {
    // Close any modal dialogs that might be blocking interaction
    const modal = this.page.locator('[role="dialog"].modal.show, .modal.show').first();

    if (await modal.isVisible().catch(() => false)) {
      // Try to find and click a close button
      const closeBtn = modal.locator('button.close, [aria-label="Close"], .btn-close').first();

      if (await closeBtn.isVisible().catch(() => false)) {
        await closeBtn.click();
        await this.page.waitForTimeout(300);
      } else {
        // Press Escape as fallback
        await this.page.keyboard.press('Escape');
        await this.page.waitForTimeout(300);
      }

      // Verify modal is actually gone
      const stillVisible = await modal.isVisible().catch(() => false);
      if (stillVisible) {
        // Try clicking outside the modal
        await this.page.click('body', { position: { x: 100, y: 100 } });
        await this.page.waitForTimeout(300);
      }
    }
  }

  async waitForFormReady(timeout = 10000) {
    // Wait for form container to be visible
    const formContainer = this.page.locator('[data-doctype="Quotation"]');
    try {
      await formContainer.waitFor({ state: 'visible', timeout });
    } catch {
      // Form may still be loading, continue
    }

    // Wait for Save button to be visible as confirmation form is ready
    const saveButton = this.page.locator('button[data-label="Save"], .primary-action:has-text("Save")').first();
    await saveButton.waitFor({ state: 'visible', timeout: 8000 });

    // Close any "Getting Started" sidebar
    await this.closeModal();
  }

  // ==================== CUSTOMER SELECTION ====================

  async setCustomer(customerName) {
    // Find party_name field container (actual customer field in Quotation)
    const partyNameField = this.page.locator('[data-fieldname="party_name"]').first();

    // Wait for field to be visible
    await partyNameField.waitFor({ state: 'visible', timeout: 5000 });

    // Find the input within the field
    const input = partyNameField.locator('input').first();

    // Click to activate autocomplete
    await input.click();
    await this.page.waitForTimeout(300);

    // Type customer name
    await input.fill(customerName);

    // Wait for autocomplete dropdown to appear
    const autocompleteOption = this.page.locator('[role="option"]:has-text("' + customerName + '")').first();
    try {
      await autocompleteOption.waitFor({ state: 'visible', timeout: 3000 });
      // Click the matching option
      await autocompleteOption.click();
    } catch {
      // If autocomplete doesn't appear, try pressing Enter
      await input.press('Enter');
    }

    // Wait for autocomplete to close and field to settle
    await this.page.waitForTimeout(500);

    // Close any modal that might have appeared
    await this.closeModal();
  }

  async getCustomer() {
    const customerField = this.page.locator('[data-fieldname="customer"]');
    const input = customerField.locator('input, [contenteditable]');

    // Try to read from input first (edit mode)
    try {
      const inputValue = await input.inputValue().catch(() => null);
      if (inputValue) return inputValue;
    } catch {}

    // Fallback to displayed text
    const displayText = await customerField.textContent();
    return displayText?.trim() || null;
  }

  // ==================== ITEMS GRID - REUSE MATERIAL REQUEST PATTERNS ====================

  async addItemRow() {
    // Click "Add row" button
    const addRowBtn = this.page.locator('button:has-text("Add row")').first();
    const currentRowCount = await this.page.locator('[data-fieldname="items"] .grid-row, [data-fieldname="items"] tr.grid-row').count();

    await addRowBtn.click();

    // Wait for new row to appear
    await this.page.locator('[data-fieldname="items"] .grid-row, [data-fieldname="items"] tr.grid-row').nth(currentRowCount).waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});

    return currentRowCount;
  }

  async selectItemInLastRow(itemCode) {
    // Get the last grid row
    const rows = this.page.locator('[data-fieldname="items"] .grid-row, [data-fieldname="items"] tr.grid-row');
    const rowCount = await rows.count();
    const lastRow = rows.nth(rowCount - 1);

    // Click on Item Code cell to activate edit mode
    const itemCodeCell = lastRow.locator('[data-fieldname="item_code"]');
    await itemCodeCell.click();

    // Wait for input to appear
    const input = itemCodeCell.locator('input, [contenteditable]');
    await input.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});

    // Clear and type item code
    await input.clear();
    await input.fill(itemCode);

    // Wait for autocomplete dropdown
    await this.page.locator('[role="option"]').first().waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});

    // Click first matching option
    await this.page.locator('[role="option"]').first().click().catch(async () => {
      // Fallback: press Enter
      await input.press('Enter');
    });

    // Wait for selection to complete and dropdown to close
    await this.page.waitForTimeout(500);
  }

  async setQuantityInLastRow(quantity) {
    const rows = this.page.locator('[data-fieldname="items"] .grid-row, [data-fieldname="items"] tr.grid-row');
    const rowCount = await rows.count();
    const lastRow = rows.nth(rowCount - 1);

    // Click on Quantity cell
    const qtyCell = lastRow.locator('[data-fieldname="qty"]');
    await qtyCell.click();

    // Wait for input to appear
    const input = qtyCell.locator('input, [contenteditable]');
    await input.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});

    // Clear and enter quantity
    await input.clear();
    await input.fill(String(quantity));

    // Blur to trigger calculation
    await input.blur();

    // Wait for recalculation
    await this.page.waitForTimeout(500);
  }

  async setRateInLastRow(rate) {
    const rows = this.page.locator('[data-fieldname="items"] .grid-row, [data-fieldname="items"] tr.grid-row');
    const rowCount = await rows.count();
    const lastRow = rows.nth(rowCount - 1);

    // Click on Rate cell
    const rateCell = lastRow.locator('[data-fieldname="rate"]');
    await rateCell.click();

    // Wait for input to appear
    const input = rateCell.locator('input, [contenteditable]');
    await input.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});

    // Clear and enter rate
    await input.clear();
    await input.fill(String(rate));

    // Blur to trigger calculation
    await input.blur();

    // Wait for recalculation
    await this.page.waitForTimeout(500);
  }

  async getItemFromLastRow() {
    const rows = this.page.locator('[data-fieldname="items"] .grid-row, [data-fieldname="items"] tr.grid-row');
    const rowCount = await rows.count();
    const lastRow = rows.nth(rowCount - 1);

    const itemCodeCell = lastRow.locator('[data-fieldname="item_code"]');
    const input = itemCodeCell.locator('input, [contenteditable]');

    // Try to read from input first (edit mode)
    try {
      const inputValue = await input.inputValue().catch(() => null);
      if (inputValue) return inputValue;
    } catch {}

    // Fallback to displayed text
    const displayText = await itemCodeCell.textContent();
    return displayText?.trim() || null;
  }

  async getQuantityFromLastRow() {
    const rows = this.page.locator('[data-fieldname="items"] .grid-row, [data-fieldname="items"] tr.grid-row');
    const rowCount = await rows.count();
    const lastRow = rows.nth(rowCount - 1);

    const qtyCell = lastRow.locator('[data-fieldname="qty"]');
    const input = qtyCell.locator('input, [contenteditable]');

    // Try to read from input first (edit mode)
    try {
      const inputValue = await input.inputValue().catch(() => null);
      if (inputValue) return inputValue;
    } catch {}

    // Fallback to displayed text
    const displayText = await qtyCell.textContent();
    return displayText?.trim() || null;
  }

  async getRateFromLastRow() {
    const rows = this.page.locator('[data-fieldname="items"] .grid-row, [data-fieldname="items"] tr.grid-row');
    const rowCount = await rows.count();
    const lastRow = rows.nth(rowCount - 1);

    const rateCell = lastRow.locator('[data-fieldname="rate"]');
    const input = rateCell.locator('input, [contenteditable]');

    // Try to read from input first (edit mode)
    try {
      const inputValue = await input.inputValue().catch(() => null);
      if (inputValue) return inputValue;
    } catch {}

    // Fallback to displayed text
    const displayText = await rateCell.textContent();
    return displayText?.trim() || null;
  }

  async getAmountFromLastRow() {
    const rows = this.page.locator('[data-fieldname="items"] .grid-row, [data-fieldname="items"] tr.grid-row');
    const rowCount = await rows.count();
    const lastRow = rows.nth(rowCount - 1);

    const amountCell = lastRow.locator('[data-fieldname="amount"]');
    if (await amountCell.count() === 0) {
      // Amount column might not be visible, fall back to rate * qty
      return null;
    }

    const input = amountCell.locator('input, [contenteditable]');

    // Try to read from input first
    try {
      const inputValue = await input.inputValue().catch(() => null);
      if (inputValue) return inputValue;
    } catch {}

    // Fallback to displayed text
    const displayText = await amountCell.textContent();
    return displayText?.trim() || null;
  }

  // ==================== FORM ACTIONS ====================

  async save() {
    const saveButton = this.page.locator('button[data-label="Save"], .primary-action:has-text("Save")').first();
    await saveButton.click();

    // Wait for save to complete
    // Look for "Not Saved" to disappear or "Saved" indication to appear
    const notSavedBadge = this.page.locator('text=Not Saved');
    await notSavedBadge.waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {
      // If no "Not Saved" badge, that's ok
    });

    // Wait for any save-related UI updates to settle
    await this.page.waitForTimeout(500);
  }

  async getStatus() {
    // Check for docstatus or other status indicators
    const docStatus = this.page.locator('[data-docstatus]');
    const statusValue = await docStatus.getAttribute('data-docstatus').catch(() => '0');

    if (statusValue === '0') return 'Draft';
    if (statusValue === '1') return 'Submitted';
    if (statusValue === '2') return 'Cancelled';
    return 'Unknown';
  }

  async verifyFormNotSaved() {
    // Check if "Not Saved" badge is visible
    const notSavedBadge = this.page.locator('text=Not Saved');
    return await notSavedBadge.isVisible();
  }

  // ==================== VERIFICATION ====================

  async verifyCustomerPersisted(expectedCustomer) {
    // After save, customer should be persisted in display text
    const customerField = this.page.locator('[data-fieldname="customer"]');
    const displayText = await customerField.textContent();
    return displayText?.includes(expectedCustomer) || false;
  }

  async verifyItemPersisted(expectedItem) {
    const rows = this.page.locator('[data-fieldname="items"] .grid-row, [data-fieldname="items"] tr.grid-row');
    const rowCount = await rows.count();
    if (rowCount === 0) return false;

    const lastRow = rows.nth(rowCount - 1);
    const itemCodeCell = lastRow.locator('[data-fieldname="item_code"]');
    const displayText = await itemCodeCell.textContent();

    return displayText?.includes(expectedItem) || false;
  }

  async takeScreenshot(filename) {
    await this.page.screenshot({ path: `${filename}.png`, fullPage: true });
  }
}
