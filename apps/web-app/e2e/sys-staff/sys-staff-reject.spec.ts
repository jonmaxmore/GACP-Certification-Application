import { test, expect } from '@playwright/test';
import staffData from '../data/staff-test-data.json';
import memberData from '../data/member-test-data.json';

const BASE_URL = 'http://localhost:3000';

test.describe('Staff: Application Rejection Flow', () => {

    test.beforeAll(async ({ request }) => {
        // Reset to Standard User state to have a fresh application
        // Ideally we want an application in 'SUBMITTED' state.
        // The reset API creates a fresh user. We might need to quickly seed an app.
        // For now, let's assume seed-staff.js has set up a 'SUBMITTED' app for one of the users?
        // Actually, seed-staff.js creates multiple apps.
        // Let's rely on the Reviewer finding a "SUBMITTED" app in the queue.
    });

    test('should allow reviewer to request revision (reject)', async ({ page }) => {
        const { email, password } = staffData.reviewer;

        // 1. Login as Reviewer
        await page.goto('/staff/login');
        await page.fill('input[name="email"]', email);
        await page.fill('input[name="password"]', password);
        await page.getByRole('button', { name: 'เข้าสู่ระบบ' }).click();
        await expect(page).toHaveURL(/.*\/staff\/dashboard/);

        // 2. Navigate to "New Request" Queue
        await page.getByRole('button', { name: /คำขอใหม่/ }).click();

        // 3. Select first application
        // We expect at least one SUBMITTED app from seed
        const reviewBtn = page.getByRole('link', { name: 'ตรวจเอกสาร' }).first();
        await expect(reviewBtn).toBeVisible();
        await reviewBtn.click();

        // 4. Reject
        // "ส่งคืนแก้ไข" button
        const rejectBtn = page.getByRole('button', { name: 'ส่งคืนแก้ไข' });
        await rejectBtn.scrollIntoViewIfNeeded();
        await rejectBtn.click();

        // 5. Fill Reason in Modal
        await expect(page.getByText('ระบุจุดที่ต้องแก้ไขอย่างละเอียด')).toBeVisible();
        await page.locator('textarea').fill('E2E Rejection: Invalid Document');
        await page.getByRole('button', { name: 'ยืนยัน' }).click();

        // 6. Verify success alert/redirect
        page.on('dialog', dialog => dialog.accept());
        await expect(page).toHaveURL(/.*\/staff\/dashboard/);
    });

});
