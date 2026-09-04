# Engineering Finding Example

## Frappe Autocomplete Synchronization Issue

### Finding ID
**FND-001** — Autocomplete Interaction Pattern Mismatch

### Category
Test Automation / Synchronization / Reliability

### Severity
High — Affects test fidelity and reliability

### Status
✅ RESOLVED

---

## Executive Summary

Automated tests using `fill()` for autocomplete input failed to reliably interact with Frappe's Awesomplete dropdown, causing sporadic timeouts and silent test failures. Investigation revealed that `fill()` bypasses keyboard event handlers that Frappe's autocomplete requires for visibility and interactivity. Replacing `fill()` with `type()` and adjusting wait strategy resolved the issue, improving test reliability from flaky to 100% deterministic.

---

## Issue Description

### Symptom 1: Hidden Option Elements
Tests would timeout waiting for autocomplete options to become visible:

```
Error: locator('[role="option"]').first() to be visible
Timeout after 5000ms
25 × locator resolved to hidden <div role="option">
```

The elements existed in DOM but remained in CSS-hidden state despite:
- Correct text entered in input
- Correct ARIA attributes set
- Correct DOM structure

### Symptom 2: Silent Failures
Tests appeared to pass but were actually failing silently:

```javascript
await dropdown.waitFor({ state: 'visible' })
  .catch(() => {
    // Silent fallback — test appears to pass
    await input.press('Enter');
  });
```

When option visibility wait failed, tests would fallback to keyboard Enter without confirming the intended workflow actually executed.

### Symptom 3: CI-Amplified Flakiness
- **Local execution:** Sometimes passed, sometimes failed
- **CI execution:** Failed consistently under load
- **Reported:** "2 flaky, 4 passed" in GitHub Actions

---

## Root Cause Analysis

### Investigation Steps

**Step 1: DOM Inspection**
- ✅ `<div role="option">` elements present in DOM
- ✅ `aria-selected="true"` correctly set
- ✓ CSS classes present (`awesomplete-item`)

**Step 2: Playwright Inspection**
- ❌ `isVisible()` returns false
- ❌ `getComputedStyle()` shows `display: none` or `opacity: 0`
- ✓ `isAttached()` returns true

**Step 3: Event Handler Analysis**
Frappe's Awesomplete requires specific event sequences:
1. Input receives `keydown` event
2. Input receives `input` event (value changed)
3. Awesomplete library detects change
4. Awesomplete fetches matching items
5. Awesomplete renders dropdown (CSS visibility change)
6. Awesomplete manages focus and keyboard navigation

**Step 4: Interaction Method Comparison**

| Method | Triggers Events | Fidelity | Reliability |
|---|---|---|---|
| `fill()` | ❌ No events | Low | Unreliable |
| `type()` | ✅ Full sequence | High | Reliable |
| `press(key)` | ✅ Specific keys | Medium | Reliable |

### Root Cause

**`fill()` method is a DOM shortcut that does NOT trigger keyboard events.**

```javascript
// This bypasses keyboard event handlers
await input.fill('SKU004');
// Frappe's event listeners never fire
// Awesomplete never initializes
// Dropdown never becomes visible
```

---

## Solution Implementation

### Before (Unreliable Pattern)

```javascript
async selectItemInLastRow(itemCode) {
  const itemInput = itemCell.locator('input').first();
  
  // ❌ Problem: fill() doesn't trigger events
  await itemInput.fill(itemCode);
  
  // ❌ Problem: option never becomes visible
  await this.page.locator('[role="option"]').first()
    .waitFor({ state: 'visible', timeout: 5000 });
  
  // ❌ Problem: click may fail on hidden element
  await optionElement.click();
  
  // ❌ Problem: silent catch masks the failure
  .catch(() => {
    await itemInput.press('Enter');
  });
}
```

### After (Reliable Pattern)

```javascript
async selectItemInLastRow(searchText) {
  const itemInput = itemCell.locator('input').first();
  
  // ✅ Step 1: Keyboard input triggers events
  await itemInput.type(searchText, { delay: 50 });
  
  // ✅ Step 2: Wait for listbox to be present in DOM
  // (state: 'attached' works regardless of CSS visibility)
  await this.page.locator('[role="listbox"]').first()
    .waitFor({ state: 'attached', timeout: 10000 });
  
  // ✅ Step 3: Keyboard navigation (mirrors user behavior)
  await itemInput.press('ArrowDown');
  
  // ✅ Step 4: Keyboard selection
  await itemInput.press('Enter');
  
  // ✅ NO silent catches — failures are explicit
}
```

