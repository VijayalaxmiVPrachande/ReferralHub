import { test, expect } from '@playwright/test';

test.describe('Phase 0 Baseline Smoke Suite', () => {
  test('App loads successfully and renders sign in page', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/ReferralHub/i);
    const heading = page.locator('h1, h2, form').first();
    await expect(heading).toBeVisible();
  });
});
