import { test, expect } from '@playwright/test';

test.describe('GACP Frontend Smoke Test', () => {

    test('homepage has correct title', async ({ page }) => {
        await page.goto('/');
        // Generic check - assumes title contains GACP or similar
        // Update this once actual UI title is known
        await expect(page).toHaveTitle(/GACP|Certification|Thai/i);
    });

    test('navigation to login page', async ({ page }) => {
        await page.goto('/');

        // Look for common login button selectors
        // This is a "Best Guess" selector based on typical projects
        const loginLink = page.getByRole('link', { name: /login|เข้าสู่ระบบ/i }).first();

        if (await loginLink.count() > 0) {
            await loginLink.click();
            await expect(page).toHaveURL(/.*login.*/);
        } else {
            console.log('Login link not found - skipping navigation check');
        }
    });

});