**Key Changes:**
1. `fill()` → `type()` with delay — simulates actual keyboard input
2. Wait for `attached` instead of `visible` — detects rendering regardless of CSS
3. Keyboard navigation (ArrowDown + Enter) — mirrors user interaction
4. Removed silent error handler — failures are visible

---

## Verification

### Test Results After Fix

| Scenario | Before | After |
|---|---|---|
| Material Request item selection | Flaky | ✅ Stable |
| Quotation workflow | Flaky | ✅ Stable |
| Sales Order workflow | Flaky | ✅ Stable |
| Pass Rate | 66% (4/6) | 100% (6/6) |
| Flakiness | Yes | ✅ No |

### Repeated Execution Cycles

- **Local execution:** 5+ consecutive full suite runs = 100% pass
- **CI execution:** 2+ complete CI runs = 100% pass
- **Combined:** 30+ individual test runs = 0 flaky

### Zero Regression

All other tests (validation, calculations, persistence) continued to pass without modification.

---

## Impact

### Before Resolution
- ❌ Tests unreliable (flaky)
- ❌ Silent failures masked issues
- ❌ CI could not be trusted
- ❌ Automation did not validate real user workflows

### After Resolution
- ✅ Deterministic execution
- ✅ Failures are visible
- ✅ CI is reliable
- ✅ Automation validates actual user interaction patterns

---

## Key Lessons

### Lesson 1: Synchronization Must Match Application

> Test synchronization must match how the application actually works, not how we expect it to work.

Frappe's autocomplete requires keyboard events. Using DOM-level shortcuts bypasses this requirement, leaving tests in an inconsistent state with the actual application behavior.

### Lesson 2: Silent Error Handling Hides Problems

> Silent error handlers (`.catch(() => {})`) convert test failures into false passes.

When a wait fails silently and a fallback succeeds, we lose visibility into whether the intended workflow actually occurred.

### Lesson 3: DOM Presence ≠ Readiness

> An element can exist in DOM and be correctly styled while still being unready for user interaction.

Waiting for `visible` is necessary but not sufficient. Applications may use CSS visibility, opacity, or JavaScript state to control interactivity independent of DOM presence.

### Lesson 4: CI Amplifies Timing Issues

> Timing sensitivity that passes locally may fail under CI load due to network delays and resource constraints.

Tests discovered as flaky only in CI should be investigated for hidden timing assumptions.

---

## Technical Details

### Frappe Awesomplete Library Behavior

Awesomplete implements autocomplete through:
1. **Input listener:** Watches for keyboard and `input` events
2. **AJAX fetch:** Calls server for matching items
3. **DOM update:** Injects matching options into dropdown
4. **CSS state:** Controls visibility with `display` and `opacity`
5. **Keyboard handler:** Manages ArrowUp/ArrowDown/Enter navigation

Using `fill()` skips step 1, preventing downstream steps.

### Playwright Wait Strategy

| Wait State | When to Use | Use Case |
|---|---|---|
| `state: 'visible'` | Element must be interactable via click | Buttons, links |
| `state: 'attached'` | Element exists in DOM regardless of CSS | Dropdowns, dynamic content |
| `state: 'hidden'` | Wait for element to disappear | Closing modals, spinners |

For autocomplete options that may be CSS-hidden initially: use `attached` not `visible`.

---

## Conclusion

This finding demonstrates that reliable UI automation requires:
1. **Understanding the application** — How does Frappe's autocomplete actually work?
2. **Matching user behavior** — Real users type, not DOM-fill
3. **Proper synchronization** — State changes, not arbitrary waits
4. **Visible failures** — No silent error handlers

The resolution converted flaky, unreliable tests into deterministic, stable automation that actually validates the application's real behavior.

---

**Finding Version:** 1.0  
**Resolved:** 2026-09-04  
**Impact:** High (enabled 100% reliable test suite)  
**Recommendation:** Apply this pattern to all autocomplete interactions in Frappe
