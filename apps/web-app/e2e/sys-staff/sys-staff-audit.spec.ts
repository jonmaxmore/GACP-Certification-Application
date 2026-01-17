import { test, expect } from '@playwright/test';
import staffData from '../data/staff-test-data.json';

test.describe('Staff: Audit Execution', () => {

    test.beforeEach(async ({ page }) => {
        // Using Reviewer credentials to act as Auditor (Dual Role)
        const { email, password } = staffData.reviewer;
        await page.goto('/staff/login');
        await page.fill('input[name="email"]', email);
        await page.fill('input[name="password"]', password);
        await page.getByRole('button', { name: 'เข้าสู่ระบบ' }).click();
        await expect(page).toHaveURL(/.*\/staff\/dashboard/);
    });

    test('should allow submitting field audit results', async ({ page }) => {
        page.on('dialog', dialog => dialog.accept());

        // Navigate to Audit Queue
        await page.getByRole('button', { name: /รอตรวจประเมิน/ }).click();
        await page.getByRole('link', { name: 'ตรวจสอบ' }).first().click();

        // Open Audit Checklist
        await page.getByRole('button', { name: 'ผลตรวจประเมิน' }).click();
        await expect(page.getByText('แบบบันทึกการตรวจประเมิน GACP')).toBeVisible();

        // Complete All Checks
        const checkboxes = await page.locator('input[type="checkbox"]').all();
        for (const box of checkboxes) {
            await box.check();
        }

        // Submit Result
        await page.getByRole('button', { name: 'ผ่านการประเมิน (Pass)' }).click();
        await expect(page).toHaveURL(/.*\/staff\/dashboard/);
    });

});
