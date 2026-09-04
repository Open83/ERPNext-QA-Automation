# QA Automation Portfolio: ERPNext Case Study

## The Challenge

I needed to demonstrate my QA automation capabilities through a real-world project. Rather than building another contrived demo, I chose **ERPNext** — a complex, open-source ERP system — to show how I approach professional QA automation.

The challenge: Automate critical business workflows through a real application UI while handling the complexities of modern web applications (async interactions, dynamic rendering, keyboard-driven components).

---

## Project Scope

### What I Tested
Three critical ERPNext modules representing different workflow types:

1. **Material Request Module**
   - Item selection via autocomplete
   - Quantity and rate input
   - Amount calculation verification
   - Document persistence

2. **Quotation Module**
   - Customer selection
   - Item selection
   - Calculation validation
   - Required-field enforcement

3. **Sales Order Module**
   - Complete end-to-end workflow
   - Customer and item selection
   - Calculation verification
   - Persistence confirmation

### What I Intentionally Did NOT Test
- Edit/update workflows (modify existing documents)
- Advanced features (approvals, workflows, taxes)
- Complete module coverage (ERPNext has 40+ modules)
- Other business modules (PO, Manufacturing, Accounting)

**Why?** Clear scope definition is more professional than claiming exhaustive coverage I didn't implement.

---

## Technical Approach

### Problem: Fragile Autocomplete Tests
Initial implementation used `fill()` for item selection:

```javascript
await itemInput.fill('SKU004');
await this.page.locator('[role="option"]').first()
  .waitFor({ state: 'visible' });
```

**Result:** Tests passed locally, failed inconsistently in CI (2 flaky, 4 passed).

### Investigation
I investigated why tests were flaky:

1. Examined DOM — options were present in HTML
2. Checked Playwright — elements showed as hidden
3. Analyzed Frappe's autocomplete library — requires keyboard events
4. Realized: `fill()` is a DOM shortcut that bypasses event handlers

### Solution
Replaced DOM shortcuts with actual keyboard simulation:

```javascript
await itemInput.type('SKU004', { delay: 50 });
await this.page.locator('[role="listbox"]').first()
  .waitFor({ state: 'attached' });
await itemInput.press('ArrowDown');
await itemInput.press('Enter');
```

**Result:** 100% pass rate, 0 flaky tests, stable in both local and CI environments.

---

## Architecture Decisions

### Page Object Model
Instead of inline UI instructions in tests, I created business-level abstractions:

```javascript
// Tests read like business scenarios
const quotation = new QuotationPage(page);
await quotation.setCustomer('Asif QA Demo Customer');
await quotation.selectItemInLastRow('SKU004');
await quotation.setQuantityInLastRow(10);
await quotation.save();
```

**Benefits:**
- UI implementation changes don't break tests
- Clear mapping between test and business scenario
- Reusable across multiple test cases

### Deterministic Synchronization
Replaced arbitrary waits with state-based synchronization:

```javascript
// ❌ Flaky: arbitrary sleep
await page.waitForTimeout(500);

// ✅ Reliable: wait for actual state change
await element.waitFor({ state: 'visible', timeout: 10000 });
```

### Environment Configuration
Used GitHub Actions secrets for credentials, not hardcoded values:

```yaml
ERP_BASE_URL: ${{ secrets.ERP_BASE_URL }}
ERP_USER: ${{ secrets.ERP_USER }}
```

---

## What I Learned

### Lesson 1: Synchronization Matters More Than Coverage
A few well-synchronized, reliable tests are better than many flaky, unreliable tests. It's tempting to add more tests, but I focused on making existing tests bulletproof.

### Lesson 2: Understanding the Application is Critical
I had to understand *how Frappe's autocomplete actually works* to write reliable tests. Knowledge of the application's implementation patterns is essential for effective automation.

### Lesson 3: Silent Failures Hide Problems
The initial implementation had `.catch(() => {})` handlers that silently swallowed failures. When those catches failed, tests would fallback to a different interaction path, appearing to pass while not actually testing the intended behavior.

