# Test Coverage Matrix

## Overview

This matrix documents all automated tests in the ERPNext QA suite. Current implementation: **6 active tests** across **3 modules** plus authentication infrastructure.

---

## Complete Test Matrix

| ID | Module | Scenario | Test File | Validation | Status |
|---|---|---|---|---|---|
| AUTH-001 | Infrastructure | Automated authentication and session setup | `tests/auth/auth.setup.js` | User login, session persistence to `.auth/user.json` | ✅ Stable |
| MR-001 | Material Request | Item selection via autocomplete | `tests/modules/material-request/ui/item-selection.spec.js` | Item code entry, autocomplete interaction, grid persistence | ✅ Stable |
| MR-002 | Material Request | Amount calculation (Qty × Rate) | `tests/modules/material-request/ui/calculations.spec.js` | Item selection, quantity input, rate input, amount calculation, save verification | ✅ Stable |
| QT-001 | Quotation | Complete workflow (Create → Customer → Item → Qty → Rate → Save) | `tests/modules/quotation/ui/quotation-workflow.spec.js` | Customer selection, item selection, quantity/rate entry, amount calculation, document persistence | ✅ Stable |
| QT-002 | Quotation | Required-field validation (Customer is mandatory) | `tests/modules/quotation/ui/validation.spec.js` | Customer field requirement, save blocking, validation badge display | ✅ Stable |
| SO-001 | Sales Order | Complete workflow (Create → Customer → Item → Qty → Rate → Save) | `tests/modules/sales-order/ui/sales-order-workflow.spec.js` | Customer selection, item selection, quantity/rate entry, amount calculation, document persistence | ✅ Stable |

---

## Test Detail

### AUTH-001: Automated Authentication

**Purpose:** Ensure that automated authentication works reliably for subsequent test execution.

**Scope:**
- User login via ERPNext API
- Session storage to `.auth/user.json`
- Session reuse across test runs

**Key Assertions:**
- Successful login (HTTP 200)
- Session file created
- Subsequent tests can reuse session

**Reliability:** ✅ Stable across 6+ executions

---

### MR-001: Material Request — Item Selection

**Purpose:** Validate that users can select items via autocomplete in Material Request grid.

**Scenario:**
1. Navigate to new Material Request form
2. Add item row to grid
3. Search and select item via autocomplete (Item: "Item")
4. Verify item persists in grid

**Key Assertions:**
- Item autocomplete dropdown appears
- Item selection succeeds
- Item code displays in grid after selection

**Automation Highlights:**
- Keyboard-driven autocomplete (type with delay)
- Listbox attachment detection
- ArrowDown + Enter navigation

**Reliability:** ✅ Stable after autocomplete synchronization fix

---

### MR-002: Material Request — Amount Calculation

**Purpose:** Validate that Material Request calculates amount correctly as Qty × Rate.

**Scenario:**
1. Create new Material Request
2. Add item row
3. Select item (Item: "SKU004")
4. Enter Qty: 10
5. Enter Rate: 500
6. Verify Amount: 5000
7. Save document

**Key Assertions:**
- Item selected successfully
- Quantity accepted
- Rate accepted
- Amount = 10 × 500 = 5000
- Document saved

**Automation Highlights:**
- Grid synchronization (read from input during edit, displayed text after)
- Calculation verification
- Persistence check via URL

**Reliability:** ✅ Stable

---

### QT-001: Quotation — Complete Workflow

**Purpose:** Validate end-to-end Quotation create/save workflow with all required fields.

**Scenario:**
1. Navigate to new Quotation form
2. Select customer: "Asif QA Demo Customer"
3. Add item row
4. Select item: "SKU004"
5. Enter Qty: 10
6. Enter Rate: 500
7. Verify Amount: 5000
8. Save document
9. Verify URL changed to saved state

**Key Assertions:**
- Form loads
- Customer selection succeeds
- Item selection succeeds
- Quantity/rate accepted
- Amount calculated (5000)
- Save completes
- URL changes from `/new` to `/{document-id}`

**Automation Highlights:**
- Modal dialog handling ("Getting Started" modal)
- Customer autocomplete
- Item autocomplete
- Grid state transitions
- URL-based persistence verification

**Reliability:** ✅ Stable (modal handling + keyboard navigation)

---

### QT-002: Quotation — Required-Field Validation

**Purpose:** Validate that Quotation enforces customer as required field.

**Scenario:**
1. Navigate to new Quotation form
2. Attempt save without customer
3. Verify save is blocked
4. Verify "Not Saved" badge displays

**Key Assertions:**
- Save button click succeeds (no JavaScript error)
- "Not Saved" badge visible
- Document does not persist

**Automation Highlights:**
- Form validation testing
- Error state verification

**Reliability:** ✅ Stable

---

### SO-001: Sales Order — Complete Workflow

**Purpose:** Validate end-to-end Sales Order create/save workflow.

**Scenario:**
1. Navigate to new Sales Order form
2. Select customer: "Asif QA Demo Customer"
3. Add item row
4. Select item: "SKU004"
5. Enter Qty: 10
6. Enter Rate: 1000
7. Verify Amount: 10000
8. Save document
9. Verify URL changed to saved state

**Key Assertions:**
- Form loads
- Customer selection succeeds
- Item selection succeeds
- Quantity/rate accepted
- Amount calculated (10000)
- Save completes
- URL changes from `/new` to `/{document-id}`

**Automation Highlights:**
- Modal handling
- Customer autocomplete
- Item autocomplete
- Grid state transitions
- Persistence verification

**Reliability:** ✅ Stable

---

## Module Coverage Summary

| Module | Tests | Coverage | Status |
|---|---|---|---|
| Material Request | 2 | Item selection, calculations | ✅ Complete |
| Quotation | 2 | Workflow, validation | ✅ Complete |
| Sales Order | 1 | Workflow | ✅ Complete |
| **TOTAL** | **6** | **Core workflows** | **✅ STABLE** |

---

## Execution Results

### Latest Verified Run

**Local Mode:**
- Total: 6 tests
- Passed: 6 ✅
- Failed: 0
- Flaky: 0
- Execution Time: ~2.3 minutes

**CI Mode (Headless):**
- Total: 6 tests
- Passed: 6 ✅
- Failed: 0
- Flaky: 0
- Execution Time: ~1.9 minutes

**Verification:** Repeated execution cycles during stabilization phase. No flaky tests detected.

---

## Automation Reliability Notes

### Key Achievement: Autocomplete Synchronization

Initial implementations relied on `fill()` followed by visible option wait. This proved unreliable under CI load because Frappe's autocomplete requires actual keyboard event sequences.

**Stabilized Pattern:**
- `type(searchText, { delay: 50 })` — keyboard simulation
- `waitFor({ state: 'attached' })` for listbox — detects rendering regardless of CSS visibility
- `ArrowDown` + `Enter` navigation — keyboard interaction

**Result:** Eliminated timing sensitivity and false passes. Tests now deterministically validate actual user workflows.

---

## Not Covered

The following ERPNext areas are **intentionally out of scope** for this portfolio project:

- Edit/update workflows (modify saved documents)
- Submit/finalize workflows (change document state)
- List view operations
- Other modules (PO, Manufacturing, Accounting, etc.)
- Advanced features (workflows, approvals, batch operations)
- Authorization/permission testing
- API testing
- Performance testing

See [QA Strategy](qa-strategy.md) for full scope definition.

---

**Last Updated:** 2026-09-04  
**Test Count Verified:** 6  
**Pass Rate:** 100% (6/6)  
**Flakiness:** 0%
