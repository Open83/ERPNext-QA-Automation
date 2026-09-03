# ERPNext QA & Automation — Project Vision

## Overview
This is an independent proof-of-work QA automation project for **ERPNext**, an open-source enterprise resource planning (ERP) system.

The project demonstrates professional QA engineering practices including:
- Multi-level test automation (UI/E2E, API, validation)
- Cross-module workflow testing
- Test framework architecture
- Coverage tracking
- Evidence collection

## Scope
This project tests **selected critical workflows** across ERPNext's major modules.

**It does NOT claim complete ERPNext coverage.** ERPNext is a large application. We test strategically, starting with high-value workflows and expanding module by module.

## Test Levels

### Level 1: UI/E2E Testing
User-facing workflows using Playwright automation.
- Example: Create Material Request → Add Items → Save/Submit

### Level 2: API Testing
Backend operations and data persistence validation.
- Example: Create Material Request via API → Verify in UI

### Level 3: Validation Testing
Required fields, invalid input, boundary conditions.
- Example: Quantity = 0, Required By in past, missing mandatory fields

### Level 4: Authorization Testing
Role/permission enforcement (where safely testable).
- Example: User without permission cannot submit Material Request

### Level 5: Cross-Module Workflows
End-to-end processes spanning multiple modules.
- Example: Material Request → Quotation → Purchase Order → Purchase Receipt

## Current Status

### Implemented Modules
- ✅ **Authentication & Session Management** — User login, session persistence
- ✅ **Material Request (Buying)** — Item selection, quantity/rate calculations, workflow basics

### Roadmap (Planned, Not Yet Implemented)
- ⏳ **Quotation/Customer Interaction** — Lead, Customer creation, quotation
- ⏳ **Sales Order & Delivery** — End-to-end selling workflow
- ⏳ **Purchase Order & Receipt** — Buying workflow continuation
- ⏳ **Inventory & Stock** — Item management, warehouse operations
- ⏳ **Accounts/Invoicing** — Financial transactions
- ⏳ **Cross-Module Workflows** — Lead → Sales → Delivery → Invoice

### Not Currently In Scope
- Manufacturing
- HR
- Projects
- Advanced Reports
- Custom Configurations

## Coverage Matrix

Current coverage by level and module:

| Module | Workflow | UI | API | Validation | Authorization | Status |
|--------|----------|----|----|-----------|---|---|
| **Authentication** | User login | ✅ | ✅ | ❌ | N/A | Implemented |
| **Material Request** | Create & add items | ✅ | ❌ | ⏳ | ❌ | Partial |
| **Material Request** | Calculate amounts | ✅ | ❌ | ❌ | ❌ | Partial |
| **Material Request** | Save/Submit | ❌ | ❌ | ❌ | ❌ | Planned |

Legend:
- ✅ Implemented
- ⏳ Planned
- ❌ Not covered
- N/A Not applicable

## Architecture Principles

### 1. Modular Structure
Tests organized by ERPNext module, not test type.

```
tests/
  auth/              # Authentication
  material-request/  # Buying module: Material Request
  quotation/         # Selling module: Quotation
  sales-order/       # Selling module: Sales Order
  purchase-order/    # Buying module: Purchase Order
  ...
```

### 2. Reusable Page Objects
Each module has a page object representing its UI.

```
pages/
  auth/
  material-request/
  quotation/
  ...
```

### 3. Centralized Test Data
Test scenarios and fixtures shared across modules.

```
fixtures/
data/
  material-request/
  quotation/
  ...
```

### 4. Multi-Level Testing
Each module includes UI, API, and validation tests.

### 5. Evidence & Documentation
- Screenshots captured on failure
- Execution logs preserved
- Coverage matrix updated after each module
- Defects documented with reproduction steps

## Success Criteria

✅ **Quality Over Quantity**
- Real tests for real workflows
- No fabricated coverage
- No fake defects

✅ **Professional Practices**
- Page Object Model
- Centralized test data
- Proper synchronization (no hardcoded waits)
- Clear error messages

✅ **Transparency**
- Coverage matrix reflects actual status
- Roadmap grounded in reality
- Known limitations documented

✅ **Maintainability**
- Tests survive ERPNext updates
- Framework can grow without refactoring
- Code is readable and modular

## Not Included (Intentionally)

❌ Complete ERPNext coverage (unrealistic for a personal project)
❌ Every possible scenario (we focus on critical paths)
❌ Fabricated defects or inflated results
❌ Fake test counts to look impressive
❌ Modules tested but not implemented

---

**Project Status:** Active development, Phase 1 in progress
**Last Updated:** 2026-09-03
