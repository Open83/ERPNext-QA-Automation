# ERPNext QA Automation — Architecture

## Directory Structure

```
ERPNext-QA-Automation/
├── README.md                 # Project overview
├── PROJECT_VISION.md         # Long-term vision and scope
├── ARCHITECTURE.md           # This file
├── COVERAGE.md               # Coverage matrix and test status
│
├── .github/
│   └── workflows/
│       └── playwright.yml    # CI/CD pipeline
│
├── playwright.config.js      # Playwright configuration
├── package.json
├── package-lock.json
│
├── tests/
│   ├── auth/                 # Authentication tests
│   │   ├── auth.setup.js     # Auth setup (runs once per session)
│   │   └── auth.spec.js      # Auth-specific tests (planned)
│   │
│   └── modules/              # Tests organized by ERPNext module
│       └── material-request/
│           ├── ui/           # User interface tests
│           │   ├── create.spec.js
│           │   └── validation.spec.js
│           ├── api/          # API tests (planned)
│           │   └── material-request.api.spec.js
│           └── fixtures/     # Module-specific test data
│               └── scenarios.js
│
├── pages/                    # Page Object Model
│   ├── base.page.js          # Base page class
│   ├── auth/
│   │   └── auth.page.js      # Auth page (planned)
│   │
│   └── modules/
│       └── material-request/
│           ├── material-request.page.js
│           └── grid.page.js  # Grid interaction helper
│
├── fixtures/                 # Reusable test fixtures
│   ├── auth.fixture.js       # Auth fixture
│   └── modules/
│       └── material-request/
│           └── scenarios.js
│
├── data/                     # Centralized test data
│   ├── items.js              # Item definitions
│   ├── users.js              # User definitions
│   └── scenarios.js          # Common test scenarios
│
├── api/                      # API client wrappers (planned)
│   ├── base-client.js
│   └── material-request.js
│
├── utils/                    # Shared utilities
│   ├── logger.js
│   ├── wait.js               # Smart wait strategies
│   └── helpers.js
│
├── docs/                     # Documentation
│   ├── setup.md              # Setup instructions
│   ├── running-tests.md      # How to run tests
│   ├── adding-modules.md     # How to add new modules
│   └── defects.md            # Defects found
│
└── evidence/                 # Test artifacts
    ├── screenshots/          # Failure screenshots
    └── reports/              # Test reports
```

## Module Structure

Each module (e.g., Material Request) follows this pattern:

```
tests/modules/material-request/
├── ui/
│   ├── create.spec.js        # Create workflow test
│   ├── item-selection.spec.js # Item selection test
│   └── validation.spec.js    # Negative/boundary cases
├── api/
│   └── material-request.api.spec.js # API tests
└── fixtures/
    └── scenarios.js          # Test data
```

### UI Tests
- Test user workflows end-to-end
- Located in `ui/` subdirectory
- Use Page Objects for reusability
- Capture screenshots on failure

### API Tests
- Test backend operations
- Validate data persistence
- Located in `api/` subdirectory
- Complement UI tests

### Validation Tests
- Test negative cases (invalid input, missing fields)
- Test boundary conditions (zero, max values)
- Ensure proper error handling

## Page Objects

Each module has a Page Object representing its UI.

### Example: Material Request Page Object

```javascript
// pages/modules/material-request/material-request.page.js
class MaterialRequestPage {
  constructor(page, baseURL) {
    this.page = page;
    this.baseURL = baseURL;
  }

  async goToNew() {
    await this.page.goto(`${this.baseURL}/app/material-request/new`);
  }

  async addRow() {
    await this.page.locator('button:has-text("Add Row")').click();
  }

  async selectItem(itemCode) {
    // Smart selection logic
  }

  async setQuantity(qty) {
    // Quantity field interaction
  }

  async getAmount() {
    // Return calculated amount
  }
}

module.exports = { MaterialRequestPage };
```

## Test Data

Centralized in `data/` and `fixtures/`.

### Test Scenarios

```javascript
// data/scenarios.js
export const MATERIAL_REQUEST_SCENARIOS = {
  simple: {
    items: [
      { item_code: 'Item-001', qty: 10, warehouse: 'Main Warehouse' }
    ]
  },
  multiple_items: {
    items: [
      { item_code: 'Item-001', qty: 5 },
      { item_code: 'Item-002', qty: 3 }
    ]
  },
  invalid_quantity: {
    items: [
      { item_code: 'Item-001', qty: -5 } // Should be rejected
    ]
  }
};
```

## Authentication

Authentication runs once per test session via `auth.setup.js`.

All subsequent tests inherit the authenticated session automatically.

### Auth Setup Flow

1. Read credentials from `.env`
2. Authenticate via Frappe API
3. Extract session cookies
4. Store in `playwright/.auth/user.json`
5. Inject into browser context for all tests

## Synchronization Strategy

### Level 1: Explicit Waits (Preferred)
```javascript
await expect(page.locator('button')).toBeVisible();
```

### Level 2: Playwright Auto-Wait
```javascript
await page.click('button'); // Auto-waits for element
```

### Level 3: Network Idle (Last Resort)
```javascript
await page.waitForLoadState('networkidle');
```

### Level 4: Explicit Waits for Stability
```javascript
await page.locator('[data-fieldname="item"]').waitFor({ timeout: 5000 });
```

### NO Hardcoded Delays
```javascript
// ❌ DO NOT USE
await page.waitForTimeout(1000);

// ✅ USE INSTEAD
await expect(page.locator('button')).toBeVisible();
```

## Test Execution

### Local Development
```bash
npm test                           # Run all tests
npm run test:ui                   # Run UI tests only
npm run test:api                  # Run API tests only
npm run test:material-request     # Run Material Request module
```

### CI/CD
GitHub Actions runs full test suite on push/PR.

Requires GitHub Secrets:
- `ERPNEXT_URL`
- `ERP_BASE_URL`
- `ERP_USER`
- `ERP_PASSWORD`

## Adding a New Module

When adding a new ERPNext module (e.g., Sales Order):

1. **Create test directory**
   ```
   tests/modules/sales-order/
   ```

2. **Create Page Object**
   ```
   pages/modules/sales-order/sales-order.page.js
   ```

3. **Add test data**
   ```
   data/scenarios.js (add SALES_ORDER_SCENARIOS)
   ```

4. **Write tests**
   ```
   tests/modules/sales-order/ui/create.spec.js
   ```

5. **Update coverage matrix**
   ```
   COVERAGE.md (add Sales Order row)
   ```

6. **Run tests**
   ```
   npm run test:sales-order
   ```

## Coverage Tracking

Coverage matrix in `COVERAGE.md` reflects actual implementation status.

When implementing a module:
1. ✅ Mark workflow as "Implemented"
2. Mark test levels (UI: ✅, API: ❌, etc.)
3. Link to test files
4. Document any limitations

---

**This architecture is designed to grow cleanly, one module at a time.**
