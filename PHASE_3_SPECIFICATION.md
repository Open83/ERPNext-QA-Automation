# PHASE 3 SPECIFICATION — Quotation Module Vertical Slice

**Status:** SPECIFICATION COMPLETE - Ready for Implementation  
**Target Module:** Quotation (Selling)  
**Rationale:** High business value, accessible, shares patterns with Material Request

---

## DOMAIN ANALYSIS

### Quotation in ERPNext Business Flow

```
Customer → Lead → Opportunity → Quotation → Sales Order → Delivery → Invoice
```

**Quotation Position:** Quote stage of sales process. Customer-facing document for pricing.

### Expected Form Structure

**Header Fields:**
- Quotation ID (auto-generated)
- Customer (required)
- Quote Date / Valid Till
- Transaction Date
- Company
- Price List
- Delivery/Billing Address fields
- Status (Draft, Submitted)

**Items Grid:**
- Item Code (link to Item Master)
- Item Name
- Description
- Qty (required)
- Unit of Measure (UOM)
- Rate
- Amount (Qty × Rate, calculated)
- Warehouse (if stock tracked)
- Discount

**Footer:**
- Subtotal
- Tax calculations (if applicable)
- Grand Total
- Save/Submit buttons

### Key Differences from Material Request

| Aspect | Material Request | Quotation |
|--------|---|---|
| Primary Subject | What to buy | Price to customer |
| Key Entity | Warehouse/Items | Customer |
| Customer Field | None | Required |
| Rate Field | Optional/manual | Expected (pricing) |
| Tax Handling | Basic | More complex |
| Submit Workflow | Yes | Yes |
| Common Next Step | PO | Sales Order |

---

## IMPLEMENTATION SCOPE

### Pages Object: QuotationPage

**File Location:** `pages/quotation.page.js`

**Methods to Implement:**

```javascript
class QuotationPage {
  // Navigation
  async goToNew()
  async goToList()
  
  // Form Management
  async waitForFormReady()
  async getFormStatus()
  
  // Customer Management
  async setCustomer(customerName)
  async getCustomer()
  
  // Items Grid (reuse Material Request patterns)
  async addItemRow()
  async selectItemInLastRow(searchText)
  async setQuantityInLastRow(qty)
  async setRateInLastRow(rate)
  async getItemFromLastRow()
  async getQuantityFromLastRow()
  async getRateFromLastRow()
  async getAmountFromLastRow()
  
  // Form Actions
  async save()
  async submit()
  async getStatus()
  
  // Verification
  async verifyItemPersisted()
  async verifyAmountCalculation()
  
  // Screenshot
  async takeScreenshot(filename)
}
```

### Test Scenarios

**Test 1: Create Quotation with Single Item**
```javascript
test('Create and save Quotation with customer and item', async (...) => {
  // Navigate
  // Select customer
  // Add item
  // Set quantity
  // Verify amount calculated
  // Save
  // Verify persistence
})
```

**Test 2: Multiple Items Workflow**
```javascript
test('Add multiple items to Quotation', async (...) => {
  // Create quotation
  // Add item 1, qty 10
  // Add item 2, qty 5
  // Verify both items persisted
  // Verify total amount
})
```

**Test 3: Validation - Missing Customer**
```javascript
test('Quotation save fails without customer', async (...) => {
  // Try to save without customer selection
  // Expect error
  // Verify error message
})
```

### Test Data

**File:** `data/quotation.data.js`

```javascript
export const QUOTATION_SCENARIOS = {
  simple: {
    customer: 'Acme Inc',  // Known customer
    item: 'Item-001',      // Existing item
    quantity: 10,
    rate: 100,
  },
  multi_item: {
    customer: 'Acme Inc',
    items: [
      { code: 'Item-001', qty: 5 },
      { code: 'Item-002', qty: 10 }
    ]
  },
  bulk: {
    customer: 'Acme Inc',
    item: 'Item-001',
    quantity: 100,
    discount: 10  // If supported
  }
};
```

---

## REUSABLE PATTERNS FROM MATERIAL REQUEST

### Patterns to Reuse

1. **Grid Row Management**
   - `trackRowCount()` for identifying new rows
   - Row-scoped locators instead of grid-global selectors

