import { test, expect } from '@playwright/test';

test.describe('Slice C: Referrals, Resumes & ATS Feature', () => {
  const mockStats = {
    REFERRED: 2,
    IN_REVIEW: 1,
    NEXT_ROUND: 1,
    SELECTED: 1,
    REJECTED: 0,
    total: 5,
  };

  const mockReferrals = [
    {
      id: 201,
      status: 'REFERRED',
      createdTime: '2026-11-01T10:00:00',
      atsScore: 85,
      atsLabel: 'Highly Recommended',
      matchedSkills: ['Java', 'Spring Boot', 'Docker'],
      missingSkills: ['Kubernetes'],
      job: { id: 101, title: 'Senior Backend Engineer' },
      candidate: { name: 'Alex Vance', email: 'alex@example.com', phone: '+1-555-0199' },
      referredBy: { name: 'Demo Staff', email: 'staff@demo.com' },
      hasResume: true,
      lastEmailAt: null,
    },
    {
      id: 202,
      status: 'IN_REVIEW',
      createdTime: '2026-10-31T14:30:00',
      atsScore: 65,
      atsLabel: 'Recommended',
      matchedSkills: ['React', 'JavaScript'],
      missingSkills: ['TypeScript', 'GraphQL'],
      job: { id: 102, title: 'Frontend React Specialist' },
      candidate: { name: 'Jordan Rivera', email: 'jordan@example.com', phone: '+1-555-0288' },
      referredBy: { name: 'Demo Staff', email: 'staff@demo.com' },
      hasResume: true,
      lastEmailAt: null,
    },
  ];

  test.beforeEach(async ({ page }) => {
    // Mock authentication profile as Recruiter
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

    // Mock referrals stats
    await page.route('**/referrals/stats', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockStats),
      });
    });

    // Mock referrals list
    await page.route('**/referrals?*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          content: mockReferrals,
          page: 0,
          size: 10,
          totalPages: 1,
          totalElements: mockReferrals.length,
        }),
      });
    });

    // Mock status update
    await page.route('**/referrals/*/status', async (route) => {
      const url = route.request().url();
      const match = url.match(/\/referrals\/(\d+)\/status/);
      const id = match ? Number(match[1]) : 201;
      const body = route.request().postDataJSON() || {};
      const status = body.status || 'NEXT_ROUND';

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id,
          status,
          createdTime: '2026-11-01T10:00:00',
          atsScore: 85,
          atsLabel: 'Highly Recommended',
          matchedSkills: ['Java', 'Spring Boot'],
          missingSkills: ['Docker'],
          job: { id: 101, title: 'Senior Backend Engineer' },
          candidate: { name: 'Alex Vance', email: 'alex@example.com' },
          hasResume: true,
        }),
      });
    });

    // Mock resume download / preview
    await page.route('**/referrals/*/resume?*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/pdf',
        headers: {
          'Content-Disposition': 'inline; filename="Alex_Vance-resume.pdf"',
          'X-Content-Type-Options': 'nosniff',
        },
        body: '%PDF-1.4 mock pdf content for testing',
      });
    });

    // Set auth token
    await page.addInitScript(() => {
      localStorage.setItem('jwt_token', 'mock_jwt_token_for_e2e_testing');
    });

    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Navigate to Referrals tab
    const referralsNav = page.locator('button:has-text("Referrals"), a:has-text("Referrals")').first();
    await referralsNav.click();
    await page.waitForSelector('text=Total Referrals');
  });

  test('Displays stat cards with correct metrics and status breakdown', async ({ page }) => {
    await expect(page.locator('text=Total Referrals')).toBeVisible();
    await expect(page.getByRole('button', { name: 'In Review 1' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Next Round 1' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Selected 1' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Rejected 0' })).toBeVisible();
  });

  test('Renders referrals table with candidate name, position, ATS match score, and status', async ({ page }) => {
    await expect(page.locator('text=Alex Vance')).toBeVisible();
    await expect(page.locator('text=alex@example.com')).toBeVisible();
    await expect(page.locator('text=Senior Backend Engineer')).toBeVisible();
    await expect(page.locator('text=Jordan Rivera')).toBeVisible();
    await expect(page.locator('text=Frontend React Specialist')).toBeVisible();
  });

  test('Clicking a referral opens 560px Drawer with ATS scorecard and matched/missing skills', async ({ page }) => {
    // Click row or Details button for Alex Vance
    const detailsBtn = page.locator('tr:has-text("Alex Vance") button:has-text("Details")');
    await detailsBtn.click();

    // Verify Drawer is open
    const drawer = page.locator('aside, [role="dialog"]').filter({ hasText: 'Alex Vance' });
    await expect(drawer).toBeVisible();

    // Check ATS scorecard inside Drawer
    await expect(drawer.locator('text=ATS Resume Match Analysis')).toBeVisible();
    await expect(drawer.locator('text=Matched Job Requirements')).toBeVisible();
    await expect(drawer.getByText('Java', { exact: true })).toBeVisible();
    await expect(drawer.getByText('Spring Boot', { exact: true })).toBeVisible();
    await expect(drawer.getByText('Kubernetes', { exact: true })).toBeVisible();

    // Check resume action buttons
    await expect(drawer.locator('button:has-text("Preview Resume")')).toBeVisible();
    await expect(drawer.locator('button:has-text("Download Resume")')).toBeVisible();

    // Close drawer via Escape key
    await page.keyboard.press('Escape');
    await expect(drawer).not.toBeVisible();
  });

  test('Recruiter can update status in Drawer', async ({ page }) => {
    const detailsBtn = page.locator('tr:has-text("Alex Vance") button:has-text("Details")');
    await detailsBtn.click();

    const drawer = page.locator('aside, [role="dialog"]').filter({ hasText: 'Alex Vance' });
    await expect(drawer).toBeVisible();

    // Change status using select
    const statusSelect = drawer.locator('select[aria-label="Change candidate status"]');
    await expect(statusSelect).toBeVisible();
    await statusSelect.selectOption('NEXT_ROUND');

    // Verify toast or updated status
    await expect(page.locator('text=Candidate status updated to NEXT ROUND')).toBeVisible();
  });

  test('View mode switches between Table view and Kanban board view', async ({ page }) => {
    // Switch to Kanban view
    const kanbanBtn = page.locator('button[aria-label="Kanban board view"]');
    await kanbanBtn.click();

    // Verify Kanban columns
    await expect(page.locator('text=No candidates in this stage').first()).toBeVisible();
    await expect(page.locator('text=Resume ✓').first()).toBeVisible();

    // Switch back to Table view
    const tableBtn = page.locator('button[aria-label="Table view"]');
    await tableBtn.click();
    await expect(page.locator('th:has-text("Candidate")')).toBeVisible();
  });
});
