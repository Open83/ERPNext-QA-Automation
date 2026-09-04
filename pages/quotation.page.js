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
    this.baseURL = process.env.ERP_BASE_URL;
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
    await partyNameField.waitFor({ state: 'visible', timeout: 10000 });

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
    await this.page.locator('[data-fieldname="items"] .grid-row, [data-fieldname="items"] tr.grid-row').nth(currentRowCount).waitFor({ state: 'visible', timeout: 10000 });

    return currentRowCount;
  }

  async selectItemInLastRow(itemCode) {
    // Get the last grid row
    const rows = this.page.locator('[data-fieldname="items"] .grid-row, [data-fieldname="items"] tr.grid-row');
    const rowCount = await rows.count();
    const lastRow = rows.nth(rowCount - 1);

    // Click on Item Code input directly (not container)
    const itemInput = lastRow.locator('input[data-fieldname="item_code"]').first();

    // Click to activate edit mode
    await itemInput.click();

    // Wait for input to be visible and ready
    await itemInput.waitFor({ state: 'visible', timeout: 10000 });

    // Clear existing value
    await itemInput.clear();

    // Use keyboard input (not fill) to trigger Frappe's autocomplete event handlers
    // Frappe's awesomplete library relies on keyboard events (keyup, input) to show the dropdown
    await itemInput.type(itemCode, { delay: 50 });

    // Wait for listbox to be present (autocomplete rendering)
    await this.page.locator('[role="listbox"]').first().waitFor({ state: 'attached', timeout: 10000 });

    // Use keyboard navigation to select the first option
    // ArrowDown moves to first option, Enter confirms selection
    await itemInput.press('ArrowDown');
    await itemInput.press('Enter');

    // Wait for dropdown to close and selection to settle
    await this.page.waitForTimeout(500);
  }

  async setQuantityInLastRow(quantity) {
    // Close any modal that might have appeared
    await this.closeModal();

    const rows = this.page.locator('[data-fieldname="items"] .grid-row, [data-fieldname="items"] tr.grid-row');
    const rowCount = await rows.count();
    const lastRow = rows.nth(rowCount - 1);

    // Click on Quantity input directly
    const qtyInput = lastRow.locator('input[data-fieldname="qty"]').first();

    // Click to activate edit mode
    await qtyInput.click();

    // Wait for input to be visible and ready
    await qtyInput.waitFor({ state: 'visible', timeout: 10000 });

    // Clear and fill with quantity
    await qtyInput.clear();
    await qtyInput.fill(String(quantity));

    // Blur to trigger calculation and commit value
    await qtyInput.blur();

    // Wait for calculation to complete
    await this.page.waitForTimeout(500);
  }

  async setRateInLastRow(rate) {
    // Close any modal that might have appeared
    await this.closeModal();

    const rows = this.page.locator('[data-fieldname="items"] .grid-row, [data-fieldname="items"] tr.grid-row');
    const rowCount = await rows.count();
    const lastRow = rows.nth(rowCount - 1);

    // Click on Rate input directly
    const rateInput = lastRow.locator('input[data-fieldname="rate"]').first();

    // Click to activate edit mode
    await rateInput.click();

    // Wait for input to be visible and ready
    await rateInput.waitFor({ state: 'visible', timeout: 10000 });

    // Clear and fill with rate
    await rateInput.clear();
    await rateInput.fill(String(rate));

    // Blur to trigger calculation and commit value
    await rateInput.blur();

    // Wait for calculation to complete
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
