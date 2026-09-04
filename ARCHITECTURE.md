# ERPNext QA Automation — Architecture

## Overview

This is a **Page Object Model (POM)** based Playwright automation framework for ERPNext, organized by **module first**, then by **test type**.

**Current Implementation:**
- 6 active tests across 3 modules (Material Request, Quotation, Sales Order)
- 100% passing with zero flakiness
- ~90 seconds execution time

---

## Actual Repository Structure

```
ERPNext-QA-Automation/
├── README.md                          # Project overview
├── COVERAGE.md                        # Coverage matrix
├── ARCHITECTURE.md                    # This file
├── package.json                       # Dependencies and scripts
├── playwright.config.js               # Playwright configuration
├── .env.example                       # Environment template
├── .gitignore                         # Git ignore rules
│
├── .github/
│   └── workflows/
│       └── playwright.yml             # GitHub Actions CI configuration
│
├── tests/
│   ├── auth/
│   │   └── auth.setup.js              # Authentication setup (runs once per session)
│   │
│   └── modules/                       # Tests organized by ERPNext module
│       ├── material-request/
│       │   ├── ui/
│       │   │   ├── calculations.spec.js     # Calculate amount (Qty × Rate)
│       │   │   └── item-selection.spec.js   # Select item via autocomplete
│       │   ├── api/                        # (Empty - planned)
│       │   └── fixtures/                   # (Empty - planned)
│       │
│       ├── quotation/
│       │   ├── ui/
│       │   │   ├── quotation-workflow.spec.js  # Create → Customer → Item → Qty → Rate → Save
│       │   │   └── validation.spec.js          # Required field validation
│       │   ├── api/                            # (Empty - planned)
│       │   └── fixtures/                       # (Empty - planned)
│       │
│       └── sales-order/
│           ├── ui/
│           │   └── sales-order-workflow.spec.js   # Create → Customer → Item → Qty → Rate → Save
│           ├── api/                              # (Empty - planned)
│           └── fixtures/                         # (Empty - planned)
│
├── pages/                             # Page Object Model layer
│   ├── material-request.page.js       # MaterialRequestPage class
│   ├── quotation.page.js              # QuotationPage class
│   └── sales-order.page.js            # SalesOrderPage class
│
└── data/                              # Test data (fixtures)
    ├── quotation.data.js              # Quotation test scenarios
    ├── sales-order.data.js            # Sales Order test scenarios
    └── material-request/              # (Empty - planned)
```

---

## Architecture Layers

### 1. Test Layer (`tests/`)

Tests are **organized by module first**, then by test type:

```
tests/
  ├── auth/                ← Setup (common to all tests)
  └── modules/             ← Business modules
      ├── material-request/
      │   └── ui/          ← UI automation tests
      ├── quotation/
      │   └── ui/
      └── sales-order/
          └── ui/
```

**Benefits:**
- Scales better as more modules are added
- Aligns with ERPNext's module structure
- Easy to find tests for a specific module
- Clear separation between test types (UI, API, etc.)

### 2. Page Object Model (`pages/`)

Each module has a dedicated **Page Object** class:

```javascript
// pages/quotation.page.js
export class QuotationPage {
  constructor(page) {
    this.page = page;
    this.baseURL = process.env.ERP_BASE_URL;
  }

  // Business-level methods
  async openNewQuotation() { ... }
  async setCustomer(name) { ... }
  async addItemRow() { ... }
  async selectItemInLastRow(code) { ... }
  async setQuantityInLastRow(qty) { ... }
  async save() { ... }
}
```

**Benefits:**
- Tests read like business scenarios, not UI instructions
- UI changes don't break test logic
- Reusable across multiple tests
- Clear separation of concerns

### 3. Test Data Layer (`data/`)

Centralized test data:

```javascript
// data/quotation.data.js
export const QUOTATION_TEST_DATA = {
  scenarios: {
    simple: {
      customer: 'Asif QA Demo Customer',
      item: 'SKU004',
      quantity: 10,
      rate: 500,
    },
  },
};
```

---

## Key Patterns

### Pattern 1: Real Keyboard Input for Autocomplete

**Challenge:** Frappe's autocomplete requires keyboard events, not just DOM filling.

**Solution:**
```javascript
// Uses type() with delay to trigger keyboard events
await itemInput.type(searchText, { delay: 50 });

// Wait for listbox to attach
await this.page.locator('[role="listbox"]').first()
  .waitFor({ state: 'attached', timeout: 10000 });

// Use keyboard navigation
await itemInput.press('ArrowDown');
await itemInput.press('Enter');
```

### Pattern 2: Deterministic Waits

**Challenge:** Arbitrary timeouts cause flakiness and false passes.

**Solution:** Wait for actual state changes:
```javascript
// Wait for element to be visible
await itemInput.waitFor({ state: 'visible', timeout: 10000 });

// Wait for listbox to be present in DOM
await listbox.waitFor({ state: 'attached', timeout: 10000 });

// Do NOT use arbitrary sleep
// ❌ await page.waitForTimeout(300); // Only for settling after real action
```

