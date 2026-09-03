import { test as setup, expect, request } from '@playwright/test';

setup('authenticate with ERPNext', async ({ page }) => {
  const baseURL = process.env.ERP_BASE_URL;
  const username = process.env.ERP_USER;
  const password = process.env.ERP_PASSWORD;

  if (!baseURL || !username || !password) {
    throw new Error(
      'Missing ERP_BASE_URL, ERP_USER or ERP_PASSWORD in .env'
    );
  }

  console.log('🔐 Authenticating with Frappe API...');

  const api = await request.newContext({
    baseURL,
  });

  const response = await api.post('/api/method/login', {
    form: {
      usr: username,
      pwd: password,
    },
  });

  console.log('Login API status:', response.status());

  expect(response.ok()).toBeTruthy();

  // Get the authenticated Frappe session cookie
  const storageState = await api.storageState();

  await api.dispose();

  // Put the authenticated session into Playwright's browser context
  await page.context().addCookies(storageState.cookies);

  // Verify authentication through Frappe
  const loggedInUser = await page.request.get(
    `${baseURL}/api/method/frappe.auth.get_logged_user`
  );

  console.log(
    'Authenticated user response:',
    await loggedInUser.text()
  );

  expect(loggedInUser.ok()).toBeTruthy();

  // Open ERPNext Desk
  await page.goto(`${baseURL}/app`);

  await expect(page).not.toHaveURL(/\/login/);

  console.log('✅ ERPNext authentication successful');

  await page.context().storageState({
    path: 'playwright/.auth/user.json',
  });
});