import { test, expect } from '@playwright/test';
import testData from '../data/member-test-data.json';

test.describe('Member: Dashboard', () => {

    test.beforeEach(async ({ page }) => {
        const { identifier, password } = testData.auth.success;
        await page.goto('/login');
        await page.fill('input[name="identifier"]', identifier);
        await page.fill('input[name="password"]', password);
        await page.getByRole('button', { name: 'เข้าสู่ระบบ' }).click();
        await expect(page).toHaveURL(/.*\/farmer\/dashboard/);
    });

    test('should disable sidebar on mobile and use bottom nav', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 });

        await expect(page.locator('aside')).toBeHidden();
        const bottomNav = page.locator('nav').last();
        await expect(bottomNav).toBeVisible();

        const links = [
            { name: 'คำขอ', url: '/farmer/applications' },
            { name: 'ติดตาม', url: '/tracking' },
            { name: 'การเงิน', url: '/payments' },
            { name: 'โปรไฟล์', url: '/farmer/profile' }
        ];

        for (const link of links) {
            await bottomNav.getByRole('link', { name: link.name }).click();
            await expect(page).toHaveURL(new RegExp(link.url));
        }
    });

    test('should allow navigation via sidebar on desktop', async ({ page }) => {
        await page.setViewportSize({ width: 1280, height: 720 });
        const sidebar = page.locator('aside');
        await expect(sidebar).toBeVisible();

        const links = [
            { name: 'คำขอ', url: '/farmer/applications' },
            { name: 'สถานที่', url: '/farmer/establishments' },
            { name: 'การปลูก', url: '/farmer/planting' },
            { name: 'ใบรับรอง', url: '/farmer/certificates' }
        ];

        for (const link of links) {
            await sidebar.getByRole('link', { name: link.name }).click();
            await expect(page).toHaveURL(new RegExp(link.url));
            await page.goBack();
        }
    });

    test('should verify core dashboard widgets', async ({ page }) => {
        await page.setViewportSize({ width: 1280, height: 720 });

        // Hero & Quick Actions
        await expect(page.locator('h1')).toContainText('Somsak');
        await expect(page.getByRole('link', { name: 'สร้างคำขอใหม่' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'คู่มือการใช้งาน' })).toBeVisible();

        // Stats
        await expect(page.getByText('คำขอทั้งหมด')).toBeVisible();
        await expect(page.getByText('ผ่านการรับรอง')).toBeVisible();
    });
});
