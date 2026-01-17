import { test, expect } from '@playwright/test';
import testData from './data/member-test-data.json';

test.describe('System: Chaos & Stability Test', () => {

    test('Scenario 1: Input Fuzzing (Registration)', async ({ page }) => {
        await page.goto('/register');

        // Fuzzing Strings
        const weirdInputs = [
            '😊😎👍',
            '<script>alert(1)</script>',
            'DROP TABLE users;',
            'A'.repeat(1000) // Buffer overflow attempt
        ];

        for (const input of weirdInputs) {
            console.log(`Testing input: ${input.substring(0, 20)}...`);
            await page.fill('input[name="firstName"]', input);
            await page.fill('input[name="lastName"]', input);
            // Just checking it doesn't crash or show raw error page
            await expect(page.locator('body')).toBeVisible();
            // Expect validation error or sanitized input, but NOT a 500 page
            const serverError = page.locator('text=Internal Server Error');
            await expect(serverError).toBeHidden();
        }
    });

    test('Scenario 2: Rage Clicking (Double Submission Prevention)', async ({ page }) => {
        // Login first
        const data = testData.auth.success;
        await page.goto('/login');
        await page.fill('input[name="identifier"]', data.identifier);
        await page.fill('input[name="password"]', data.password);
        await page.getByRole('button', { name: 'เข้าสู่ระบบ', exact: true }).click();

        // Go to Profile to spam update
        await page.goto('/farmer/profile');

        const saveBtn = page.getByRole('button', { name: 'บันทึก' });

        // Edit something
        await page.fill('input[name="firstName"]', 'RageClicker-' + Date.now());

        // RAGE CLICK 10 times rapidly
        const clicks = [];
        for (let i = 0; i < 10; i++) {
            clicks.push(saveBtn.click({ delay: 50 })); // 50ms interval
        }
        await Promise.all(clicks);

        // Expect successful save notification but NO duplicate processes/errors
        await expect(page.getByText('บันทึกข้อมูลสำเร็จ')).toBeVisible();

        // Ensure we are still logged in and page is functional
        await expect(page).toHaveURL(/.*\/farmer\/profile/);
    });

    test('Scenario 3: Network Instability (Offline/Slow)', async ({ page }) => {
        // Login
        const data = testData.auth.success;
        await page.goto('/login');
        await page.fill('input[name="identifier"]', data.identifier);
        await page.fill('input[name="password"]', data.password);
        await page.getByRole('button', { name: 'เข้าสู่ระบบ', exact: true }).click();

        await page.goto('/farmer/applications/new');

        // 1. Simulate Slow Network (3G)
        const client = await page.context().newCDPSession(page);
        await client.send('Network.emulateNetworkConditions', {
            offline: false,
            latency: 500, // 500ms
            downloadThroughput: 500 * 1024, // 500 kbps
            uploadThroughput: 500 * 1024,
        });

        // Navigate through a step to see if it handles slow load (e.g. Loading spinners)
        // Note: This just ensures it doesn't timeout immediately or crash
        await page.getByRole('button', { name: 'เริ่มสร้างคำขอ' }).click();

        // 2. Simulate Offline
        await client.send('Network.emulateNetworkConditions', {
            offline: true,
            latency: 0,
            downloadThroughput: 0,
            uploadThroughput: 0,
        });

        // Try to verify network error handling (Optional - UI might just freeze or show toast)
        // await page.getByRole('button', { name: 'ถัดไป' }).click(); // Should fail

        // Reset Network
        await client.send('Network.emulateNetworkConditions', {
            offline: false,
            latency: 0,
            downloadThroughput: -1,
            uploadThroughput: -1,
        });
    });

    test('Scenario 4: Navigation Spam (Back/Forward)', async ({ page }) => {
        const data = testData.auth.success;
        await page.goto('/login');
        await page.fill('input[name="identifier"]', data.identifier);
        await page.fill('input[name="password"]', data.password);
        await page.getByRole('button', { name: 'เข้าสู่ระบบ', exact: true }).click();

        await page.goto('/farmer/dashboard');

        // Rapid Navigation
        for (let i = 0; i < 5; i++) {
            await page.goto('/farmer/applications');
            await page.goBack();
            await page.goto('/farmer/certificates');
            await page.goBack();
        }

        // Final check
        await expect(page).toHaveURL(/.*\/farmer\/dashboard/);
        await expect(page.locator('body')).toBeVisible();
    });

});
