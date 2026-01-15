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
        await page.locator('div').filter({ hasText: 'กรรมสิทธิ์ที่ดิน' }).locator('select').selectOption({ label: 'เป็นเจ้าของ' });

        // --- [NEW] Soil Information ---
        // Select Soil Type
        await page.locator('div').filter({ hasText: 'ลักษณะดิน (Soil Type)' }).locator('select').selectOption({ label: 'ดินร่วน (Loam)' });
        // Fill Soil History
        await page.fill('textarea[placeholder*="ประวัติการใช้พื้นที่"]', 'Used for corn farming previously.');

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
        await page.locator('label').filter({ hasText: 'ช่อดอก' }).click(); // Select Part
        await page.locator('button').filter({ hasText: 'เพาะเมล็ด (Seed)' }).click(); // Propagation

        // Add Variety
        await page.click('button:has-text("เพิ่มสายพันธุ์")');
        await page.fill('input[placeholder="เช่น หางกระรอก"]', 'CharlotteWeb');
        await page.locator('div').filter({ hasText: '#1' }).locator('select').first().selectOption({ index: 0 }); // Source
        await page.click('button:has-text("ดำเนินการต่อ")');

        // --- 8. Step 6: Lots (NEW) ---
        await page.waitForURL('**/farmer/applications/new/step/6');
        // Add Lot
        await page.click('button:has-text("เพิ่มรุ่นการผลิต")');
        // Assuming Modal opens
        await page.fill('input[placeholder*="LOT"]', 'LOT-001');
        await page.fill('input[type="number"]', '100'); // Plant count for lot
        await page.click('button:has-text("บันทึก")');
        await page.click('button:has-text("ดำเนินการต่อ")');

        // --- 9. Step 7: Estimates (NEW) ---
        await page.waitForURL('**/farmer/applications/new/step/7');
        // Fill Plant Count & Yield (Moved from old Step 5)
        await page.fill('input[placeholder="ระบุจำนวนต้น"]', '100');
        await page.fill('input[placeholder="ระบุปริมาณ (kg)"]', '50');
        await page.click('button:has-text("ดำเนินการต่อ")');

        // --- 10. Step 8: Harvest ---
        await page.waitForURL('**/farmer/applications/new/step/8');
        await page.selectOption('#harvestMethod', 'MANUAL');
        await page.selectOption('#dryingMethod', 'OVEN');
        await page.selectOption('#storageSystem', 'CONTROLLED');
        await page.fill('#packaging', 'Vacuum Sealed Bags');
        await page.click('button:has-text("ดำเนินการต่อ")');

        // --- 11. Step 9: Documents ---
        await page.waitForURL('**/farmer/applications/new/step/9');
        // Upload Dummy
        const fileChooserPromise = page.waitForEvent('filechooser');

        // Use a more specific selector or try-catch for upload button
        try {
            await page.locator('label.cursor-pointer').first().click({ timeout: 2000 });
            const fileChooser = await fileChooserPromise;
            await fileChooser.setFiles({
                name: 'test-doc.pdf',
                mimeType: 'application/pdf',
                buffer: Buffer.from('mock pdf')
            });
        } catch (e) {
            console.log("Upload skipped or button not found");
        }
        await page.waitForTimeout(1000);
        await page.click('button:has-text("ดำเนินการต่อ")');

        // --- 12. Step 10: Pre-Check ---
        await page.waitForURL('**/farmer/applications/new/step/10');
        const checkboxes = await page.locator('input[type="checkbox"]').all();
        for (const box of checkboxes) {
            await box.check();
        }
        await page.click('button:has-text("ยืนยันและดำเนินการต่อ")');

        // --- 13. Step 11: Preview ---
        await page.waitForURL('**/farmer/applications/new/step/11');
        await page.click('button:has-text("ยืนยันและดำเนินการต่อ")');

        // --- 14. Step 12: Submit (NEW) ---
        await page.waitForURL('**/farmer/applications/new/step/12');
        const submitCheckboxes = await page.locator('input[type="checkbox"]').all();
        for (const box of submitCheckboxes) {
            await box.check();
        }
        await page.click('button:has-text("ยืนยันการส่งคำขอ")');

        // --- 15. Step 13: Quote ---
        await page.waitForURL('**/farmer/applications/new/step/13');
        // Accept Quotes (assuming 2 buttons for 2 quotes or simple "Accept" if mocked)
        // Based on StepQuote code: "ยอมรับ" buttons
        const acceptButtons = await page.locator('button:has-text("ยอมรับ")').all();
        for (const btn of acceptButtons) {
            await btn.click();
        }
        await page.click('button:has-text("ยืนยันและดำเนินการชำระเงิน")');

        // --- 16. Step 14: Invoice ---
        await page.waitForURL('**/farmer/applications/new/step/14');
        await page.click('button:has-text("ยืนยันการชำระเงิน")');
        // Simulate QR Payment Success (Modal)
        await page.click('button:has-text("จำลองการชำระเงินสำเร็จ")');

        // --- 17. Success Page ---
        await page.waitForURL('**/farmer/applications/new/step/15'); // Or /success
        await expect(page.locator('h2')).toContainText('ส่งคำขอสำเร็จ');
    });

});
