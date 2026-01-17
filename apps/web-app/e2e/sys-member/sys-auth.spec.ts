import { test, expect } from '@playwright/test';
import testData from '../data/member-test-data.json';

test.describe('System: Authentication Loop', () => {
    test.describe.configure({ mode: 'serial' });

    test('Scenario 1: Account Lockout (5 Failed Attempts)', async ({ page }) => {
        const user = testData.auth.lockout_target;
        // Ensure user exists or use a dedicated test user. 
        // For E2E, we might need a fresh user or reset state if possible. 
        // Here we just loop 5 times.

        await page.goto('/login');

        for (let i = 0; i < 5; i++) {
            await page.fill('input[name="identifier"]', user.identifier);
            await page.fill('input[name="password"]', 'WrongPass123!');
            await page.getByRole('button', { name: 'เข้าสู่ระบบ', exact: true }).click();
            await expect(page.locator('text=รหัสผ่านไม่ถูกต้อง')).toBeVisible();
            await page.reload(); // Reload to clear form state if needed
        }

        // 6th Attempt should see Lockout message
        await page.fill('input[name="identifier"]', user.identifier);
        await page.fill('input[name="password"]', 'WrongPass123!');
        await page.getByRole('button', { name: 'เข้าสู่ระบบ', exact: true }).click();

        // Match specific lockout message
        await expect(page.locator('text=บัญชีถูกระงับ')).toBeVisible();
    });

    test('Scenario 2: Login Check (Standard User)', async ({ page }) => {
        const data = testData.auth.success;
        await page.goto('/login');
        await page.fill('input[name="identifier"]', data.identifier);
        await page.fill('input[name="password"]', data.password);
        await page.getByRole('button', { name: 'เข้าสู่ระบบ', exact: true }).click();
        await expect(page).toHaveURL(/.*\/farmer\/dashboard/);
    });

    test('Scenario 3: Login with Mock ThaID (Enabled)', async ({ page }) => {
        // Only run if Mock Provider is Active (Check Env or just try)
        await page.goto('/login');

        const thaidBtn = page.locator('button').filter({ hasText: 'เข้าสู่ระบบด้วย ThaID' });
        if (await thaidBtn.isVisible()) {
            await thaidBtn.click();

            // Should redirect to Mock Provider
            // Note: The Mock Provider URL might vary in Docker vs Local. 
            // We expect at least a domain change or path change.
            await page.waitForURL(/.*\/mock-thaid\/authorize/, { timeout: 15000 });

            // Click Approve
            await page.getByRole('button', { name: 'ยินยอม (Approve)' }).click();

            // Redirect back -> Auto Login -> Dashboard
            await expect(page).toHaveURL(/.*\/farmer\/dashboard/, { timeout: 30000 });

            const userMenu = page.locator('button', { hasText: 'Somchai' }); // Mock ThaID user name
            // Or just check dashboard element
            await expect(page.locator('text=จัดการคำขอ')).toBeVisible();
        } else {
            console.log('Skipping ThaID test: Button not visible');
        }
    });

    test('Scenario 4: Session & Logout', async ({ page }) => {
        const data = testData.auth.success;

        // 1. Login
        await page.goto('/login');
        await page.fill('input[name="identifier"]', data.identifier);
        await page.fill('input[name="password"]', data.password);
        await page.getByRole('button', { name: 'เข้าสู่ระบบ', exact: true }).click();
        await expect(page).toHaveURL(/.*\/farmer\/dashboard/);

        // 2. Check Cookie (HTTPOnly check is hard in pure Browser context, but we check existence)
        // Playwright access cookies:
        const cookies = await page.context().cookies();
        const token = cookies.find(c => c.name === 'auth_token');
        expect(token).toBeDefined();

        // 3. Logout
        // Open User Menu
        await page.getByRole('button', { name: /Som/ }).first().click(); // Open menu
        await page.getByText('ออกจากระบบ').click();

        await expect(page).toHaveURL(/.*\/login/);

        // 4. Verify Redirect on Protected Route
        await page.goto('/farmer/dashboard');
        await expect(page).toHaveURL(/.*\/login/);
    });
});
