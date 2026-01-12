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

    test('Complete GACP Application Submission (Steps 1-12)', async ({ page }) => {
        // --- 1. Login ---
        await page.goto('/login');
        await expect(page.getByRole('heading', { name: /GACP/ })).toBeVisible({ timeout: 10000 });
        // Input fields use placeholder text as accessible name
        await page.getByRole('textbox', { name: /1-2345-67890-12-3/ }).fill('1234567890121');
        await page.getByRole('textbox', { name: /กรอกรหัสผ่าน/ }).fill('Test1234');
        await page.getByRole('button', { name: /เข้าสู่ระบบ/ }).click();
        await expect(page).toHaveURL(/\/farmer\/dashboard/, { timeout: 15000 });

        // Direct navigation to Step 1
        await page.goto('/farmer/applications/new/step/1');
        // Expect H1 in Layout
        await expect(page.locator('h1')).toContainText('ยื่นคำขอใหม่');
        // Expect Step Title
        await expect(page.getByText('พืชสมุนไพร')).toBeVisible();

        // --- 3. Step 1: Plant Selection ---
        // Use filter to find the exact button wrapper containing the text
        await page.locator('button').filter({ hasText: 'กัญชา' }).first().click();

        // Select other mandatory fields
        await page.locator('button').filter({ hasText: 'ขอใหม่' }).first().click();
        await page.locator('button').filter({ hasText: 'เพื่อการพาณิชย์' }).first().click();
        await page.locator('button').filter({ hasText: 'กลางแจ้ง' }).first().click();

        // Click Next
        await page.locator('button').filter({ hasText: 'ดำเนินการต่อ' }).click();

        // --- 4. Step 2: General Info ---
        await page.waitForURL('**/farmer/applications/new/step/2');
        await page.fill('input[placeholder*="ฟาร์มสมุนไพร"]', 'ไร่กัญชาสุขใจ 2024');
        await page.click('button:has-text("ถัดไป")');

        // --- 5. Step 3: Land Info ---
        await page.waitForURL('**/farmer/applications/new/step/3');
        await page.fill('input[placeholder*="ชื่อสถานที่"]', 'Green Valley Farm');
        await page.fill('input[placeholder*="ที่อยู่"]', '123 Test Road');
        await page.selectOption('select.w-full', { label: 'เชียงใหม่ (Chiang Mai)' });
        await page.fill('input[placeholder*="รหัสไปรษณีย์"]', '50000');
        // Select Land Ownership
        await page.click('div:has-text("โฉนดที่ดิน")');
        // Select Location Type
        await page.click('div:has-text("โรงเรือน (Greenhouse)")');
        await page.click('button:has-text("ถัดไป")');

        // --- 6. Step 4: Plots ---
        await page.waitForURL('**/farmer/applications/new/step/4');
        await page.click('button:has-text("เพิ่มแปลงปลูกใหม่")'); // Open Modal
        await page.fill('input[placeholder*="โรงเรือน 1"]', 'GH-01');
        await page.fill('input[type="number"]', '2'); // 2 Rai
        await page.click('button:has-text("บันทึก")'); // Save Modal
        await page.click('button:has-text("ถัดไป")');

        // --- 7. Step 5: Production ---
        await page.waitForURL('**/farmer/applications/new/step/5');
        await page.click('text=ช่อดอก (Flower)'); // Select Part
        await page.selectOption('select:has-text("วิธีการขยายพันธุ์")', 'SEED');
        await page.selectOption('select:has-text("แหล่งที่มา")', 'SELF');
        await page.fill('input[placeholder*="พันธุ์"]', 'CharlotteWeb');
        await page.fill('input[placeholder*="ปริมาณ"]', '100');
        await page.click('button:has-text("ถัดไป")');

        // --- 8. Step 6: Harvest ---
        await page.waitForURL('**/farmer/applications/new/step/6');
        await page.selectOption('#harvestMethod', 'MANUAL');
        await page.selectOption('#dryingMethod', 'OVEN');
        await page.selectOption('#storageSystem', 'CONTROLLED');
        await page.fill('#packaging', 'Vacuum Sealed Bags');
        await page.click('button:has-text("ถัดไป")');

        // --- 9. Step 7: Documents ---
        await page.waitForURL('**/farmer/applications/new/step/7');
        // Upload Dummy
        const fileChooserPromise = page.waitForEvent('filechooser');
        await page.locator('label.cursor-pointer').first().click();
        const fileChooser = await fileChooserPromise;
        await fileChooser.setFiles({
            name: 'test-doc.pdf',
            mimeType: 'application/pdf',
            buffer: Buffer.from('mock pdf')
        });
        await page.waitForTimeout(1000);
        await page.click('button:has-text("ถัดไป")');

        // --- 10. Step 8: Pre-Check ---
        await page.waitForURL('**/farmer/applications/new/step/8');
        const checkboxes = await page.locator('.cursor-pointer').all();
        for (const box of checkboxes) {
            await box.click();
        }
        await page.click('button:has-text("ยืนยัน")');

        // --- 11. Step 9: Review ---
        await page.waitForURL('**/farmer/applications/new/step/9');
        await page.click('button:has-text("ยืนยันและถัดไป")');

        // --- 12. Step 10: Quote ---
        await page.waitForURL('**/farmer/applications/new/step/10');
        await page.click('input[type="checkbox"]');
        await page.click('button:has-text("ออกใบแจ้งหนี้")');

        // --- 13. Step 11: Invoice ---
        await page.waitForURL('**/farmer/applications/new/step/11');
        await page.click('button:has-text("ชำระเงิน")');
        await page.click('button:has-text("จำลองการชำระเงินสำเร็จ")');

        // --- 14. Step 12: Success ---
        await page.waitForURL('**/farmer/applications/new/step/12');
        await expect(page.locator('h2')).toContainText('ส่งคำขอสำเร็จ');
    });

});
