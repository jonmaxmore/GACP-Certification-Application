import { test, expect } from '@playwright/test';
import staffData from '../data/staff-test-data.json';

test.describe('Staff: Reviewer Modules', () => {

    test.beforeEach(async ({ page }) => {
        const { email, password } = staffData.reviewer;
        await page.goto('/staff/login');
        await page.fill('input[name="email"]', email);
        await page.fill('input[name="password"]', password);
        await page.getByRole('button', { name: 'เข้าสู่ระบบ' }).click();
        await expect(page).toHaveURL(/.*\/staff\/dashboard/);
    });

    test('should display incoming review queue', async ({ page }) => {
        const pendingTab = page.getByRole('button', { name: /รอตรวจเอกสาร/ });
        await expect(pendingTab).toBeVisible();
        await pendingTab.click();
        await expect(page.locator('table')).toBeVisible();
    });

    test('should allow approving a submitted application', async ({ page }) => {
        // Handle Alerts
        page.on('dialog', dialog => dialog.accept());

        // Navigate to First Item
        await page.getByRole('button', { name: /รอตรวจเอกสาร/ }).click();
        await page.getByRole('link', { name: 'ตรวจสอบ' }).first().click();

        // Approve Flow
        await expect(page.getByText('รายละเอียดคำขอ')).toBeVisible();
        await page.getByRole('button', { name: 'อนุมัติเอกสาร' }).click();

        await expect(page.getByText('ยืนยันอนุมัติเอกสาร')).toBeVisible();
        await page.getByPlaceholder('หมายเหตุ (ถ้ามี)...').fill('Approved via E2E Test');
        await page.getByRole('button', { name: 'ยืนยัน' }).click();

        await expect(page).toHaveURL(/.*\/staff\/dashboard/);
    });

});
