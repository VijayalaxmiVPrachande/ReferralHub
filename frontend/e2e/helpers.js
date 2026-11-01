/**
 * Playwright E2E Helpers for ReferralHub
 */

export const DEMO_PASSWORD = process.env.DEMO_PASSWORD || 'DemoPassword123!';
export const RECRUITER_EMAIL = 'recruiter@demo.com';
export const EMPLOYEE_EMAIL = 'employee@demo.com';

/**
 * Log in as the seeded recruiter
 * @param {import('@playwright/test').Page} page
 */
export async function loginAsRecruiter(page) {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  
  // Fill email & password
  const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]').first();
  const passwordInput = page.locator('input[type="password"]').first();
  const submitButton = page.locator('button[type="submit"], button:has-text("Sign in"), button:has-text("Login")').first();

  await emailInput.fill(RECRUITER_EMAIL);
  await passwordInput.fill(DEMO_PASSWORD);
  await submitButton.click();

  // Wait for dashboard to load
  await page.waitForSelector('text=Jobs', { timeout: 10000 });
}

/**
 * Log in as the seeded employee
 * @param {import('@playwright/test').Page} page
 */
export async function loginAsEmployee(page) {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]').first();
  const passwordInput = page.locator('input[type="password"]').first();
  const submitButton = page.locator('button[type="submit"], button:has-text("Sign in"), button:has-text("Login")').first();

  await emailInput.fill(EMPLOYEE_EMAIL);
  await passwordInput.fill(DEMO_PASSWORD);
  await submitButton.click();

  await page.waitForSelector('text=Jobs', { timeout: 10000 });
}
