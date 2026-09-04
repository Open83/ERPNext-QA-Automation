/**
 * Page Object for ERPNext Material Request
 * Encapsulates reusable interactions with Material Request form
 */

export class MaterialRequestPage {
  constructor(page, baseURL) {
    this.page = page;
    this.baseURL = baseURL;
  }

  /**
   * Navigate to new Material Request form
   */
  async goToNew() {
    await this.page.goto(`${this.baseURL}/app/material-request/new`, {
      waitUntil: 'domcontentloaded',
      timeout: 15000,
    });

    // Verify not redirected to login
    if (this.page.url().includes('/login')) {
      throw new Error('Redirected to login page - authentication may have failed');
    }
  }

  /**
   * Wait for Material Request form to be fully loaded
   */
  async waitForFormReady() {
    // Wait for form container
    const formContainer = this.page.locator('[data-doctype="Material Request"]').first();
    await formContainer.waitFor({ state: 'visible', timeout: 10000 });

    // Wait for Add Row button
    const addRowButton = this.page.locator('button:has-text("Add Row")').first();
    await addRowButton.waitFor({ state: 'visible', timeout: 10000 });
  }

  /**
   * Add a new item row to the Material Request
   */
  async addItemRow() {
    const addRowButton = this.page.locator('button:has-text("Add Row")').first();
    await addRowButton.click();

    // Wait for new row to appear
    const itemsGrid = this.page.locator('[data-fieldname="items"]').first();
    const rows = itemsGrid.locator('.grid-row');
    const rowCount = await rows.count();

    // Wait for the newly added row to be visible
    const newRow = rows.nth(rowCount - 1);
    await newRow.waitFor({ state: 'visible', timeout: 5000 });
  }

  /**
   * Select an item via autocomplete in the first empty row
   * Returns the selected item code
   */
  async selectItemInLastRow(searchText) {
    // Get the last row (most recently added)
    const itemsGrid = this.page.locator('[data-fieldname="items"]').first();
    const rows = itemsGrid.locator('.grid-row');
    const lastRowIndex = (await rows.count()) - 1;
    const lastRow = rows.nth(lastRowIndex);

    // Get the Item Code input field in the last row
    const itemCodeInput = lastRow.locator('input[data-fieldname="item_code"]').first();

    // Click to activate edit mode
    await itemCodeInput.click();

    // Wait for input to be visible and ready
    await itemCodeInput.waitFor({ state: 'visible', timeout: 10000 });

    // Clear existing value
    await itemCodeInput.clear();

    // Use keyboard input to trigger Frappe's autocomplete event handlers
    // Frappe's awesomplete library relies on keyboard events to show the dropdown
    await itemCodeInput.type(searchText, { delay: 50 });

    // Wait for listbox to be present (autocomplete rendering)
    await this.page.locator('[role="listbox"]').first().waitFor({ state: 'attached', timeout: 10000 });

    // Use keyboard navigation to select the first option
    // ArrowDown moves to first option, Enter confirms selection
    await itemCodeInput.press('ArrowDown');

    // Get the selected item text from the now-focused option
    const selectedOption = this.page.locator('[role="option"][aria-selected="true"]').first();
    const selectedItemText = await selectedOption.textContent();
    console.log(`Selecting item: ${selectedItemText?.trim()}`);

    // Confirm selection with Enter
    await itemCodeInput.press('Enter');

    // Wait for dropdown to close and selection to settle
    await this.page.waitForTimeout(500);

    // Return the selected item value (extract from displayed text)
    return selectedItemText?.split(',')[0]?.trim() || selectedItemText?.trim();
  }

  /**
   * Get the item code value from a row (reads from displayed cell, not input)
   * Works after edit mode - when value is displayed
   */
  async getItemCodeFromLastRow() {
    const itemsGrid = this.page.locator('[data-fieldname="items"]').first();
    const rows = itemsGrid.locator('.grid-row');
    const lastRowIndex = (await rows.count()) - 1;
    const lastRow = rows.nth(lastRowIndex);

    const itemCodeCell = lastRow.locator('[data-fieldname="item_code"]').first();

    // Try to read from input if still in edit mode
    try {
      const input = itemCodeCell.locator('input').first();
      const isVisible = await input.isVisible({ timeout: 1000 });
      if (isVisible) {
        return await input.inputValue();
      }
    } catch {
      // Not in edit mode, read from displayed text
    }

    // Read from the cell's displayed text (after edit mode ends)
    const cellText = await itemCodeCell.textContent();
    return cellText?.trim() || '';
  }

  /**
   * Set quantity in the last row
   */
  async setQuantityInLastRow(quantity) {
    const itemsGrid = this.page.locator('[data-fieldname="items"]').first();
    const rows = itemsGrid.locator('.grid-row');
    const lastRowIndex = (await rows.count()) - 1;
    const lastRow = rows.nth(lastRowIndex);

    const qtyField = lastRow.locator('[data-fieldname="qty"]').first();
    await qtyField.waitFor({ state: 'visible', timeout: 5000 });

    // Click to enter edit mode
    await qtyField.click();

    // Find and fill input
    try {
      const input = qtyField.locator('input').first();
      await input.waitFor({ state: 'visible', timeout: 2000 });
      await input.fill(quantity.toString());
      await input.blur();
    } catch {
      // Fallback
      await qtyField.type(quantity.toString(), { delay: 50 });
    }

    // Wait for update
    await this.page.waitForTimeout(200);
  }

  /**
   * Get quantity from last row (reads displayed value)
   */
  async getQuantityFromLastRow() {
    const itemsGrid = this.page.locator('[data-fieldname="items"]').first();
    const rows = itemsGrid.locator('.grid-row');
    const lastRowIndex = (await rows.count()) - 1;
    const lastRow = rows.nth(lastRowIndex);

    const qtyField = lastRow.locator('[data-fieldname="qty"]').first();

    // Try input first
    try {
      const input = qtyField.locator('input').first();
      const isVisible = await input.isVisible({ timeout: 1000 });
      if (isVisible) {
        return parseFloat(await input.inputValue());
      }
    } catch {
      // Not in edit mode
    }

    // Read from displayed text
    const cellText = await qtyField.textContent();
    return parseFloat(cellText?.trim() || '0');
  }

  /**
   * Verify Item Code field contains a value
   */
  async verifyItemCodeSelected() {
    const itemCode = await this.getItemCodeFromLastRow();
    if (!itemCode || itemCode === '' || itemCode === 'Item Code') {
      throw new Error(`Item code not selected or still empty: "${itemCode}"`);
    }
    return itemCode;
  }

  /**
   * Take screenshot for evidence
   */
  async takeScreenshot(filename) {
    await this.page.screenshot({ path: filename });
  }
}
