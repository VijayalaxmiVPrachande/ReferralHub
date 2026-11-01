import { test, expect } from '@playwright/test';

test.describe('Slice B: Jobs Feature', () => {
  const mockJobs = [
    {
      id: 101,
      title: 'Senior Backend Engineer',
      location: 'Bengaluru, India (Hybrid)',
      description: 'Looking for experience in Java, Spring Boot, Microservices, and PostgreSQL.',
    },
    {
      id: 102,
      title: 'Frontend React Specialist',
      location: 'Remote',
      description: 'Must have expertise in React, JavaScript, TypeScript, HTML, and CSS.',
    },
  ];

  test.beforeEach(async ({ page }) => {
    // Mock authentication and jobs endpoints for deterministic testing
    await page.route('**/auth/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          name: 'Demo Recruiter',
          email: 'recruiter@demo.com',
          role: 'RECRUITER',
        }),
      });
    });

    await page.route('**/jobs', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockJobs),
        });
      } else if (route.request().method() === 'POST') {
        const body = route.request().postDataJSON();
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 103,
            title: body.title,
            location: body.location || '',
            description: body.description || '',
          }),
        });
      } else {
        await route.continue();
      }
    });

    // Set token so app starts authenticated
    await page.addInitScript(() => {
      localStorage.setItem('jwt_token', 'mock_jwt_token_for_e2e_testing');
    });

    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
  });

  test('Renders jobs list with extracted skill chips and location', async ({ page }) => {
    await expect(page.locator('text=Senior Backend Engineer')).toBeVisible();
    await expect(page.locator('text=Frontend React Specialist')).toBeVisible();

    // Verify skill chips extracted from job description
    const backendCard = page.locator('.rh-job-card:has-text("Senior Backend Engineer")');
    await expect(backendCard.getByText('Java', { exact: true })).toBeVisible();
    await expect(backendCard.getByText('Spring Boot', { exact: true })).toBeVisible();

    const frontendCard = page.locator('.rh-job-card:has-text("Frontend React Specialist")');
    await expect(frontendCard.getByText('React', { exact: true })).toBeVisible();
  });

  test('Recruiter sees Add Job button and can open modal with char counters', async ({ page }) => {
    const addJobBtn = page.locator('#add-job-button, button:has-text("Add Job")').first();
    await expect(addJobBtn).toBeVisible();
    await addJobBtn.click();

    // Verify Modal
    await expect(page.locator('h2:has-text("Create Job Opening")')).toBeVisible();
    const titleInput = page.locator('#job-title');
    await expect(titleInput).toBeVisible();

    // Test character counter
    await titleInput.fill('Senior Platform Lead');
    await expect(page.locator('text=20/150')).toBeVisible();

    // Quick-add skill chip
    const quickSkillChip = page.locator('button:has-text("+ Docker"), .rh-chip:has-text("Docker")').first();
    await expect(quickSkillChip).toBeVisible();
    await quickSkillChip.click();
    const descInput = page.locator('#job-description');
    await expect(descInput).toHaveValue(/Docker/);

    // Cancel modal
    await page.locator('button:has-text("Cancel")').first().click();
    await expect(page.locator('h2:has-text("Create Job Opening")')).not.toBeVisible();
  });

  test('Clicking View Details opens 560px Drawer with complete job information', async ({ page }) => {
    const detailsBtn = page.locator('.rh-job-card:has-text("Senior Backend Engineer") button:has-text("View Details")');
    await detailsBtn.click();

    // Verify Drawer is open
    const drawer = page.locator('aside, [role="dialog"]').filter({ hasText: 'Senior Backend Engineer' });
    await expect(drawer).toBeVisible();
    await expect(drawer.locator('text=Target ATS Skills')).toBeVisible();
    await expect(drawer.locator('text=Refer Candidate to this Role')).toBeVisible();

    // Close drawer via Escape key
    await page.keyboard.press('Escape');
    await expect(drawer).not.toBeVisible();
  });

  test('Search filter narrows down the displayed jobs list', async ({ page }) => {
    const searchInput = page.locator('#search-jobs-input');
    await searchInput.fill('React');

    await expect(page.locator('text=Frontend React Specialist')).toBeVisible();
    await expect(page.locator('text=Senior Backend Engineer')).not.toBeVisible();

    // Clear search
    await searchInput.fill('');
    await expect(page.locator('text=Senior Backend Engineer')).toBeVisible();
  });
});
