/**
 * SALES ORDER PAGE OBJECT
 *
 * Encapsulates business interactions with Sales Order form
 * Reuses proven patterns from Quotation
 * Sales Order is the next step after Quotation in sales workflow
 */

export class SalesOrderPage {
  constructor(page) {
    this.page = page;
    this.baseURL = process.env.BASE_URL || 'https://asif-erpnext-qa.m.frappe.cloud';
  }

  // ==================== NAVIGATION ====================

  async openNewSalesOrder() {
    await this.page.goto(`${this.baseURL}/app/sales-order/new`, { waitUntil: 'domcontentloaded', timeout: 15000 });
  }

  async openSalesOrderList() {
    await this.page.goto(`${this.baseURL}/app/sales-order`, { waitUntil: 'domcontentloaded', timeout: 15000 });
  }

  // ==================== FORM READINESS ====================

  async closeModal() {
    const modal = this.page.locator('[role="dialog"].modal.show, .modal.show').first();

    if (await modal.isVisible().catch(() => false)) {
      const closeBtn = modal.locator('button.close, [aria-label="Close"], .btn-close').first();

      if (await closeBtn.isVisible().catch(() => false)) {
        await closeBtn.click();
        await this.page.waitForTimeout(300);
      } else {
        await this.page.keyboard.press('Escape');
        await this.page.waitForTimeout(300);
      }

      const stillVisible = await modal.isVisible().catch(() => false);
      if (stillVisible) {
        await this.page.click('body', { position: { x: 100, y: 100 } });
        await this.page.waitForTimeout(300);
      }
    }
  }

  async waitForFormReady(timeout = 10000) {
    const formContainer = this.page.locator('[data-doctype="Sales Order"]');
    try {
      await formContainer.waitFor({ state: 'visible', timeout });
    } catch {
      // Form may still be loading
    }

    const saveButton = this.page.locator('button[data-label="Save"], .primary-action:has-text("Save")').first();
    await saveButton.waitFor({ state: 'visible', timeout: 8000 });

    await this.closeModal();
  }

  // ==================== CUSTOMER SELECTION ====================

  async setCustomer(customerName) {
    // Find customer_name field (Sales Order uses customer_name, not party_name)
    const customerField = this.page.locator('[data-fieldname="customer"]').first();

    await customerField.waitFor({ state: 'visible', timeout: 5000 });

    const input = customerField.locator('input').first();

    await input.click();
    await this.page.waitForTimeout(300);

    await input.fill(customerName);

    const autocompleteOption = this.page.locator('[role="option"]:has-text("' + customerName + '")').first();
    try {
      await autocompleteOption.waitFor({ state: 'visible', timeout: 3000 });
      await autocompleteOption.click();
    } catch {
      await input.press('Enter');
    }

    await this.page.waitForTimeout(500);
    await this.closeModal();
  }

  // ==================== ITEMS GRID ====================

  async addItemRow() {
    const addRowBtn = this.page.locator('button:has-text("Add row")').first();

    let attempts = 0;
    while (attempts < 5) {
      try {
        await addRowBtn.click({ timeout: 2000 });
        break;
      } catch (e) {
        await this.closeModal();
        await this.page.waitForTimeout(300);
        attempts++;
        if (attempts >= 5) throw e;
      }
    }

    await this.page.waitForTimeout(500);
  }

  async selectItemInLastRow(itemCode) {
    const itemRows = this.page.locator('[data-fieldname="items"] .data-row.editable-row');
    const rowCount = await itemRows.count();
    const lastRow = itemRows.nth(rowCount - 1);

    const itemInput = lastRow.locator('input[data-fieldname="item_code"]').first();
    await itemInput.click();
    await this.page.waitForTimeout(300);

    await itemInput.fill(itemCode);
    await this.page.waitForTimeout(500);

    const itemOption = this.page.locator(`[role="option"]`).first();
    if (await itemOption.isVisible().catch(() => false)) {
      await itemOption.click();
    } else {
      await itemInput.press('Enter');
    }

    await this.page.waitForTimeout(500);
  }

  async setQuantityInLastRow(quantity) {
    const itemRows = this.page.locator('[data-fieldname="items"] .data-row.editable-row');
    const rowCount = await itemRows.count();
    const lastRow = itemRows.nth(rowCount - 1);

    const qtyInput = lastRow.locator('input[data-fieldname="qty"]').first();
    if (await qtyInput.count() > 0) {
      await qtyInput.click();
      await this.page.waitForTimeout(300);
      await qtyInput.clear();
      await qtyInput.fill(String(quantity));
      await qtyInput.blur();
      await this.page.waitForTimeout(300);
    }
  }

  async setRateInLastRow(rate) {
    const itemRows = this.page.locator('[data-fieldname="items"] .data-row.editable-row');
    const rowCount = await itemRows.count();
    const lastRow = itemRows.nth(rowCount - 1);

    const rateInput = lastRow.locator('input[data-fieldname="rate"]').first();
    if (await rateInput.count() > 0) {
      await rateInput.click();
      await this.page.waitForTimeout(300);
      await rateInput.clear();
      await rateInput.fill(String(rate));
      await rateInput.blur();
      await this.page.waitForTimeout(300);
    }
  }

  // ==================== SAVE ====================

  async save() {
    const saveBtn = this.page.locator('button[data-label="Save"], .primary-action:has-text("Save")').first();

    if (await this.page.locator('[role="dialog"].modal.show').isVisible().catch(() => false)) {
      await this.closeModal();
    }

    await saveBtn.waitFor({ state: 'visible', timeout: 3000 });

    let saveSuccess = false;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        await saveBtn.click({ timeout: 1000 });
        saveSuccess = true;
        break;
      } catch (e) {
        await this.page.waitForTimeout(500);
      }
    }

    await this.page.waitForURL(/\/sales-order\/[^/]+$/, { timeout: 10000 }).catch(() => {});
    await this.page.waitForTimeout(1000);
  }
}
