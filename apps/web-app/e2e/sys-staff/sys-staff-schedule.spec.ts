import { test, expect } from '@playwright/test';
import staffData from '../data/staff-test-data.json';

test.describe('Staff: Scheduling Module', () => {

    test.beforeEach(async ({ page }) => {
        const { email, password } = staffData.scheduler;
        await page.goto('/staff/login');
        await page.fill('input[name="email"]', email);
        await page.fill('input[name="password"]', password);
        await page.getByRole('button', { name: 'เข้าสู่ระบบ' }).click();
        await expect(page).toHaveURL(/.*\/staff\/dashboard/);
    });

    test('should assign auditor and date to pending application', async ({ page }) => {
        page.on('dialog', dialog => dialog.accept());

        // Navigate to Queue
        await page.getByRole('button', { name: /รอจัดคิว/ }).click();
        await page.getByRole('link', { name: 'จัดคิว' }).first().click();

        // Fill Scheduling Form
        await expect(page.getByText('ลงนัดหมายการตรวจ')).toBeVisible();
        await page.locator('input[type="date"]').fill('2026-02-01');
        await page.locator('select').selectOption({ index: 1 });

        // Submit
        await page.getByRole('button', { name: 'บันทึกนัดหมาย' }).click();
        await expect(page).toHaveURL(/.*\/staff\/dashboard/);
    });

});
