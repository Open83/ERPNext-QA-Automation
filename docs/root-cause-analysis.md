# RCA — ERPNext Frappe Autocomplete Synchronization

## Finding

**Category:** Automation Reliability / Engineering Finding  
**Severity:** High (affects test fidelity)  
**Environment:** CI/headless execution  
**Discovery Date:** 2026-09-03

---

## Problem Statement

Material Request, Quotation, and Sales Order item selection tests were unreliable under CI load. Tests would timeout waiting for autocomplete options to become interactive despite elements existing in the DOM. Previous test passes were only succeeding because silent `.catch()` handlers swallowed the failures.

---

## Initial Pattern (Unreliable)

```javascript
// Fill input with item code
await itemInput.fill(itemCode);

// Wait for option to be visible
await this.page.locator('[role="option"]').first()
  .waitFor({ state: 'visible', timeout: 5000 });

// Click option (attempt to interact)
await optionElement.click();

// Silent catch masking the failure
.catch(() => {
  // If option wasn't visible, just press Enter
  await itemInput.press('Enter');
});
```

**Behavior:** Option existed in DOM but remained in hidden CSS state. Click would fail. Silent handler would fallback to Enter key, making tests appear to pass.

---

## Investigation Findings

### Observation 1: DOM vs. Visibility Mismatch
- Page snapshot showed `<div role="option">` elements present
- DOM inspection showed `aria-selected="true"` correctly set
- But Playwright's `visible` check repeatedly failed (25+ times over 15s)

### Observation 2: Frappe's Event Model
Frappe's Awesomplete autocomplete library requires **keyboard event sequences** to:
1. Detect input changes
2. Fetch matching items
3. Render dropdown visibly
4. Manage focus and visibility states

### Observation 3: fill() Limitation
DOM-level `fill()` does not trigger the keyboard events Frappe expects:
- No `keydown` events
- No `keyup` events  
- No `input` events with proper sequence timing
- Browser recognizes text in input, but Frappe's event handlers never fire

### Observation 4: Silent Error Masking
The `.catch(() => {})` handler converted timeout failures into fallback behavior:
- Test appears to pass (fallback Enter key worked)
- Actual failure is hidden
- Tests are not validating the intended workflow

---

## Root Cause

**The automation interaction pattern did not match Frappe's actual interaction model.**

Frappe's autocomplete requires real keyboard input sequences, not DOM manipulation. The `fill()` method bypasses these event handlers, leaving the autocomplete in an uninitialized state where DOM elements exist but are not ready for user interaction.

---

## Resolution

Replace the unreliable pattern with keyboard-driven interaction:

```javascript
// Use keyboard typing, not DOM fill
await itemInput.type(searchText, { delay: 50 });

// Wait for autocomplete to ATTACH, not become visible
await this.page.locator('[role="listbox"]').first()
  .waitFor({ state: 'attached', timeout: 10000 });

// Navigate with keyboard
await itemInput.press('ArrowDown');

// Confirm with Enter
await itemInput.press('Enter');

// NO silent catches on critical operations
```

**Key Changes:**
1. `type()` instead of `fill()` — triggers keyboard events
2. Wait for attachment, not visibility — detects rendering regardless of CSS
3. Keyboard navigation (ArrowDown + Enter) — mirrors actual user behavior
4. Remove silent error handlers — expose failures clearly

---

## Verification

### Local Execution (repeated 5+ times)
- ✅ Material Request item selection: PASS
- ✅ Quotation workflow: PASS
- ✅ Sales Order workflow: PASS

### CI/Headless Execution (2+ complete runs)
- ✅ All workflows: PASS
- ✅ No timeouts
- ✅ No spurious Enter key fallbacks

**Result:** Zero flakiness across all execution cycles. Deterministic pass rate: 100%.

---

## QA Lesson

> An automation test can be logically correct and syntactically valid yet still be unreliable if synchronization does not match the application's actual interaction model.

This finding demonstrates the importance of:
1. **Testing interaction fidelity** — not just functional correctness
2. **Exposing failures clearly** — removing silent error handlers reveals true test state
3. **Understanding the application** — Frappe's event model requires specific interaction patterns
4. **Repeated validation** — flakiness only emerges under realistic CI load conditions

---

## Impact

- **Test Reliability:** Improved from flaky (2/4 passing in CI) to stable (6/6 passing)
- **Test Fidelity:** Now validates actual user workflows instead of shortcut fallbacks
- **Maintainability:** Clear cause/effect between interaction and results

---

## Status

✅ **RESOLVED** — Confirmed stable through repeated execution cycles.

---

**RCA Version:** 1.0  
**Resolved Date:** 2026-09-04  
**Finding Type:** Automation Reliability / Engineering Finding  
**Note:** This is a test automation reliability issue, not a confirmed ERPNext production defect.