2. **Dual-Mode Value Reading**
   - Try input first, fallback to displayed text
   - Handle edit vs. display mode gracefully

3. **Autocomplete Selection**
   - Click field to activate
   - Type search text
   - Wait for dropdown
   - Click option
   - Wait for dropdown to close

4. **Form Readiness**
   - Check for form container with data-doctype
   - Verify key buttons visible before testing

5. **Persistence Verification**
   - After blur/save, read from cell display
   - Avoid assumptions about input element presence

### New Patterns for Quotation

1. **Customer Selection**
   - Link field vs. autocomplete (might be different UI)
   - Validation required vs. optional

2. **Amount Calculation**
   - Verify Qty × Rate formula
   - Check decimal handling

3. **Status Transitions**
   - Draft → Submitted state change
   - Button availability based on status

---

## TEST RESULTS EXPECTATIONS

### Success Criteria

✅ All Material Request tests still pass (regression check)  
✅ Quotation tests pass 3 consecutive runs (stability)  
✅ No flakiness or timing issues  
✅ Total execution time < 2 minutes for full suite  

### What Gets Tested

**UI/E2E Level:**
- Create Quotation form accessibility
- Customer selection
- Item selection and autocomplete
- Quantity entry and persistence
- Rate entry and amount calculation
- Save functionality
- Form data persistence after save

**Validation Level:**
- Missing customer error
- Missing item error
- Invalid quantity handling

**What's NOT Tested (by design)**
- Submit workflow (safe to defer if submit has complex state transitions)
- Discount calculations
- Tax calculations
- Approval workflows
- Permission-based access

---

## DOCUMENTATION UPDATES

### Update COVERAGE.md

Add Quotation to module matrix:

| Module | Workflow | UI | API | Validation | Authorization | E2E | Status |
|--------|---|---|---|---|---|---|---|
| Quotation | Create + add item + verify amount | ✅ | ❌ | ✅ | ❌ | ✅ | IMPLEMENTED |

Add to Coverage Summary:
- Quotation: 3 tests (create, multi-item, validation)
- Total Material Request: 2 tests (existing)
- Total: 5 UI tests, 2 validation tests

### Update PROJECT_VISION.md

Add to Implemented Modules:
- ✅ Quotation (Selling) — Customer selection, item grid, amount calculation

---

## TIMELINE

**Discovery Complete:** ✅  
**Specification Complete:** ✅  
**Implementation:**
- Page Object: ~1 hour
- Tests: ~1 hour
- Stability verification: ~20 minutes
- Documentation: ~30 minutes

**Total Estimated:** 3-4 hours

---

## PHASE 3 COMPLETION CRITERIA

✅ Quotation Page Object created  
✅ 3+ test scenarios implemented  
✅ 1+ validation test added  
✅ All tests pass 3 consecutive runs  
✅ Material Request regression verified  
✅ Documentation updated  
✅ No sensitive data exposed  
✅ Git status clean (no commits yet)

---

## BLOCKERS / RISKS

### Form Loading
Quotation form has delayed loading in discovery test. Solution: Use proper wait strategies (field visibility, form container verification).

### Customer Selection
Unknown if Customer field uses autocomplete (like Item) or link picker. Solution: Inspect UI, adapt Page Object accordingly.

### Grid Column Config
Rate/Amount may not be visible by default (like Material Request). Solution: May need to verify column configuration or switch to API testing for calculation validation.

### Calculation Precision
ERPNext uses decimal.Decimal for calculations. Need to verify rounding behavior in tests.

---

## SUCCESS METRICS

**Code Quality:**
- Page Object pattern applied consistently
- Tests describe business behavior, not DOM manipulation
- No hardcoded selectors without rationale

**Coverage:**
- 2+ workflow scenarios
- 1+ validation scenario
- Stability: 100% pass rate across 3 runs

**Portfolio Value:**
- Demonstrates multi-module capability
- Shows pattern reuse and architecture scalability
- Proves ability to expand automation suite

---

This specification is ready for implementation. Proceed with:
1. Building QuotationPage
2. Implementing test scenarios
3. Adding validation tests
4. Running stability verification

