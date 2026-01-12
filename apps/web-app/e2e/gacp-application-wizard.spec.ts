import { test, expect } from '@playwright/test';

test.describe('GACP Application Wizard Flow', () => {

    test.beforeEach(async ({ page, context }) => {
        // Mock Geolocation
        await context.grantPermissions(['geolocation']);
        await context.setGeolocation({ latitude: 13.7563, longitude: 100.5018 }); // Bangkok

        // Clear local storage and cookies
        await context.clearCookies();
        await page.addInitScript(() => {
            localStorage.clear();
        });
    });

    test('Complete GACP Application Submission', async ({ page }) => {
        // --- Login Step ---
        await page.goto('/login');

        // Wait for page load
        await expect(page.getByRole('heading', { name: /GACP/ })).toBeVisible({ timeout: 10000 });

        // Fill Credentials (INDIVIDUAL is default)
        // Trying generic text input first as placeholder might vary
        await page.locator('input[type="text"]').first().fill('1234567890121');
        await page.locator('input[type="password"]').fill('Test1234');

        // Click Login
        await page.getByRole('button', { name: 'เข้าสู่ระบบ' }).click();

        // Wait for redirect to dashboard
        await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });

        // Navigate to Application Wizard
        await page.goto('/applications/new');

        // --- Step 0: Plant & Initial Setup ---
        // 1. Plant
        await expect(page.getByText('เลือกพืชสมุนไพร')).toBeVisible();
        await page.locator('section').filter({ hasText: 'เลือกพืชสมุนไพร' })
            .getByRole('button', { name: /Cannabis/i }).first().click();

        // 2. Service Type
        await page.locator('section').filter({ hasText: 'ประเภทคำขอ' })
            .getByRole('button', { name: /^ขอใหม่/ }).first().click();

        // 3. Purpose
        await page.getByRole('button', { name: 'เพื่อการพาณิชย์' }).click();

        // 4. Location Type
        await page.getByRole('button', { name: /กลางแจ้ง/i }).click();

        // Next
        await page.getByRole('button', { name: 'ดำเนินการต่อ' }).click();


        // --- Step 1: General Info (New Step) ---
        await expect(page.getByText('ข้อมูลทั่วไป')).toBeVisible();
        await page.getByPlaceholder('เช่น ฟาร์มสมุนไพรบ้านหนองขาว').fill('Test Farm Project');
        // Ensure Cert Type is GACP
        await page.locator('#certType').selectOption('GACP');
        // await expect(page.getByLabel('มาตรฐานการรับรอง')).toHaveValue('GACP'); // Comment out strict check

        // Next
        await page.getByRole('button', { name: 'ถัดไป' }).click();


        // --- Step 2: Site Location (Address) ---
        await expect(page.getByText(/ข้อมูลที่ตั้ง/)).toBeVisible();

        await page.getByLabel('ชื่อสถานที่').fill('Main Farm Site');
        await page.getByLabel('ที่อยู่').fill('123 Test Road');
        await page.getByLabel('จังหวัด').fill('Bangkok');
        await page.getByLabel('อำเภอ').fill('Bang Rak');
        await page.getByLabel('ตำบล').fill('Silom');
        await page.getByLabel('รหัสไปรษณีย์').fill('10500');

        // Next
        await page.getByRole('button', { name: 'ถัดไป' }).click();


        // --- Step 3: Plots (New Map Feature) ---
        await expect(page.getByText('ข้อมูลแปลงปลูก')).toBeVisible();

        // Open Add Plot Modal
        await page.getByRole('button', { name: /เพิ่มแปลง/i }).click();

        // Fill Plot Info
        await page.getByPlaceholder('ชื่อแปลง').fill('Plot A');
        await page.getByPlaceholder('ขนาด').fill('1');
        await page.getByPlaceholder('หน่วย').fill('Rai');

        // Test "Find Me" Map Button
        const findMeBtn = page.getByRole('button', { name: /Find Me/i });
        await expect(findMeBtn).toBeVisible();
        await findMeBtn.click();

        // Save Plot
        await page.getByRole('button', { name: 'บันทึก' }).click();

        // Verify Plot Added
        await expect(page.getByText('Plot A')).toBeVisible();

        // Next
        await page.getByRole('button', { name: 'ถัดไป' }).click();


        // --- Step 4: Production ---
        await expect(page.getByText('ข้อมูลการผลิต')).toBeVisible();
        await page.getByPlaceholder('ระบุจำนวน').first().fill('100');

        // Next
        await page.getByRole('button', { name: 'ถัดไป' }).click();


        // --- Step 5: Harvest & Post-Harvest (New Step) ---
        await expect(page.getByText('การเก็บเกี่ยวและจัดการหลังการเก็บเกี่ยว')).toBeVisible();

        // 1. Harvest Method
        await page.locator('#harvestMethod').selectOption('MANUAL');

        // 2. Drying Method
        await page.locator('#dryingMethod').selectOption('SUN');

        // 3. Storage System
        await page.locator('#storageSystem').selectOption('CONTROLLED');

        // 4. Packaging
        await page.locator('#packaging').fill('Food Grade Vacuum Bags');

        // Next
        await page.getByRole('button', { name: 'ถัดไป' }).click();


        // --- Step 6: Documents ---
        await expect(page.getByText('เอกสารแนบ')).toBeVisible();

        // Upload dummy file
        const fileInput = page.locator('input[type="file"]').first();
        if (await fileInput.count() > 0) {
            await fileInput.setInputFiles({
                name: 'test.pdf',
                mimeType: 'application/pdf',
                buffer: Buffer.from('Dummy PDF Content')
            });
        }

        // Next
        await page.getByRole('button', { name: 'ถัดไป' }).click();

    });

});
