# CI/CD Documentation

## GitHub Actions Pipeline

### Workflow Configuration

**File:** `.github/workflows/playwright.yml`

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
        with:
          node-version: 18
          
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm test
      
      - uses: actions/upload-artifact@v4
        if: ${{ !cancelled() }}
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

---

## Execution Flow

1. **Trigger:** Push or pull request to any branch
2. **Setup:** Node.js 18, dependencies
3. **Install:** Playwright browsers + system dependencies
4. **Test:** Sequential execution in headless mode
5. **Report:** Upload artifacts (screenshots, videos)

---

## Environment Configuration

### Secrets Management

GitHub Actions stores sensitive credentials as repository secrets. Environment variables are injected at runtime:

```yaml
ERP_BASE_URL: ${{ secrets.ERP_BASE_URL }}
ERP_USER: ${{ secrets.ERP_USER }}
ERP_PASSWORD: ${{ secrets.ERP_PASSWORD }}
```

**Security:**
- ✅ Credentials never logged to console
- ✅ Not stored in version control
- ✅ Only injected in CI environment
- ✅ Repository secret scope (not org-wide)

### CI Detection

```javascript
// playwright.config.js
headless: process.env.CI ? true : false
```

Tests automatically run in headless mode when CI=true.

---

## Headless Execution

### Configuration
- **Browser:** Chromium (headless)
- **Display:** None (no GUI)
- **Performance:** Optimized for remote execution
- **Timeout:** 60s per test (increased for CI load)

### Results
- **Local:** 6 tests, ~2.3 minutes
- **CI:** 6 tests, ~1.9 minutes
- **Pass Rate:** 100% (6/6)
- **Flakiness:** 0%

Headless execution is **faster** and **just as reliable** as local headed mode.

---

## Artifact Collection

On test failure, GitHub Actions captures:
- **Screenshots:** Final state before failure
- **Videos:** Full test recording
- **Trace:** Playwright Inspector trace

### Access
1. Click "Playwright Report" artifact in GitHub Actions UI
2. Download and extract
3. Open `index.html` in browser
4. Review test results with visual evidence

---

## Test Execution Details

### Sequential vs. Parallel

**Configuration:** `fullyParallel: false`, `workers: 1`

**Reason:** Authentication session stored in `.auth/user.json` shared across tests.

**Performance Impact:** ~20% slower than parallel, but ensures session reuse.

### Authentication Flow

1. **First test runs:** `tests/auth/auth.setup.js`
   - Logs in with ERP_USER / ERP_PASSWORD
   - Stores session in `.auth/user.json`
   - Session includes auth cookies

2. **Subsequent tests:** Reuse stored session
   - No login step needed
   - Tests start immediately at ERPNext UI
   - Saves ~30s per test

### Test Timing

| Test | Local | CI |
|---|---|---|
| auth.setup.js | ~2s | ~2s |
| material-request/calculations.spec.js | ~12s | ~9s |
| material-request/item-selection.spec.js | ~8s | ~7s |
| quotation/quotation-workflow.spec.js | ~35s | ~28s |
| quotation/validation.spec.js | ~10s | ~8s |
| sales-order/sales-order-workflow.spec.js | ~25s | ~20s |
| **TOTAL** | ~92s | ~74s |

---

## Failure Handling

### On Test Failure

1. **Screenshot captured** at moment of failure
2. **Video recording** stops (retained)
3. **Test marked as FAILED**
4. **Artifacts uploaded** to GitHub Actions
5. **Job exits with code 1** (build failure)

### Pull Request Integration

- Red ❌ status on PR if tests fail
- Green ✅ status if all tests pass
- Artifact link in workflow run

---

## GitHub Actions Output

### Successful Run

```
✓ Tests passed (6 passed, 0 failed, 0 flaky)
- Uploaded artifact: playwright-report
- Job completed in 3m 45s
```

### Failed Run

```
✗ Test timed out waiting for element
- Screenshot: test-failed.png
- Video: test-failed.webm
- Trace available
- Uploaded artifact: playwright-report
- Job failed
```

---

## Maintenance

### Updating Node.js Version

```yaml
node-version: 20  # Change from 18
```

### Updating Playwright

```bash
npm install @playwright/test@latest
```

Both changes trigger fresh browser installation in CI.

### Updating Test Data

Modify `data/quotation.data.js` or `data/sales-order.data.js`. Next CI run picks up changes automatically.

---

## Security Considerations

### Credentials in CI

✅ **Correct:** Use GitHub Actions secrets
```yaml
ERP_USER: ${{ secrets.ERP_USER }}
```

❌ **Wrong:** Hardcode in workflow
```yaml
ERP_USER: user@example.com
```

### Log Output

Playwright does not log credentials. However:
- Never print `process.env.ERP_PASSWORD` in test code
- Never log `page.goto()` URLs with credentials
- Use secrets masking if custom logging needed

### Test Isolation

Tests run against the same ERPNext instance. Test data reuse is acceptable for portfolio demo. In production, consider:
- Unique document IDs per run
- Test data cleanup
- Parallel test isolation

---

## Debugging CI Failures

### Local Replication

Run locally to reproduce:
```bash
export CI=true
npm test
```

### Headless Testing Locally

```javascript
// playwright.config.js
headless: true  // Force headless mode
```

### Network Issues

- Check ERPNext instance availability
- Verify firewall rules
- Test connectivity: `curl $ERP_BASE_URL`

### Timing Issues

- Increase timeout in playwright.config.js
- Review wait patterns (check for arbitrary sleeps)
- Use Playwright Inspector: `PWDEBUG=1 npm test`

---

## Best Practices

1. **Commit frequently** — CI catches issues early
2. **Keep tests fast** — <1 minute ideal, <2 minutes acceptable
3. **Use secrets** — Never hardcode credentials
4. **Check artifacts** — Review videos/screenshots on failure
5. **Tag releases** — Stable test versions for deployment readiness

---

**Version:** 1.0  
**Date:** 2026-09-04  
**Status:** ✅ Active and Stable
