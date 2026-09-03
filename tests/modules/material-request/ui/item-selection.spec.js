import { test, expect } from '@playwright/test';
import { MaterialRequestPage } from '../../../../pages/material-request.page.js';

test('User can select an Item Code in a Material Request', async ({ page, baseURL }) => {
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

  await test.step('Verify item is retained in the grid', async () => {
    const itemCode = await mr.verifyItemCodeSelected();
    expect(itemCode).not.toBe('');
    expect(itemCode).not.toBe('Item Code');
    console.log(`Item persisted in grid: ${itemCode}`);
  });

  await test.step('Capture screenshot as evidence', async () => {
    await mr.takeScreenshot('material-request-item-selected.png');
  });
});
