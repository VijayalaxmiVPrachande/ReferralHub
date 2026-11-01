import { test, expect } from '@playwright/test';

test.describe('Slice A: Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
  });

  test('Renders split-screen auth page with hero panel and login form', async ({ page }) => {
    await expect(page).toHaveTitle(/ReferralHub/i);
    await expect(page.locator('h1')).toContainText('Great people know great people');
    await expect(page.locator('h2')).toContainText('Welcome back');
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.locator('#auth-submit')).toBeVisible();
  });

  test('Toggles between Sign In and Register views', async ({ page }) => {
    // Click toggle to switch to Register
    const toggleBtn = page.locator('#toggle-mode-btn');
    await expect(toggleBtn).toContainText('Sign up');
    await toggleBtn.click();

    // Verify Register form
    await expect(page.locator('h2')).toContainText('Create an account');
    await expect(page.locator('#name')).toBeVisible();
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.locator('#auth-submit')).toContainText('Create Account');

    // Click toggle back to Sign In
    await page.locator('#toggle-mode-btn').click();
    await expect(page.locator('h2')).toContainText('Welcome back');
    await expect(page.locator('#name')).not.toBeVisible();
  });

  test('Shows validation errors on empty submission', async ({ page }) => {
    // Click submit with empty fields
    await page.locator('#auth-submit').click();
    await expect(page.locator('#email-error')).toContainText(/email is required/i);
    await expect(page.locator('#password-error')).toContainText(/password is required/i);
  });

  test('Allows toggling recruiter invite code input in register mode', async ({ page }) => {
    await page.locator('#toggle-mode-btn').click();
    await expect(page.locator('#invite-code')).not.toBeVisible();

    // Click "Have a recruiter invite code?"
    await page.locator('button:has-text("Have a recruiter invite code?")').click();
    await expect(page.locator('#invite-code')).toBeVisible();
  });

  test('Toggles password visibility between password and text', async ({ page }) => {
    const passwordInput = page.locator('#password');
    await expect(passwordInput).toHaveAttribute('type', 'password');

    // Click show password toggle
    const togglePassBtn = page.locator('button[aria-label="Show password"]');
    await togglePassBtn.click();
    await expect(passwordInput).toHaveAttribute('type', 'text');

    // Click hide password toggle
    const hidePassBtn = page.locator('button[aria-label="Hide password"]');
    await hidePassBtn.click();
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('Hides hero panel on small mobile viewports (< 900px)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    const heroPanel = page.locator('.auth-hero-panel');
    await expect(heroPanel).toBeHidden();
    const formPanel = page.locator('.auth-form-panel');
    await expect(formPanel).toBeVisible();
  });
});
