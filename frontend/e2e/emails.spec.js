import { test, expect } from '@playwright/test';

test.describe('Slice D: Recruiter Candidate Outreach Email Feature', () => {
  const mockReferral = {
    id: 201,
    status: 'IN_REVIEW',
    createdTime: '2026-11-01T10:00:00',
    atsScore: 88,
    atsLabel: 'Highly Recommended',
    matchedSkills: ['Java', 'Spring Boot'],
    missingSkills: ['Kubernetes'],
    job: { id: 101, title: 'Senior Backend Engineer' },
    candidate: { name: 'Alex Vance', email: 'alex@example.com', phone: '+1-555-0199' },
    referredBy: { name: 'Demo Staff', email: 'staff@demo.com' },
    hasResume: true,
    lastEmailAt: null,
  };

  const mockDraftNextRound = {
    to: 'alex@example.com',
    subject: 'Interview Invitation: Next Round for Senior Backend Engineer',
    body: 'Hi Alex Vance,\n\nWe would like to invite you to the next round of interviews.\n\nDate: [Date and Time]\nLocation: [Link/Location]\n\nBest regards,\nDemo Recruiter',
  };

  const mockDraftSelected = {
    to: 'alex@example.com',
    subject: 'Job Offer: Senior Backend Engineer at ReferralHub',
    body: 'Hi Alex Vance,\n\nCongratulations! We are thrilled to extend an offer.\n\nBest regards,\nDemo Recruiter',
  };

  const mockSentEmail = {
    id: 901,
    type: 'NEXT_ROUND',
    toEmail: 'alex@example.com',
    subject: 'Interview Invitation: Next Round for Senior Backend Engineer',
    body: 'Hi Alex Vance,\n\nWe would like to invite you to the next round.\n\nBest regards,\nDemo Recruiter',
    status: 'SENT',
    errorMessage: null,
    sentAt: '2026-11-01T11:00:00',
    sentBy: { name: 'Demo Recruiter', email: 'recruiter@demo.com' },
  };

  const mockFailedEmail = {
    id: 902,
    type: 'NEXT_ROUND',
    toEmail: 'alex@example.com',
    subject: 'Failed Outreach Notification',
    body: 'Attempted to send interview details',
    status: 'FAILED',
    errorMessage: 'Mail server connection timeout',
    sentAt: '2026-11-01T10:30:00',
    sentBy: { name: 'Demo Recruiter', email: 'recruiter@demo.com' },
  };

  async function setupCommonRecruiterMocks(page) {
    await page.addInitScript(() => {
      window.localStorage.setItem('jwt_token', 'mock_jwt_recruiter');
    });

    await page.route('**/auth/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ name: 'Demo Recruiter', email: 'recruiter@demo.com', role: 'RECRUITER' }),
      });
    });

    await page.route('**/referrals/stats', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ REFERRED: 0, IN_REVIEW: 1, NEXT_ROUND: 0, SELECTED: 0, REJECTED: 0, total: 1 }),
      });
    });

    await page.route('**/referrals?*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          content: [mockReferral],
          page: 0,
          size: 10,
          totalElements: 1,
          totalPages: 1,
        }),
      });
    });

    await page.route('**/referrals/201/email-draft?type=NEXT_ROUND', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockDraftNextRound) });
    });

    await page.route('**/referrals/201/email-draft?type=SELECTED', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockDraftSelected) });
    });

    await page.route('**/referrals/201/email-draft?type=REJECTED', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ to: 'alex@example.com', subject: 'Application Update', body: 'Dear Alex...' }),
      });
    });

    await page.route('**/referrals/201/email-draft?type=CUSTOM', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ to: 'alex@example.com', subject: '', body: '' }),
      });
    });
  }

  async function navigateToReferralsTab(page) {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    const referralsNav = page.locator('button:has-text("Referrals"), a:has-text("Referrals")').first();
    await referralsNav.click();
    await page.waitForSelector('text=Total Referrals', { timeout: 10000 });
  }

  async function openReferralDrawer(page) {
    const detailsBtn = page.locator('tr:has-text("Alex Vance") button:has-text("Details")');
    await detailsBtn.click();
    await page.waitForSelector('text=Candidate Information', { timeout: 10000 });
  }

  test.describe('As Recruiter', () => {
    test('opens detail drawer, displays outreach history and allows drafting NEXT_ROUND email', async ({ page }) => {
      await setupCommonRecruiterMocks(page);

      await page.route('**/referrals/201/emails', async (route) => {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
      });

      await navigateToReferralsTab(page);
      await openReferralDrawer(page);

      // Verify Outreach History section shown with 0 emails
      await expect(page.locator('text=Outreach History (0)')).toBeVisible();
      await expect(page.locator('text=No outreach emails sent to this candidate yet.')).toBeVisible();

      // Email Candidate button should be visible
      await expect(page.locator('button:has-text("Email Candidate")')).toBeVisible();

      // Open EmailModal
      await page.locator('button:has-text("Email Candidate")').click();

      // Verify modal opened
      await expect(page.locator('text=Email Candidate: Alex Vance')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Next Round', exact: true })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Job Offer', exact: true })).toBeVisible();

      // Draft should be pre-filled
      await expect(page.locator('#email-subject-input')).toHaveValue(mockDraftNextRound.subject, { timeout: 10000 });
      await expect(page.locator('#email-body-input')).toHaveValue(mockDraftNextRound.body, { timeout: 10000 });

      // Switches present and checked
      await expect(page.locator('#switch-cc-me')).toBeChecked();
      await expect(page.locator('#switch-notify-referrer')).toBeChecked();
      await expect(page.locator('#switch-update-status')).toBeChecked();

      // Close modal
      await page.locator('button:has-text("Cancel")').click();
      await expect(page.locator('text=Email Candidate: Alex Vance')).not.toBeVisible();
    });

    test('switches templates and sends email, refreshing history', async ({ page }) => {
      await setupCommonRecruiterMocks(page);

      let sentPayload = null;
      let hasSent = false;

      await page.route('**/referrals/201/emails', async (route) => {
        if (route.request().method() === 'POST') {
          sentPayload = route.request().postDataJSON();
          hasSent = true;
          await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockSentEmail) });
        } else {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(hasSent ? [mockSentEmail] : []),
          });
        }
      });

      await navigateToReferralsTab(page);
      await openReferralDrawer(page);

      // Open email composer via Compose Email button in history section
      await page.locator('button:has-text("Compose Email")').click();
      await expect(page.locator('text=Email Candidate: Alex Vance')).toBeVisible();

      // Switch to Job Offer template
      await page.getByRole('button', { name: 'Job Offer', exact: true }).click();
      await expect(page.locator('#email-subject-input')).toHaveValue(mockDraftSelected.subject, { timeout: 10000 });

      // Switch back to Next Round
      await page.getByRole('button', { name: 'Next Round', exact: true }).click();
      await expect(page.locator('#email-subject-input')).toHaveValue(mockDraftNextRound.subject, { timeout: 10000 });

      // Send the email
      await page.locator('button:has-text("Send Email")').click();

      // Success toast visible
      await expect(page.getByText('Email successfully sent', { exact: false })).toBeVisible({ timeout: 10000 });
      await expect(page.locator('text=Email Candidate: Alex Vance')).not.toBeVisible();

      // Payload correctness
      expect(sentPayload).not.toBeNull();
      expect(sentPayload.type).toBe('NEXT_ROUND');
      expect(sentPayload.ccMe).toBe(true);
      expect(sentPayload.notifyReferrer).toBe(true);
      expect(sentPayload.updateStatus).toBe(true);

      // History refreshes with sent email
      await expect(page.locator('text=Outreach History (1)')).toBeVisible({ timeout: 10000 });
    });

    test('displays delivery failure details in outreach history card', async ({ page }) => {
      await setupCommonRecruiterMocks(page);

      await page.route('**/referrals/201/emails', async (route) => {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([mockFailedEmail]) });
      });

      await navigateToReferralsTab(page);
      await openReferralDrawer(page);

      await expect(page.locator('text=Outreach History (1)')).toBeVisible();
      await expect(page.getByText('FAILED', { exact: true })).toBeVisible();
      await expect(page.locator('text=Error: Mail server connection timeout')).toBeVisible();
    });

    test('sent email shows SENT badge and subject in history', async ({ page }) => {
      await setupCommonRecruiterMocks(page);

      await page.route('**/referrals/201/emails', async (route) => {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([mockSentEmail]) });
      });

      await navigateToReferralsTab(page);
      await openReferralDrawer(page);

      await expect(page.locator('text=Outreach History (1)')).toBeVisible();
      await expect(page.getByText('SENT', { exact: true })).toBeVisible();
      await expect(page.locator('text=Interview Invitation: Next Round for Senior Backend Engineer')).toBeVisible();
      // Type badge in history card - scoped to avoid collision with status filter buttons
      await expect(page.locator('[data-testid="email-type-badge"]').first()).toBeVisible();
    });
  });

  test.describe('As Employee', () => {
    test('does NOT display Email Candidate button or Outreach History in drawer', async ({ page }) => {
      await page.addInitScript(() => {
        window.localStorage.setItem('jwt_token', 'mock_jwt_employee');
      });

      await page.route('**/auth/me', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ name: 'Demo Employee', email: 'employee@demo.com', role: 'EMPLOYEE' }),
        });
      });

      await page.route('**/referrals/stats', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ REFERRED: 1, IN_REVIEW: 0, NEXT_ROUND: 0, SELECTED: 0, REJECTED: 0, total: 1 }),
        });
      });

      await page.route('**/referrals?*', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            content: [mockReferral],
            page: 0,
            size: 10,
            totalElements: 1,
            totalPages: 1,
          }),
        });
      });

      await navigateToReferralsTab(page);

      // Open drawer
      const detailsBtn = page.locator('tr:has-text("Alex Vance") button:has-text("Details")');
      await detailsBtn.click();
      await page.waitForSelector('text=Candidate Information', { timeout: 10000 });

      // Candidate info is visible (use heading role to avoid ambiguity)
      await expect(page.getByRole('heading', { name: 'Alex Vance' })).toBeVisible();

      // Email outreach elements NOT visible for employees
      await expect(page.locator('button:has-text("Email Candidate")')).not.toBeVisible();
      await expect(page.locator('text=Outreach History')).not.toBeVisible();
    });
  });
});
