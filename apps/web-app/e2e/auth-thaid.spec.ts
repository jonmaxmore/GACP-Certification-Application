import { test, expect } from '@playwright/test';

test.describe('ThaID Login Flow', () => {

    // Override baseURL for this test file to target the Production/Docker Environment
    // Using default baseURL from playwright.config.ts (http://localhost:3000)

    test('should allow login with Mock ThaID', async ({ page }) => {
        // 1. Go to Login Page
        await page.goto('/login');

        // 2. Click "Login with ThaID"
        // Wait for button to be visible
        await expect(page.getByRole('button', { name: 'เข้าสู่ระบบด้วย ThaID' })).toBeVisible();
        await page.getByRole('button', { name: 'เข้าสู่ระบบด้วย ThaID' }).click();

        // 3. Should redirect to Mock ThaID Provider
        console.log('Waiting for redirect...');
        await page.waitForTimeout(3000);
        console.log('Current URL:', page.url());

        // Verify URL first to ensure we hit the backend
        await expect(page).toHaveURL(/.*\/mock-thaid\/authorize/);

        // Verify page content
        await expect(page.getByRole('heading', { name: 'เข้าสู่ระบบด้วย ThaID' })).toBeVisible();
        await expect(page.getByText('ระบบจำลองสำหรับนักพัฒนา')).toBeVisible();

        // 4. Click "Approve" (Simulate giving consent)
        await page.getByRole('button', { name: 'ยินยอม (Approve)' }).click();

        // 5. Should Redirect back to Callback Page
        // (Wait for status messages or URL change)
        await expect(page).toHaveURL(/.*\/auth\/callback\/thaid/);
        await expect(page.locator('text=ยืนยันตัวตนสำเร็จ')).toBeVisible({ timeout: 10000 });

        // 6. Should eventually land on Dashboard
        await expect(page).toHaveURL(/.*\/farmer\/dashboard/, { timeout: 15000 });

        // 7. Verify User Data
        // Check for specific text that indicates successful login as the mock user
        await expect(page.locator('h1')).toContainText('สมชาย');
        await expect(page.locator('h1')).toContainText('ใจดี');
    });

});