### Lesson 4: Document Your Limitations
Rather than claiming 100% ERPNext coverage, I clearly documented:
- What is tested (3 modules, basic workflows)
- What is NOT tested (other modules, advanced features)
- Why (scope management, not laziness)

This transparency is more professional than inflated claims.

---

## Results

### Test Quality
| Metric | Result |
|---|---|
| Tests Implemented | 6 |
| Pass Rate | 100% |
| Flaky Tests | 0 |
| Failed Tests | 0 |
| Execution Time | ~90 seconds |

### Execution Environments
- ✅ Local development (headed browser)
- ✅ CI/headless (GitHub Actions)
- ✅ Both environments identical results

### Repeated Validation
- 5+ consecutive local runs = 100% pass
- 2+ complete CI runs = 100% pass
- 30+ individual test runs = 0 flaky

---

## Professional Practices Demonstrated

### 1. Investigation & Problem-Solving
- Identified that flakiness came from interaction pattern misalignment
- Investigated root cause systematically
- Implemented data-driven solution
- Verified through repeated execution

### 2. Architecture & Maintainability
- Applied Page Object Model pattern
- Clear separation of concerns
- Designed for scalability and reuse

### 3. Documentation
- Comprehensive QA strategy
- Root cause analysis
- Technical architecture documentation
- Professional reporting

### 4. CI/CD & Automation
- GitHub Actions integration
- Secrets management
- Artifact collection
- Headless testing

### 5. Honest Scope Management
- Clearly defined what's tested
- Clearly documented limitations
- No inflated claims
- Portfolio-ready presentation

---

## Key Artifacts

### Code
- 3 page objects (MaterialRequest, Quotation, SalesOrder)
- 6 test specifications
- Consistent naming and patterns
- Clean, readable implementation

### Documentation
- QA Strategy (objectives, scope, approach)
- Test Coverage Matrix (what's tested, what's not)
- Test Execution Report (results, performance, reliability)
- Root Cause Analysis (autocomplete investigation)
- Automation Architecture (layer design, patterns)
- CI/CD Documentation (pipeline configuration)
- Engineering Finding (detailed technical analysis)
- Final QA Report (executive summary)
- Portfolio Case Study (this document)

### Configuration
- Playwright configuration (60s timeout, sequential execution)
- GitHub Actions workflow (secrets, artifacts, reporting)
- Environment management (base URL, credentials)

---

## How This Demonstrates QA Value

### For Hiring Managers
"This candidate can design maintainable automation, investigate failures systematically, and document their work professionally."

### For Clients
"This team approaches QA by understanding the application, writing reliable tests, and communicating limitations honestly."

### For Peer Reviews
"This is production-quality automation demonstrating actual QA practice, not toy examples."

---

## Technical Highlights

### 1. Keyboard-Driven Interaction
Most teams use DOM shortcuts. I implemented actual user behavior simulation, triggering Frappe's event handlers properly.

### 2. Grid State Management
Handled Frappe's dual-mode grids (edit/display) with intelligent fallback reading.

### 3. Modal Dialog Handling
Implemented robust modal closing with retry logic and multiple fallback strategies.

### 4. Persistence Verification
Verified document saves via URL changes, not just clicking the Save button.

### 5. Deterministic Waits
No arbitrary sleeps or timeouts — all waits based on actual state changes.

---

## Conclusion

This ERPNext QA automation project demonstrates how I approach professional QA work:

1. **Scope Thoughtfully** — Cover what matters, document what's not covered
2. **Automate Reliably** — Eliminate flakiness through proper synchronization
3. **Understand the Application** — Know how it actually works
4. **Investigate Failures** — Find root causes, not just workarounds
5. **Document Professionally** — Make your work understandable and maintainable

The result is a portfolio piece that's honest about its scope, professional in its execution, and ready for demonstration to hiring managers or clients.

---

**Case Study Version:** 1.0  
**Date:** 2026-09-04  
**Project Status:** ✅ Complete and Stable  
**Portfolio Status:** ✅ Ready for Presentation
