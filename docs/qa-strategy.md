# QA Strategy — ERPNext Automation

## 1. Project Context

This is an **independent QA automation portfolio project** demonstrating structured testing and maintainable UI automation using ERPNext (an open-source ERP application) as the application under test.

The project is **NOT client work** and does **NOT** represent complete ERPNext testing coverage. It is a **proof-of-work artifact** showing QA competencies through selected critical workflow automation.

## 2. Testing Objectives

- Validate core business workflows through the ERPNext user interface
- Demonstrate maintainable, reusable UI automation using the Page Object Model
- Verify critical validations and calculations
- Establish reliable test execution through continuous integration
- Document QA investigation and root-cause analysis
- Show professional test design and implementation

## 3. Scope

### In Scope — Automated Coverage

**Material Request Module**
- Item selection via autocomplete
- Quantity and rate input
- Amount calculation (Qty × Rate)
- Form save and persistence verification

**Quotation Module**
- Customer selection via autocomplete
- Item selection via autocomplete
- Quantity and rate input
- Amount calculation (Qty × Rate)
- Form save and persistence verification
- Required-field validation (customer is mandatory)

**Sales Order Module**
- Customer selection via autocomplete
- Item selection via autocomplete
- Quantity and rate input
- Amount calculation (Qty × Rate)
- Form save and persistence verification

**Infrastructure**
- Automated authentication and session setup
- Environment configuration
- CI/CD pipeline execution

### Out of Scope — Intentionally Not Covered

- Submit/finalize workflows (document state changes)
- Edit existing documents (load and modify existing records)
- List views and record searching
- Authorization and permission testing
- Advanced calculations (taxes, discounts, shipping)
- Multi-user workflows
- API testing
- Performance/load testing
- Inventory management workflows
- Purchase Order, Manufacturing, Accounting modules
- Mobile or accessibility testing

## 4. Test Approach

### Functional Testing
- End-to-end workflow validation
- User interface interaction
- Form field entry and validation
- Calculation verification
- State persistence across browser interactions

### Regression Testing
- Automated execution through CI pipeline
- Reliable defect detection
- Consistent environment execution
- Test independence and idempotence

### Validation Testing
- Required-field enforcement
- Business rule validation
- Data persistence

## 5. Automation Approach

### Technology Stack
- **Playwright** — UI automation and browser control
- **Node.js** — JavaScript test runtime
- **GitHub Actions** — Continuous integration

### Architecture
- **Page Object Model** — Business-level test abstraction
- **Environment-based configuration** — ERP_BASE_URL, ERP_USER, ERP_PASSWORD
- **Reusable test data** — Quotation and Sales Order scenarios
- **CI-native execution** — Headless browser mode in GitHub Actions

### Key Patterns

**Keyboard-Driven Autocomplete Interaction**
- Simulates actual user keyboard input (typing, arrow keys, Enter)
- Waits for listbox attachment rather than immediate visibility
- Ensures synchronization with Frappe's autocomplete event handlers

**Deterministic Synchronization**
- State-based waits (visible, attached) rather than arbitrary timeouts
- Element readiness verification before interaction
- Modal dialog handling with retry logic

**Grid State Management**
- Read from input field during edit mode
- Fallback to displayed text after edit mode exits
- Handles grid's dual-state behavior (edit/display)

**Persistence Verification**
- URL-based saved state detection
- Document ID assignment confirmation
- No page reload required for verification

## 6. Risk-Based Thinking

### QA-Level Risks (Test Coverage Focus)

- **Autocomplete interaction reliability** — User-driven autocomplete selection may not trigger correctly if synchronization does not match Frappe's event model
- **Grid synchronization** — Timing between grid state transitions could affect data capture
- **Form save completeness** — Insufficient verification could miss failed saves
- **Field validation gaps** — Missing edge-case validations

### Not Claiming Production Defects

These are **QA-focused automation risks**, not confirmed ERPNext production defects. The automation discovered and resolved synchronization issues during test development, validating test design robustness.

## 7. Test Environment

- **Application**: ERPNext (Frappe Cloud demo instance)
- **Browser**: Chromium (via Playwright)
- **Execution**: Local development mode and CI/CD (GitHub Actions headless)
- **Authentication**: Automated via stored session (playwright/.auth/user.json)
- **Configuration**: Environment variables (not hardcoded)

**Environment Variables Used:**
- `ERP_BASE_URL` — ERPNext instance URL
- `ERP_USER` — Authentication email
- `ERP_PASSWORD` — Authentication password

## 8. Current Coverage Limitations

**What Is Covered**
- Create workflows only (new documents)
- Basic item selection and quantity/rate entry
- Amount calculation
- Save and persistence
- Required-field validation

**What Is NOT Covered**
- Edit or update workflows (modifying saved documents)
- Submit or finalize workflows (changing document state)
- List view filtering and searching
- Complex multi-item workflows
- Concurrent user interactions
- Advanced ERPNext features (workflows, approvals, automation rules)
- Other business modules

**Coverage Percentage**
The automated suite covers selected critical workflows across 3 modules. This represents **functional test coverage for specific scenarios**, not exhaustive application coverage. ERPNext contains 40+ modules; this project covers 3 module entry points with basic workflow validation.

## 9. Future Improvements

### Phase 2 — Extended Validation
- Additional negative test cases
- Complex multi-item workflows
- Tax and discount calculations
- Batch operations

### Phase 3 — API Testing Layer
- Backend validation via API
- Data persistence verification
- API vs. UI behavior consistency

### Phase 4 — Permission/Authorization Testing
- Role-based access testing
- Permission restriction validation
- User interaction restrictions

### Phase 5 — Additional Modules
- Purchase Order module
- Inventory workflows
- Manufacturing workflows

### Phase 6 — Quality Enhancements
- Visual testing
- Accessibility testing
- Performance monitoring
- Improved reporting

### Phase 7 — Advanced Test Scenarios
- Cross-module workflows
- Document linking
- Long-running processes
- Bulk operations

## 10. Success Criteria

**Automation Quality**
- 6/6 tests passing
- 0 flaky tests
- Deterministic execution
- Repeatable CI results

**Code Quality**
- Page Object abstraction
- Reusable test data
- Clear test names
- Documented patterns

**Documentation Quality**
- Clear scope definition
- Honest limitation documentation
- Root-cause analysis for issues discovered
- Professional test reporting

**Reliability**
- CI pipeline integration
- Headless browser support
- Session management
- Failure diagnostics

---

**Document Version:** 1.0  
**Last Updated:** 2026-09-04  
**Status:** Complete Baseline Strategy
