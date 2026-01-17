import { test, expect } from '@playwright/test';
import testData from '../data/member-test-data.json';

test.describe('Authentication System', () => {
    test.describe.configure({ mode: 'serial' });

    test('should lock account after 5 failed attempts', async ({ page }) => {
        const { identifier } = testData.auth.lockout_target;
        await page.goto('/login');

        // Brute force simulation
        for (let i = 0; i < 5; i++) {
            await page.fill('input[name="identifier"]', identifier);
            await page.fill('input[name="password"]', 'WrongPass123!');
            await page.getByRole('button', { name: 'เข้าสู่ระบบ' }).click();
            await expect(page.locator('text=รหัสผ่านไม่ถูกต้อง')).toBeVisible();
            await page.reload();
        }

        // Verify lockout
        await page.fill('input[name="identifier"]', identifier);
        await page.fill('input[name="password"]', 'WrongPass123!');
        await page.getByRole('button', { name: 'เข้าสู่ระบบ' }).click();

        await expect(page.locator('text=บัญชีถูกระงับ')).toBeVisible();
    });

    test('should login successfully with valid credentials', async ({ page }) => {
        const { identifier, password } = testData.auth.success;

        await page.goto('/login');
        await page.fill('input[name="identifier"]', identifier);
        await page.fill('input[name="password"]', password);
        await page.getByRole('button', { name: 'เข้าสู่ระบบ' }).click();

        await expect(page).toHaveURL(/.*\/farmer\/dashboard/);
    });

    test('should support ThaID login if enabled', async ({ page }) => {
        await page.goto('/login');

        const thaidBtn = page.getByRole('button', { name: 'เข้าสู่ระบบด้วย ThaID' });

        if (!await thaidBtn.isVisible()) {
            console.log('ThaID disabled, skipping.');
            return;
        }

        await thaidBtn.click();
        await page.waitForURL(/.*\/mock-thaid\/authorize/);
        await page.getByRole('button', { name: 'ยินยอม (Approve)' }).click();

        await expect(page).toHaveURL(/.*\/farmer\/dashboard/);
        await expect(page.getByText('จัดการคำขอ')).toBeVisible();
    });

    test('should handle logout & session security', async ({ page }) => {
        const { identifier, password } = testData.auth.success;

        // Login
        await page.goto('/login');
        await page.fill('input[name="identifier"]', identifier);
        await page.fill('input[name="password"]', password);
        await page.getByRole('button', { name: 'เข้าสู่ระบบ' }).click();
        await expect(page).toHaveURL(/.*\/farmer\/dashboard/);

        // Verify Token
        const cookies = await page.context().cookies();
        expect(cookies.find(c => c.name === 'auth_token')).toBeDefined();

        // Logout
        await page.getByRole('button', { name: /Som/ }).first().click();
        await page.getByText('ออกจากระบบ').click();
        await expect(page).toHaveURL(/.*\/login/);

        // Guard Check
        await page.goto('/farmer/dashboard');
        await expect(page).toHaveURL(/.*\/login/);
    });
});