### Pattern 3: Modal Dialog Management

**Challenge:** "Getting Started" modal blocks form interactions.

**Solution:** Robust modal closing with retries:
```javascript
async closeModal() {
  const modal = this.page.locator('[role="dialog"].modal.show').first();

  if (await modal.isVisible().catch(() => false)) {
    // Try close button first
    const closeBtn = modal.locator('button.close').first();
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
    } else {
      // Fallback to Escape key
      await this.page.keyboard.press('Escape');
    }

    // Verify modal is gone
    if (await modal.isVisible()) {
      // Last resort: click outside
      await this.page.click('body', { position: { x: 100, y: 100 } });
    }
  }
}
```

### Pattern 4: Grid Synchronization

**Challenge:** Grid operates in two states (edit/display). Input disappears on blur.

**Solution:** Try input first, fallback to displayed text:
```javascript
async getItemFromLastRow() {
  // Try to read from input (edit mode)
  try {
    const input = itemCell.locator('input').first();
    const isVisible = await input.isVisible({ timeout: 1000 });
    if (isVisible) {
      return await input.inputValue();
    }
  } catch { }

  // Fallback to displayed text (display mode)
  const text = await itemCell.textContent();
  return text?.trim() || null;
}
```

---

## Test Execution Flow

```
Test Script
    ↓
Page Object (business methods)
    ↓
Playwright Locators (find elements)
    ↓
ERPNext UI
    ↓
Assertions (verify behavior)
    ↓
Test Result
```

### Example: Quotation Workflow Test

```javascript
// tests/modules/quotation/ui/quotation-workflow.spec.js
test('Complete Quotation workflow', async ({ page }) => {
  const quotationPage = new QuotationPage(page);

  // Business-level actions (Page Object methods)
  await quotationPage.openNewQuotation();
  await quotationPage.setCustomer('Asif QA Demo Customer');
  await quotationPage.addItemRow();
  await quotationPage.selectItemInLastRow('SKU004');
  await quotationPage.setQuantityInLastRow(10);
  await quotationPage.setRateInLastRow(500);
  await quotationPage.save();

  // Verify business outcome
  expect(isSaved).toBeTruthy();
});
```

---

## Configuration

### Playwright Configuration (`playwright.config.js`)

```javascript
export default defineConfig({
  testDir: './tests',
  timeout: 60000,              // 60s per test (higher for slower CI)
  fullyParallel: false,         // Run tests sequentially
  workers: 1,                   // Single worker (auth shared across tests)

  use: {
    baseURL: process.env.ERP_BASE_URL,
    headless: process.env.CI ? true : false,  // Headless in CI, headed locally
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
});
```

### Environment Variables

**Required:** `.env` (not tracked in git)
```
ERP_BASE_URL=https://your-instance.m.frappe.cloud
ERP_USER=your-email@example.com
ERP_PASSWORD=your-password
```

**Template:** `.env.example` (tracked, no real credentials)

---

## CI/CD Integration

### GitHub Actions Workflow

```yaml
name: Playwright Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    env:
      CI: true
      ERP_BASE_URL: ${{ secrets.ERP_BASE_URL }}
      ERP_USER: ${{ secrets.ERP_USER }}
      ERP_PASSWORD: ${{ secrets.ERP_PASSWORD }}

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm test
      - uses: actions/upload-artifact@v4
        if: ${{ !cancelled() }}
        with:
          name: playwright-report
          path: playwright-report/
```

---

## Stability & Performance

### Test Timing
- **Material Request**: 7-18s per run
- **Quotation**: 30-40s per run
- **Sales Order**: 14-24s per run
- **Total Suite**: ~90 seconds

### Reliability
- ✅ Zero flakiness detected
- ✅ Deterministic execution
- ✅ Multi-run verified stable

---

## Future Architecture (Not Yet Implemented)

These directories exist but are empty (planned for future phases):

```
tests/modules/*/api/          ← API testing layer (future)
tests/modules/*/fixtures/     ← Test fixtures (future)
data/material-request/        ← MR test data file (future)
```

### Planned Additions
- API testing layer (parallel to UI tests)
- Cross-module E2E workflows
- Additional modules (Purchase Order, Manufacturing, etc.)
- Performance testing
- Authorization/permission testing

---

## Summary

This architecture prioritizes:

1. **Clarity** - Business methods instead of UI details
2. **Maintainability** - Page Objects reduce duplication
3. **Scalability** - Module-first organization scales naturally
4. **Reliability** - Deterministic waits eliminate flakiness
5. **Honesty** - Clear documentation of what's implemented vs. planned

The framework is production-ready for portfolio demonstration and can be extended to additional modules following the same patterns.

---

**Last Updated:** 2026-09-04
**Status:** ✅ Active and Stable
