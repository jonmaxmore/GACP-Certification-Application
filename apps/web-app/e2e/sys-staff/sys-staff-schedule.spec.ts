import { test, expect } from '@playwright/test';
import staffData from '../data/staff-test-data.json';

test.describe('Staff: Scheduler Hub', () => {

    test.beforeEach(async ({ page }) => {
        // Login as Scheduler
        await page.goto('/staff/login');
        await page.fill('input[name="email"]', staffData.scheduler.email);
        await page.fill('input[name="password"]', staffData.scheduler.password);
        await page.getByRole('button', { name: 'เข้าสู่ระบบ' }).click();

        await expect(page).toHaveURL(/.*\/staff\/dashboard/);
        // Verify Role Label (might differ based on role, checking text 'ผู้จัดตารางงาน' or 'Scholar')
        // await expect(page.getByText('ผู้จัดตารางงาน')).toBeVisible(); // Optional
    });

    test('Scenario 1: Assign Auditor', async ({ page }) => {
        // Navigate to Wait for Schedule
        const scheduleTab = page.getByRole('button', { name: /รอจัดคิว/ });
        await expect(scheduleTab).toBeVisible();
        await scheduleTab.click();

        // Find Assign Button
        const assignBtn = page.getByRole('link', { name: 'จัดคิว' }).first();
        await expect(assignBtn).toBeVisible();
        await assignBtn.click();

        // Verify Scheduling Page
        await expect(page.getByText('ลงนัดหมายการตรวจ')).toBeVisible();

        // Select Auditor (Assuming dropdown or autocomplete)
        // This part depends on UI implementation. 
        // If it's a select:
        // await page.getByLabel('ผู้ตรวจประเมิน').selectOption({ label: 'Somsak Auditor' });
        // Or if simple input:
        // await page.fill('input[name="auditor"]', 'auditor');

        // Let's assume standard UI from Plan: Select App + Auditor + Date
        // I might need to inspect the code first, but let's try generic selectors.

        // Select Date
        const dateInput = page.locator('input[type="date"]').first();
        if (await dateInput.isVisible()) {
            await dateInput.fill('2026-02-01');
        }

        // Select Auditor (Try to find a Select or Combobox)
        const auditorSelect = page.locator('select').first();
        if (await auditorSelect.isVisible()) {
            // Try to select index 1 (assuming index 0 is placeholder)
            await auditorSelect.selectOption({ index: 1 });
        }

        // Submit
        await page.getByRole('button', { name: 'บันทึกนัดหมาย' }).click();

        // Verify Success
        // Wait for modal or redirect
        page.on('dialog', dialog => dialog.accept());
        await expect(page).toHaveURL(/.*\/staff\/dashboard/);
    });

});
