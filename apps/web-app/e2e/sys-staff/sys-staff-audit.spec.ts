import { test, expect } from '@playwright/test';
import staffData from '../data/staff-test-data.json';

test.describe('Staff: Auditor Loop', () => {

    test.beforeEach(async ({ page }) => {
        // Login as Reviewer/Auditor (Dual role in test data)
        await page.goto('/staff/login');
        await page.fill('input[name="email"]', staffData.reviewer.email); // Using 'reviewer' as auditor
        await page.fill('input[name="password"]', staffData.reviewer.password);
        await page.getByRole('button', { name: 'เข้าสู่ระบบ' }).click();
        await expect(page).toHaveURL(/.*\/staff\/dashboard/);
    });

    test('Scenario 1: Complete Audit', async ({ page }) => {
        // Navigate to Waiting for Audit
        // Tabs might be Reviewer focused pending on Role.
        // Reviewer role sees "audits" tab.
        await page.getByRole('button', { name: /รอตรวจประเมิน/ }).click();

        // Find "Check" button for Audit
        const checkBtn = page.getByRole('link', { name: 'ตรวจสอบ' }).first();
        await expect(checkBtn).toBeVisible();
        await checkBtn.click();

        // Switch to Audit Tab in Detail
        await page.getByRole('button', { name: 'ผลตรวจประเมิน' }).click();

        // Verify Checklist
        await expect(page.getByText('แบบบันทึกการตรวจประเมิน GACP')).toBeVisible();

        // Check Items
        const checkboxes = await page.locator('input[type="checkbox"]').all();
        for (const box of checkboxes) {
            await box.check();
        }

        // Handle Confirmation Dialog
        page.on('dialog', dialog => dialog.accept());

        // Submit Pass
        await page.getByRole('button', { name: 'ผ่านการประเมิน (Pass)' }).click();

        // Verify Redirect
        await expect(page).toHaveURL(/.*\/staff\/dashboard/);
    });

});
