import { test, expect } from '@playwright/test';
import testData from '../data/member-test-data.json';

const BASE_URL = 'http://localhost:3000';

test.describe('Member: Registration', () => {
    test.describe.configure({ mode: 'serial' });

    test.beforeAll(async ({ request }) => {
        await request.post(`${BASE_URL}/api/e2e/reset`, {
            data: { farmerIdCard: testData.registration.standard_individual.idCard }
        });
    });

    test('should register a new individual account successfully', async ({ page }) => {
        const data = testData.registration.standard_individual;
        await page.goto('/register');

        // Type
        await page.locator('text=บุคคลธรรมดา').click();
        await page.getByRole('button', { name: 'ถัดไป' }).click();

        // Verify ID
        await page.fill('input[name="identifier"]', data.idCard);
        await page.getByRole('button', { name: 'ตรวจสอบ' }).click();
        await expect(page.locator('text=หมายเลขนี้สามารถใช้ลงทะเบียนได้')).toBeVisible();
        await page.getByRole('button', { name: 'ถัดไป' }).click();

        // Profile
        await page.fill('input[name="firstName"]', data.firstName);
        await page.fill('input[name="lastName"]', data.lastName);
        await page.fill('input[name="phoneNumber"]', data.phoneNumber);
        await page.fill('input[name="password"]', data.password);
        await page.fill('input[name="confirmPassword"]', data.password);

        // Submit
        await page.getByRole('button', { name: 'ยืนยันการลงทะเบียน' }).click();
        await expect(page).toHaveURL(/.*\/login/);
        await expect(page.locator('text=ลงทะเบียนสำเร็จ')).toBeVisible();
    });

    test('should prevent duplicate registration', async ({ page }) => {
        const { idCard, expectedError } = testData.registration.duplicate_check;

        await page.goto('/register');
        await page.locator('text=บุคคลธรรมดา').click();
        await page.getByRole('button', { name: 'ถัดไป' }).click();

        await page.fill('input[name="identifier"]', idCard);
        await page.getByRole('button', { name: 'ตรวจสอบ' }).click();

        await expect(page.locator(`text=${expectedError}`)).toBeVisible();
        await expect(page.getByRole('button', { name: 'ถัดไป' })).toBeDisabled();
    });

    test('should validate invalid id format client-side', async ({ page }) => {
        await page.goto('/register');
        await page.locator('text=บุคคลธรรมดา').click();
        await page.getByRole('button', { name: 'ถัดไป' }).click();

        const invalidData = testData.registration.invalid_id_format;
        await page.fill('input[name="identifier"]', invalidData.idCard);
        await page.locator('input[name="identifier"]').blur();

        await expect(page.getByRole('button', { name: 'ตรวจสอบ' })).toBeDisabled();
    });
});
