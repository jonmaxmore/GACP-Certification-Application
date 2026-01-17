import { test, expect } from '@playwright/test';
import testData from '../data/member-test-data.json';

test.describe('System: Member Profile Loop', () => {

    test.beforeEach(async ({ page }) => {
        // Login before each test
        // Optimally, we could store state in a json file, but for now manual login is safer 
        // to ensure we test the full flow or use `test.use({ storageState: ... })` if we advanced.
        const data = testData.auth.success;
        await page.goto('/login');
        await page.fill('input[name="identifier"]', data.identifier);
        await page.fill('input[name="password"]', data.password);
        await page.getByRole('button', { name: 'เข้าสู่ระบบ', exact: true }).click();
        await expect(page).toHaveURL(/.*\/farmer\/dashboard/);
    });

    test('Scenario 1: View Profile Data', async ({ page }) => {
        await page.goto('/farmer/profile');

        // Check if data loaded (Somsak)
        await expect(page.locator('input[name="firstName"]')).toHaveValue('Somsak');
        await expect(page.locator('input[name="lastName"]')).toHaveValue('LoopTest');
    });

    test('Scenario 2: Update Profile', async ({ page }) => {
        await page.goto('/farmer/profile');

        const newPhone = '0899999999';
        await page.fill('input[name="phoneNumber"]', newPhone);

        await page.getByRole('button', { name: 'บันทึก' }).click();

        // Expect toast or success message
        // Adjust locator based on actual UI
        await expect(page.locator('text=บันทึกสำเร็จ')).toBeVisible();

        // Reload to verify persistence
        await page.reload();
        await expect(page.locator('input[name="phoneNumber"]')).toHaveValue(newPhone);
    });
});
