import { test, expect } from '@playwright/test';
import testData from '../data/member-test-data.json';

const BASE_URL = 'http://localhost:3000';

test.describe('System: Member Registration Loop', () => {
    test.describe.configure({ mode: 'serial' });

    test.beforeAll(async ({ request }) => {
        // Reset Test Data to ensure "Standard" user doesn't exist yet
        await request.post(`${BASE_URL}/api/e2e/reset`, {
            data: { farmerIdCard: testData.registration.standard_individual.idCard }
        });
    });

    test('Scenario 1: Standard Individual Registration (Happy Path)', async ({ page }) => {
        const data = testData.registration.standard_individual;

        await page.goto('/register');

        // Step 1: Account Type
        await page.locator('text=บุคคลธรรมดา').click(); // Individual
        await page.getByRole('button', { name: 'ถัดไป' }).click();

        // Step 2: Verification (ID Card)
        await page.fill('input[name="identifier"]', data.idCard);
        await page.getByRole('button', { name: 'ตรวจสอบ' }).click();

        // Should indicate available
        await expect(page.locator('text=หมายเลขนี้สามารถใช้ลงทะเบียนได้')).toBeVisible();
        await page.getByRole('button', { name: 'ถัดไป' }).click();

        // Step 3: Personal Info
        await page.fill('input[name="firstName"]', data.firstName);
        await page.fill('input[name="lastName"]', data.lastName);
        await page.fill('input[name="phoneNumber"]', data.phoneNumber);
        await page.fill('input[name="password"]', data.password);
        await page.fill('input[name="confirmPassword"]', data.password);

        // Submit
        await page.getByRole('button', { name: 'ยืนยันการลงทะเบียน' }).click();

        // Expect Redirect to Login
        await expect(page).toHaveURL(/.*\/login/);
        await expect(page.locator('text=ลงทะเบียนสำเร็จ')).toBeVisible();
    });

    test('Scenario 2: Duplicate Registration Check', async ({ page }) => {
        // This runs AFTER Scenario 1, so the user already exists
        const data = testData.registration.duplicate_check;

        await page.goto('/register');
        await page.locator('text=บุคคลธรรมดา').click();
        await page.getByRole('button', { name: 'ถัดไป' }).click();

        // Enter Duplicate ID
        await page.fill('input[name="identifier"]', data.idCard);
        await page.getByRole('button', { name: 'ตรวจสอบ' }).click();

        // Expect Error Message
        await expect(page.locator(`text=${data.expectedError}`)).toBeVisible();

        // Next button should be disabled or allow proceeding but block later?
        // Usually Wizard blocks 'Next' if step is invalid. 
        // Let's verify we cannot proceed or the message persists.
        await expect(page.getByRole('button', { name: 'ถัดไป' })).toBeDisabled();
    });

    test('Scenario 3: Invalid ID Format (Client-side Validation)', async ({ page }) => {
        const data = testData.registration.invalid_id_format;

        await page.goto('/register');
        await page.locator('text=บุคคลธรรมดา').click();
        await page.getByRole('button', { name: 'ถัดไป' }).click();

        await page.fill('input[name="identifier"]', data.idCard);
        // Blur to trigger validation
        await page.locator('input[name="identifier"]').blur();

        // Expect Validation Error (HTML5 or Custom)
        // Assuming custom error text below input
        // Adjust locator based on actual UI implementation
        // If not explicit text, check if 'Next' is disabled
        await expect(page.getByRole('button', { name: 'ตรวจสอบ' })).toBeDisabled();
    });
});
