import { test, expect } from '@playwright/test';
import testData from '../data/member-test-data.json';

test.describe('System: Dashboard & Navigation Loop', () => {

    // Login before each test
    test.beforeEach(async ({ page }) => {
        const data = testData.auth.success;
        await page.goto('/login');
        await page.fill('input[name="identifier"]', data.identifier);
        await page.fill('input[name="password"]', data.password);
        await page.getByRole('button', { name: 'เข้าสู่ระบบ', exact: true }).click();
        await expect(page).toHaveURL(/.*\/farmer\/dashboard/);
    });

    test('Scenario 1: Sidebar Navigation (Desktop)', async ({ page }) => {
        // Enforce Desktop Viewport
        await page.setViewportSize({ width: 1280, height: 720 });

        // Check Sidebar Exists
        const sidebar = page.locator('aside');
        await expect(sidebar).toBeVisible();

        // 1. Applications
        await sidebar.getByRole('link', { name: 'คำขอ' }).click();
        await expect(page).toHaveURL(/.*\/farmer\/applications/);
        await page.goBack();

        // 2. Establishments
        await sidebar.getByRole('link', { name: 'สถานที่' }).click();
        await expect(page).toHaveURL(/.*\/farmer\/establishments/);
        await page.goBack();

        // 3. Planting
        await sidebar.getByRole('link', { name: 'การปลูก' }).click();
        await expect(page).toHaveURL(/.*\/farmer\/planting/);
        await page.goBack();

        // 4. Certificates
        await sidebar.getByRole('link', { name: 'ใบรับรอง' }).click();
        await expect(page).toHaveURL(/.*\/farmer\/certificates/);
        await page.goBack();

        // 5. Tracking
        await sidebar.getByRole('link', { name: 'ติดตาม' }).click();
        await expect(page).toHaveURL(/.*\/farmer\/tracking/);
        await page.goBack();

        // 6. Payments
        await sidebar.getByRole('link', { name: 'การเงิน' }).click();
        await expect(page).toHaveURL(/.*\/farmer\/payments/);
        await page.goBack();

        // 7. Profile
        await sidebar.getByRole('link', { name: 'โปรไฟล์' }).click();
        await expect(page).toHaveURL(/.*\/farmer\/profile/);
        await page.goBack();

        // 8. Settings
        await sidebar.getByRole('link', { name: 'ตั้งค่า' }).click();
        await expect(page).toHaveURL(/.*\/farmer\/settings/);
    });

    test('Scenario 2: Bottom Navigation (Mobile)', async ({ page }) => {
        // Enforce Mobile Viewport
        await page.setViewportSize({ width: 375, height: 667 });

        // Sidebar should be hidden
        const sidebar = page.locator('aside');
        await expect(sidebar).toBeHidden();

        // Check Bottom Nav Exists
        const bottomNav = page.locator('nav').last(); // Usually the last nav in DOM
        await expect(bottomNav).toBeVisible();

        // 1. Applications (Item 2)
        await bottomNav.getByRole('link', { name: 'คำขอ' }).click();
        await expect(page).toHaveURL(/.*\/farmer\/applications/);

        // 2. Tracking (Item 3)
        await bottomNav.getByRole('link', { name: 'ติดตาม' }).click();
        await expect(page).toHaveURL(/.*\/tracking/);

        // 3. Payments (Item 4)
        await bottomNav.getByRole('link', { name: 'การเงิน' }).click();
        await expect(page).toHaveURL(/.*\/payments/);

        // 4. Profile (Item 5)
        await bottomNav.getByRole('link', { name: 'โปรไฟล์' }).click();
        await expect(page).toHaveURL(/.*\/farmer\/profile/);
    });

    test('Scenario 3: Dashboard Widgets & Data', async ({ page }) => {
        await page.setViewportSize({ width: 1280, height: 720 });

        // 1. Hero Section - Greeting
        await expect(page.locator('h1')).toContainText('Somsak');

        // 2. Create Application Button
        const appBtn = page.getByRole('link', { name: 'สร้างคำขอใหม่' });
        await expect(appBtn).toBeVisible();
        await expect(appBtn).toHaveAttribute('href', '/farmer/applications/new');

        // 3. Stats Check (Using text match for labels)
        await expect(page.getByText('คำขอทั้งหมด')).toBeVisible();
        await expect(page.getByText('ผ่านการรับรอง')).toBeVisible();

        // 4. Application Status Card (Assuming seed data has an application)
        // Adjust expectation based on seed state. If no apps, check for "Empty State"
        const cardTitle = page.getByRole('heading', { name: 'สถานะคำขอล่าสุด' }).or(page.getByText('เริ่มสร้างคำขอแร'));
        await expect(cardTitle).toBeVisible();

        // 5. Quick Menu Buttons
        await expect(page.getByRole('button', { name: 'คู่มือการใช้งาน' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'แจ้งปัญหาการใช้งาน' })).toBeVisible();
    });
});
