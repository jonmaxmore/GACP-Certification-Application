import { test, expect } from '@playwright/test';
import staffData from '../data/staff-test-data.json';

test.describe('Staff: Reviewer Dashboard Loop', () => {

    test.beforeEach(async ({ page }) => {
        // Login as Reviewer
        await page.goto('/staff/login');
        await page.fill('input[name="email"]', staffData.reviewer.email);
        await page.fill('input[name="password"]', staffData.reviewer.password);
        await page.getByRole('button', { name: 'เข้าสู่ระบบ' }).click();

        // precise URL match or partial
        await expect(page).toHaveURL(/.*\/staff\/dashboard/);
        // Verify Role Label
        await expect(page.getByText('ผู้ตรวจเอกสาร/ตรวจประเมิน')).toBeVisible();
    });

    test('Scenario 1: View Review Queue', async ({ page }) => {
        // Check for "Waiting for Review" tab or section
        const pendingTab = page.getByRole('button', { name: /รอตรวจเอกสาร/ });
        await expect(pendingTab).toBeVisible();
        await pendingTab.click();

        // Verify Data Table is present
        await expect(page.locator('table')).toBeVisible();

        // Take a screenshot for evidence
        // await page.screenshot({ path: 'reviewer-dashboard.png' });
    });

    test('Scenario 2: Review and Approve Application', async ({ page }) => {
        // Navigate to Waiting for Review
        await page.getByRole('button', { name: /รอตรวจเอกสาร/ }).click();

        // Find Check button
        const checkBtn = page.getByRole('link', { name: 'ตรวจสอบ' }).first();
        await expect(checkBtn).toBeVisible();
        await checkBtn.click();

        // Verify Detail Page
        await expect(page.getByText('รายละเอียดคำขอ')).toBeVisible();

        // Click Approve
        const approveBtn = page.getByRole('button', { name: 'อนุมัติเอกสาร' });
        await expect(approveBtn).toBeVisible();
        await approveBtn.click();

        // Modal Confirmation
        await expect(page.getByText('ยืนยันอนุมัติเอกสาร')).toBeVisible();
        await page.getByPlaceholder('หมายเหตุ (ถ้ามี)...').fill('Approved via E2E Test');
        await page.getByRole('button', { name: 'ยืนยัน' }).click();

        // Verify Success 
        // Alert might be hard to catch, check for redirection or status change
        // We mocked success alert? No, `window.alert` needs handling.
        page.on('dialog', dialog => dialog.accept());

        await expect(page).toHaveURL(/.*\/staff\/dashboard/);
    });

});
