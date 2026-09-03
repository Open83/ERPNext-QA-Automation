import { test, expect } from '@playwright/test';
import { MaterialRequestPage } from '../../../../pages/material-request.page.js';

test('Material Request workflow - add item with quantity', async ({ page, baseURL }) => {
  const mr = new MaterialRequestPage(page, baseURL);

  await test.step('Navigate to new Material Request form', async () => {
    await mr.goToNew();
  });

  await test.step('Wait for form to be ready', async () => {
    await mr.waitForFormReady();
  });

  await test.step('Add a new item row', async () => {
    await mr.addItemRow();
  });

  await test.step('Select an item via autocomplete', async () => {
    const selectedItem = await mr.selectItemInLastRow('Item');
    expect(selectedItem).toBeTruthy();
    console.log(`Item selected: ${selectedItem}`);
  });

  await test.step('Verify item was retained after selection', async () => {
    const itemCode = await mr.getItemCodeFromLastRow();
    expect(itemCode).not.toBe('');
    expect(itemCode).not.toBe('Item Code');
    console.log(`Item in grid: ${itemCode}`);
  });

  await test.step('Set quantity to 10', async () => {
    await mr.setQuantityInLastRow(10);
  });

  await test.step('Verify quantity was set', async () => {
    const qty = await mr.getQuantityFromLastRow();
    expect(qty).toBeGreaterThan(9);
    expect(qty).toBeLessThan(11);
    console.log(`Quantity in grid: ${qty}`);
  });

  await test.step('Capture screenshot as evidence', async () => {
    await mr.takeScreenshot('material-request-workflow.png');
  });
});
